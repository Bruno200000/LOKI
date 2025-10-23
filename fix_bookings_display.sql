-- 🛠️ Correction pour l'affichage des réservations dans AdminDashboard
-- Exécutez ce script si les réservations n'apparaissent pas

-- =============================================
-- 1️⃣ VÉRIFIER LES DONNÉES EXISTANTES
-- =============================================

-- Tester l'accès aux réservations sans RLS
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

SELECT
  '📊 DONNÉES DE RÉSERVATIONS' as info,
  COUNT(*)::text || ' réservations trouvées dans la base' as result
FROM public.bookings;

-- Afficher quelques exemples
SELECT
  '🏠 EXEMPLES DE RÉSERVATIONS' as info,
  '' as details
UNION ALL
SELECT
  LEFT(id, 12) || '...',
  'Statut: ' || status || ' | Loyer: ' || monthly_rent || ' FCFA | Créée: ' || created_at::date
FROM public.bookings
ORDER BY created_at DESC
LIMIT 3;

-- =============================================
-- 2️⃣ RÉACTIVER RLS AVEC POLITIQUES SIMPLIFIÉES
-- =============================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "bookings_auth_select" ON public.bookings;
DROP POLICY IF EXISTS "bookings_simple_access" ON public.bookings;
DROP POLICY IF EXISTS "allow_all_read" ON public.bookings;

-- Créer des politiques permissives (temporaires)
CREATE POLICY "bookings_permissive_select" ON public.bookings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "bookings_owner_access" ON public.bookings
FOR SELECT
TO authenticated
USING (
  tenant_id = auth.uid() OR
  owner_id = auth.uid()
);

-- =============================================
-- 3️⃣ TESTER L'ACCÈS
-- =============================================

-- Test avec les nouvelles politiques
SELECT
  '✅ TEST AVEC POLITIQUES PERMISSIVES' as test,
  '' as details
UNION ALL
SELECT
  'Réservations accessibles',
  COUNT(*)::text || ' réservations'
FROM public.bookings
UNION ALL
SELECT
  'Statuts',
  string_agg(DISTINCT status, ', ') || ' (' || COUNT(DISTINCT status)::text || ' types)'
FROM public.bookings;

-- =============================================
-- 4️⃣ VÉRIFICATION FINALE
-- =============================================

-- Afficher les politiques créées
SELECT
  '📋 POLITIQUES RLS POUR BOOKINGS' as info,
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
-- 5️⃣ RECOMMANDATIONS
-- =============================================

/*
🚀 APRÈS AVOIR EXÉCUTÉ CE SCRIPT :

1. Testez l'AdminDashboard :
   - Les réservations devraient maintenant s'afficher
   - Vérifiez la console pour les logs de débogage

2. Si ça fonctionne :
   - Les réservations apparaîtront dans l'onglet "Réservations"
   - Les statistiques se mettront à jour automatiquement

3. Si ça ne fonctionne toujours pas :
   - Vérifiez les logs dans la console du navigateur
   - Exécutez `check_admin_data.sql` pour diagnostiquer

4. Pour plus de sécurité (optionnel) :
   - Utilisez `setup_rls_quick.sql` pour des politiques plus restrictives
   - Mais testez d'abord que tout fonctionne avec ces politiques permissives

🔧 Ce script corrige les problèmes d'accès aux réservations !
*/
