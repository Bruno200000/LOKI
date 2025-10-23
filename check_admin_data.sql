-- 🧪 Script de test pour diagnostiquer les données AdminDashboard
-- Exécutez ce script dans Supabase pour voir si les données existent

-- =============================================
-- 1️⃣ VÉRIFIER LES DONNÉES DANS CHAQUE TABLE
-- =============================================

SELECT
  '📊 DONNÉES DANS LA BASE' as info,
  '' as details
UNION ALL
SELECT
  'profiles' as table_name,
  COUNT(*)::text || ' utilisateurs trouvés' as result
FROM public.profiles
UNION ALL
SELECT
  'bookings' as table_name,
  COUNT(*)::text || ' réservations trouvées' as result
FROM public.bookings
UNION ALL
SELECT
  'houses' as table_name,
  COUNT(*)::text || ' maisons trouvées' as result
FROM public.houses
UNION ALL
SELECT
  'payments' as table_name,
  COUNT(*)::text || ' paiements trouvés' as result
FROM public.payments;

-- =============================================
-- 2️⃣ DÉTAILS DES PROFILS
-- =============================================

SELECT
  '👥 DÉTAILS DES UTILISATEURS' as info,
  '' as details
UNION ALL
SELECT
  'ID: ' || LEFT(id, 8) || '...',
  'Nom: ' || COALESCE(full_name, 'N/A') || ' | Rôle: ' || role || ' | Créé: ' || created_at::date
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- 3️⃣ DÉTAILS DES RÉSERVATIONS
-- =============================================

SELECT
  '🏠 DÉTAILS DES RÉSERVATIONS' as info,
  '' as details
UNION ALL
SELECT
  'ID: ' || LEFT(id, 8) || '...',
  'Statut: ' || status || ' | Loyer: ' || monthly_rent || ' FCFA | Créée: ' || created_at::date
FROM public.bookings
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- 4️⃣ DÉTAILS DES MAISONS
-- =============================================

SELECT
  '🏡 DÉTAILS DES MAISONS' as info,
  '' as details
UNION ALL
SELECT
  'ID: ' || LEFT(id, 8) || '...',
  'Titre: ' || COALESCE(title, 'N/A') || ' | Statut: ' || status || ' | Prix: ' || COALESCE(price::text, 'N/A') || ' FCFA'
FROM public.houses
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- 5️⃣ DÉTAILS DES PAIEMENTS
-- =============================================

SELECT
  '💰 DÉTAILS DES PAIEMENTS' as info,
  '' as details
UNION ALL
SELECT
  'ID: ' || LEFT(id, 8) || '...',
  'Montant: ' || amount || ' FCFA | Type: ' || payment_type || ' | Statut: ' || status
FROM public.payments
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- 6️⃣ STATISTIQUES RAPIDES
-- =============================================

SELECT
  '📈 STATISTIQUES' as info,
  '' as details
UNION ALL
SELECT
  'Propriétaires',
  COUNT(*)::text || ' utilisateurs'
FROM public.profiles
WHERE role = 'owner'
UNION ALL
SELECT
  'Locataires',
  COUNT(*)::text || ' utilisateurs'
FROM public.profiles
WHERE role = 'tenant'
UNION ALL
SELECT
  'Administrateurs',
  COUNT(*)::text || ' utilisateurs'
FROM public.profiles
WHERE role = 'admin'
UNION ALL
SELECT
  'Maisons disponibles',
  COUNT(*)::text || ' maisons'
FROM public.houses
WHERE status = 'available'
UNION ALL
SELECT
  'Réservations confirmées',
  COUNT(*)::text || ' réservations'
FROM public.bookings
WHERE status = 'confirmed'
UNION ALL
SELECT
  'Commissions totales',
  COALESCE(SUM(amount)::text, '0') || ' FCFA'
FROM public.payments
WHERE payment_type = 'commission';
