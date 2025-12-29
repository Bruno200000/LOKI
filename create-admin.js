import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tcvvczdwchowscaaeezd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans le fichier .env');
  console.log('📝 Ajoutez SUPABASE_SERVICE_ROLE_KEY=your_service_role_key dans votre .env');
  process.exit(1);
}

// Créer le client Supabase avec la clé de service (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  try {
    console.log('🚀 Création de l\'administrateur...');

    // 1. Créer l'utilisateur via l'API Admin
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'katchabruno52@gmail.com',
      password: '44390812',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrateur LOKI'
      }
    });

    if (userError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', userError);
      return;
    }

    if (!userData.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Utilisateur créé:', userData.user.id);

    // 2. Attendre que le trigger crée le profil
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Mettre à jour le profil avec le rôle admin
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        full_name: 'Administrateur LOKI'
      })
      .eq('id', userData.user.id);

    if (profileError) {
      console.error('❌ Erreur lors de la mise à jour du profil:', profileError);
      return;
    }

    console.log('✅ Profil mis à jour avec le rôle admin');

    // 4. Vérifier que tout est correct avec une jointure
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        created_at,
        auth_users!inner(email)
      `)
      .eq('id', userData.user.id)
      .single();

    if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError);
      return;
    }

    console.log('✅ Administrateur créé avec succès!');
    console.log('📋 Informations:');
    console.log(`   Email: ${profile.auth_users.email}`);
    console.log(`   Nom: ${profile.full_name}`);
    console.log(`   Rôle: ${profile.role}`);
    console.log(`   ID: ${profile.id}`);
    console.log('');
    console.log('🔐 Identifiants de connexion:');
    console.log(`   Email: katchabruno52@gmail.com`);
    console.log(`   Mot de passe: 44390812`);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
createAdmin();
