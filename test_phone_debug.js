// Script de test pour vérifier l'enregistrement du numéro de téléphone
// À exécuter dans la console du navigateur

async function testPhoneRegistration() {
  console.log('🧪 Début du test d\'enregistrement du téléphone...');
  
  // Test 1: Vérifier si le profil actuel a un numéro de téléphone
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ Utilisateur connecté:', user.email);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('❌ Erreur récupération profil:', error);
      } else {
        console.log('✅ Profil récupéré:', profile);
        console.log('📞 Téléphone dans profil:', profile.phone);
        console.log('📧 Email dans profil:', profile.email);
      }
    }
  } catch (err) {
    console.error('❌ Erreur test:', err);
  }
  
  // Test 2: Simuler une mise à jour du téléphone (via metadata -> trigger)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const testPhone = '+225 07 00 00 00 00';

      console.log('🔄 Test de mise à jour des métadonnées avec:', testPhone);

      // Mettre à jour les métadonnées (cela doit déclencher le trigger côté DB qui upserte profiles)
      const { error: authError } = await supabase.auth.updateUser({
        data: { phone: testPhone }
      });

      if (authError) {
        console.error('❌ Erreur mise à jour auth:', authError);
      } else {
        console.log('✅ Métadonnées auth mises à jour');

        // Poller la table profiles pour vérifier que le trigger a copié le numéro
        let synced = false;
        for (let i = 0; i < 12; i++) { // ~ up to 6 seconds
          await new Promise(r => setTimeout(r, 500));
          const { data: profile, error: pErr } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', user.id)
            .maybeSingle();

          if (pErr) {
            console.warn('Tentative', i + 1, 'erreur lecture profile:', pErr.message || pErr);
            continue;
          }

          if (profile && profile.phone === testPhone) {
            console.log('✅ Le numéro a été propagé à profiles via le trigger:', profile.phone);
            synced = true;
            break;
          }

          console.log('⏳ En attente de la propagation... (tentative', i + 1 + ')');
        }

        if (!synced) {
          console.warn('⚠️ Le trigger n\'a pas propagé le numéro. Tentative de mise à jour directe pour debugging.');
          const { data, error } = await supabase
            .from('profiles')
            .update({ phone: testPhone })
            .eq('id', user.id)
            .select()
            .single();

          if (error) {
            console.error('❌ Erreur mise à jour profil (directe):', error);
          } else {
            console.log('✅ Profil mis à jour (direct):', data);
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Erreur test mise à jour:', err);
  }
  
  console.log('🏁 Test terminé');
}

// Fonction pour vérifier les métadonnées utilisateur
async function checkUserMetadata() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('📋 Métadonnées utilisateur:', user.user_metadata);
      console.log('📞 Téléphone dans métadonnées:', user.user_metadata?.phone);
      console.log('🏙 Ville dans métadonnées:', user.user_metadata?.city);
    }
  } catch (err) {
    console.error('❌ Erreur vérification métadonnées:', err);
  }
}

// Exporter les fonctions pour utilisation manuelle
window.testPhoneRegistration = testPhoneRegistration;
window.checkUserMetadata = checkUserMetadata;

console.log('🧪 Fonctions de test chargées. Utilisez:');
console.log('  testPhoneRegistration() - pour tester l\'enregistrement du téléphone');
console.log('  checkUserMetadata() - pour vérifier les métadonnées');
