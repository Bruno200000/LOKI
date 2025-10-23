-- ✅ Script de vérification finale - Test des corrections booking.id.slice()

-- =============================================
-- 1️⃣ Test des types de données des IDs
-- =============================================

SELECT
  '🔍 TEST DES TYPES D\'ID' as test,
  '' as details
UNION ALL
SELECT
  'Type de booking.id',
  pg_typeof(id)::text || ' (attendu: bigint)' as result
FROM public.bookings
LIMIT 1
UNION ALL
SELECT
  'Type de house_id',
  pg_typeof(house_id)::text || ' (attendu: bigint)' as result
FROM public.bookings
LIMIT 1
UNION ALL
SELECT
  'Type de tenant_id',
  pg_typeof(tenant_id)::text || ' (attendu: uuid)' as result
FROM public.bookings
LIMIT 1;

-- =============================================
-- 2️⃣ Test de conversion en string
-- =============================================

SELECT
  '🧪 TEST DE CONVERSION' as test,
  '' as details
UNION ALL
SELECT
  'booking.id as string',
  LEFT(id::text, 8) || '...' as result
FROM public.bookings
LIMIT 1
UNION ALL
SELECT
  'house_id as string',
  LEFT(house_id::text, 8) || '...' as result
FROM public.bookings
LIMIT 1
UNION ALL
SELECT
  'tenant_id as string',
  LEFT(tenant_id::text, 8) || '...' as result
FROM public.bookings
LIMIT 1;

-- =============================================
-- 3️⃣ Vérification des données de test
-- =============================================

SELECT
  '📊 DONNÉES DISPONIBLES' as info,
  COUNT(*)::text || ' réservations dans la base' as result
FROM public.bookings;

-- Afficher un exemple avec les bonnes colonnes
SELECT
  '📋 EXEMPLE DE RÉSERVATION' as info,
  '' as details
UNION ALL
SELECT
  'ID: ' || LEFT(id::text, 12),
  'Statut: ' || status || ' | Loyer: ' || monthly_rent || ' | Début: ' || start_date
FROM public.bookings
ORDER BY created_at DESC
LIMIT 1;

-- =============================================
-- 4️⃣ Instructions pour l'utilisateur
-- =============================================

/*
🚀 CORRECTIONS APPORTÉES :

✅ Problème identifié :
   - Les IDs sont des bigint/uuid, pas des strings
   - JavaScript: booking.id.slice() → ERREUR !

✅ Corrections apportées :
   - String(booking.id).slice(0, 8) pour les bigint
   - String(house_id).slice(0, 8) pour les bigint
   - String(tenant_id).slice(0, 8) pour les uuid
   - String(owner_id).slice(0, 8) pour les uuid
   - String(transaction.id).slice(0, 8) pour les transactions

✅ Fichiers modifiés :
   - AdminDashboard.tsx : Toutes les références .slice() corrigées
   - Interface Booking mise à jour pour correspondre à la DB
   - Statuts corrigés : 'cancelled' au lieu de 'active'

🔧 Testez maintenant :
1. Actualisez la page (F5)
2. Allez sur l'onglet "Réservations"
3. Plus d'erreur "booking.id.slice is not a function"
4. Les réservations devraient s'afficher correctement

Si vous avez encore des erreurs :
- Vérifiez la console (F12) pour d'autres erreurs similaires
- Exécutez ce script pour diagnostiquer les types de données
*/
