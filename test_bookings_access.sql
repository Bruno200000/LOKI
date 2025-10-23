-- 🧪 Test direct de l'accès aux réservations
-- Exécutez ce script dans Supabase pour tester les réservations

-- 1. Test simple sans politiques
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- 2. Tester l'accès direct
SELECT
  '📋 TEST BOOKINGS - SANS RLS' as test,
  '' as details
UNION ALL
SELECT
  'Nombre de réservations',
  COUNT(*)::text || ' réservations trouvées'
FROM public.bookings
UNION ALL
SELECT
  'Statuts disponibles',
  string_agg(DISTINCT status, ', ') || ' (' || COUNT(DISTINCT status)::text || ' statuts)'
FROM public.bookings
UNION ALL
SELECT
  'Plage de dates',
  'Du ' || MIN(created_at)::date || ' au ' || MAX(created_at)::date
FROM public.bookings;

-- 3. Afficher quelques réservations
SELECT
  '🏠 EXEMPLES DE RÉSERVATIONS' as info,
  '' as details
UNION ALL
SELECT
  'ID: ' || LEFT(id, 8) || '...',
  'Statut: ' || status || ' | Loyer: ' || monthly_rent || ' FCFA | Créée: ' || created_at::date
FROM public.bookings
ORDER BY created_at DESC
LIMIT 5;

-- 4. Réactiver RLS avec politiques simples
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "bookings_auth_select" ON public.bookings;

-- Créer une politique simple
CREATE POLICY "bookings_simple_access" ON public.bookings
FOR SELECT
USING (true);

-- 5. Tester avec RLS activé
SELECT
  '✅ TEST BOOKINGS - AVEC RLS SIMPLE' as test,
  '' as details
UNION ALL
SELECT
  'Nombre de réservations',
  COUNT(*)::text || ' réservations trouvées'
FROM public.bookings
UNION ALL
SELECT
  'Statuts disponibles',
  string_agg(DISTINCT status, ', ') || ' (' || COUNT(DISTINCT status)::text || ' statuts)'
FROM public.bookings
UNION ALL
SELECT
  'Plage de dates',
  'Du ' || MIN(created_at)::date || ' au ' || MAX(created_at)::date
FROM public.bookings;

-- 6. Afficher les politiques finales
SELECT
  '📋 POLITIQUES RLS ACTUELLES' as info,
  '' as details
UNION ALL
SELECT
  tablename,
  COUNT(*)::text || ' politiques: ' || string_agg(policyname, ', ') as details
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'bookings'
GROUP BY tablename;
