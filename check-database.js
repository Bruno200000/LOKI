import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tcvvczdwchowscaaeezd.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseData() {
  console.log('🔍 Vérification des données dans la base de données...\n');

  try {
    // Vérifier les profils
    console.log('1️⃣ Vérification des profils:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .limit(5);

    if (profilesError) {
      console.error('❌ Erreur profiles:', profilesError);
    } else {
      console.log('✅ Profils trouvés:', profiles?.length || 0);
      profiles?.forEach(p => console.log(`   - ${p.role}: ${p.full_name || 'N/A'} (${p.id.slice(0, 8)}...)`));
    }

    console.log('\n2️⃣ Vérification des réservations:');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, created_at, monthly_rent')
      .limit(5);

    if (bookingsError) {
      console.error('❌ Erreur bookings:', bookingsError);
    } else {
      console.log('✅ Réservations trouvées:', bookings?.length || 0);
      bookings?.forEach(b => console.log(`   - ${b.status}: ${b.monthly_rent} FCFA (${b.id.slice(0, 8)}...)`));
    }

    console.log('\n3️⃣ Vérification des maisons:');
    const { data: houses, error: housesError } = await supabase
      .from('houses')
      .select('id, title, status, price')
      .limit(5);

    if (housesError) {
      console.error('❌ Erreur houses:', housesError);
    } else {
      console.log('✅ Maisons trouvées:', houses?.length || 0);
      houses?.forEach(h => console.log(`   - ${h.status}: ${h.title} (${h.price} FCFA)`));
    }

    console.log('\n4️⃣ Vérification des paiements:');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, status, payment_type')
      .limit(5);

    if (paymentsError) {
      console.error('❌ Erreur payments:', paymentsError);
    } else {
      console.log('✅ Paiements trouvés:', payments?.length || 0);
      payments?.forEach(p => console.log(`   - ${p.payment_type}: ${p.amount} FCFA (${p.status})`));
    }

    console.log('\n📋 Récapitulatif:');
    console.log(`- Profils: ${profiles?.length || 0} utilisateurs`);
    console.log(`- Maisons: ${houses?.length || 0} propriétés`);
    console.log(`- Réservations: ${bookings?.length || 0} réservations`);
    console.log(`- Paiements: ${payments?.length || 0} transactions`);

    if (profiles && profiles.length > 0) {
      const owners = profiles.filter(p => p.role === 'owner').length;
      const tenants = profiles.filter(p => p.role === 'tenant').length;
      const admins = profiles.filter(p => p.role === 'admin').length;
      console.log(`- Répartition: ${owners} propriétaires, ${tenants} locataires, ${admins} administrateurs`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
checkDatabaseData();
