-- 🔍 Vérification finale de la structure des réservations AdminDashboard

-- =============================================
-- 1️⃣ Vérifier la structure de la table bookings
-- =============================================

SELECT
  '🏗️ STRUCTURE DE LA TABLE BOOKINGS' as info,
  '' as details
UNION ALL
SELECT
  column_name,
  data_type || ' (' || COALESCE(character_maximum_length::text, numeric_precision::text, '') || ') ' ||
  CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END ||
  CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END as details
FROM information_schema.columns
WHERE table_name = 'bookings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 2️⃣ Vérifier les données de test
-- =============================================

SELECT
  '📊 DONNÉES DE RÉSERVATIONS' as info,
  COUNT(*)::text || ' réservations trouvées' as result
FROM public.bookings;

-- Afficher quelques exemples avec les bonnes colonnes
SELECT
  '📋 EXEMPLES DE RÉSERVATIONS' as info,
  '' as details
UNION ALL
SELECT
  LEFT(id::text, 12) || '...',
  'Statut: ' || status || ' | Loyer: ' || monthly_rent || ' FCFA | Début: ' || start_date
FROM public.bookings
ORDER BY created_at DESC
LIMIT 3;

-- =============================================
-- 3️⃣ Vérifier les politiques RLS
-- =============================================

SELECT
  '🔐 POLITIQUES RLS POUR BOOKINGS' as info,
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
-- 4️⃣ Test de l'accès pour l'admin
-- =============================================

-- Test simple pour vérifier l'accès
SELECT
  '✅ TEST D\'ACCÈS ADMIN' as test,
  COUNT(*)::text || ' réservations visibles' as result
FROM public.bookings;

-- =============================================
-- 5️⃣ Instructions pour l'utilisateur
-- =============================================

/*
🚀 AMÉLIORATIONS APPORTÉES À L'AFFICHAGE DES RÉSERVATIONS :

✅ Colonnes de la requête corrigées :
   - Utilise 'start_date' au lieu de 'booking_date'
   - Inclut toutes les colonnes nécessaires

✅ Interface TypeScript mise à jour :
   - Correspond à la structure réelle de la base
   - Supprime les jointures complexes problématiques

✅ Affichage amélioré :
   - Ajout d'une colonne "Période" avec start_date et move_in_date
   - Meilleure présentation des IDs avec des libellés
   - Statuts corrigés : 'cancelled' au lieu de 'active'
   - Logs de débogage détaillés ajoutés

✅ Structure du tableau améliorée :
   - Colonne "Maison" pour identifier la propriété
   - Colonne "Locataire" et "Propriétaire" avec libellés
   - Colonne "Période" pour les dates importantes
   - Statuts avec codes couleur appropriés

🔧 Testez maintenant l'AdminDashboard :
- Les réservations devraient s'afficher correctement
- L'onglet "Réservations" devrait montrer un tableau complet
- Les informations devraient être lisibles et bien formatées

Si les réservations n'apparaissent toujours pas :
1. Vérifiez la console du navigateur (F12) pour les logs 🔍
2. Exécutez ce script pour diagnostiquer les données
3. Vérifiez que des réservations existent dans la base
*/
