-- 🏠 Script pour vérifier l'accès aux noms des utilisateurs et maisons dans les réservations

-- =============================================
-- 1️⃣ Vérifier les politiques RLS pour les réservations
-- =============================================

SELECT
  '🔐 POLITIQUES RLS - BOOKINGS' as info,
  '' as details
UNION ALL
SELECT
  policyname,
  cmd || ' - ' || COALESCE(qual, 'ALL') as details
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'bookings'
ORDER BY policyname;

-- =============================================
-- 2️⃣ Vérifier les politiques RLS pour les profils
-- =============================================

SELECT
  '🔐 POLITIQUES RLS - PROFILES' as info,
  '' as details
UNION ALL
SELECT
  policyname,
  cmd || ' - ' || COALESCE(qual, 'ALL') as details
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY policyname;

-- =============================================
-- 3️⃣ Vérifier les politiques RLS pour les maisons
-- =============================================

SELECT
  '🔐 POLITIQUES RLS - HOUSES' as info,
  '' as details
UNION ALL
SELECT
  policyname,
  cmd || ' - ' || COALESCE(qual, 'ALL') as details
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'houses'
ORDER BY policyname;

-- =============================================
-- 4️⃣ Test d'accès direct aux données
-- =============================================

-- Test des réservations
SELECT
  '📊 TEST - RÉSERVATIONS' as test,
  COUNT(*)::text || ' réservations trouvées' as result
FROM public.bookings;

-- Test des profils
SELECT
  '📊 TEST - PROFILS' as test,
  COUNT(*)::text || ' profils trouvés' as result
FROM public.profiles;

-- Test des maisons
SELECT
  '📊 TEST - MAISONS' as test,
  COUNT(*)::text || ' maisons trouvées' as result
FROM public.houses;

-- =============================================
-- 5️⃣ Test des jointures manuelles
-- =============================================

-- Test de récupération des données combinées
SELECT
  '🔗 TEST - DONNÉES COMBINÉES' as test,
  '' as details
UNION ALL
SELECT
  'Exemple réservation avec noms',
  'ID: ' || LEFT(b.id::text, 8) || ' | Locataire: ' || COALESCE(p1.full_name, LEFT(p1.id::text, 8)) ||
  ' | Propriétaire: ' || COALESCE(p2.full_name, LEFT(p2.id::text, 8)) ||
  ' | Maison: ' || COALESCE(h.title, LEFT(h.id::text, 8))
FROM public.bookings b
LEFT JOIN public.profiles p1 ON p1.id = b.tenant_id
LEFT JOIN public.profiles p2 ON p2.id = b.owner_id
LEFT JOIN public.houses h ON h.id = b.house_id
ORDER BY b.created_at DESC
LIMIT 1;

-- =============================================
-- 6️⃣ Instructions pour l'utilisateur
-- =============================================

/*
🚀 AMÉLIORATIONS APPORTÉES À L'AFFICHAGE DES RÉSERVATIONS :

✅ Nouvelles fonctionnalités :
   - Affichage du nom du locataire au lieu de l'ID
   - Affichage du nom du propriétaire au lieu de l'ID
   - Affichage du titre de la maison au lieu de l'ID
   - Fallback gracieux si les noms ne sont pas disponibles

✅ Code modifié :
   - fetchBookingsWithNames() : Récupère les données avec jointures
   - Interface Booking mise à jour avec les champs de jointures
   - Affichage conditionnel : nom si disponible, sinon ID tronqué

✅ Structure du tableau améliorée :
   - Colonne "Maison" : Affiche le titre ou "Maison ID: xxx..."
   - Colonne "Locataire" : Affiche le nom ou "ID: xxx..."
   - Colonne "Propriétaire" : Affiche le nom ou "ID: xxx..."
   - Labels informatifs pour clarifier le type d'information

🔧 Pour que cela fonctionne :
1. Les politiques RLS doivent permettre l'accès aux tables profiles et houses
2. Les utilisateurs et maisons doivent exister dans la base de données
3. Si les noms n'apparaissent pas, vérifiez les politiques RLS

Exécutez ce script pour diagnostiquer les permissions et les données disponibles.
*/
