-- 🛡️ Installation rapide des politiques RLS AdminDashboard
-- Copiez-collez ce script dans Supabase SQL Editor

-- Activer RLS sur les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes (si nécessaire)
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- Politiques pour PROFILES
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin can insert profiles" ON public.profiles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete profiles" ON public.profiles FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Supprimer les politiques existantes pour BOOKINGS
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Politiques pour BOOKINGS
CREATE POLICY "Admin can view all bookings" ON public.bookings FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (tenant_id = auth.uid() OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Supprimer les politiques existantes pour HOUSES
DROP POLICY IF EXISTS "Admin can view all houses" ON public.houses;
DROP POLICY IF EXISTS "Owners can view own houses" ON public.houses;
DROP POLICY IF EXISTS "Owners can manage own houses" ON public.houses;

-- Politiques pour HOUSES
CREATE POLICY "Admin can view all houses" ON public.houses FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Owners can view own houses" ON public.houses FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Owners can manage own houses" ON public.houses FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Supprimer les politiques existantes pour PAYMENTS
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Politiques pour PAYMENTS
CREATE POLICY "Admin can view all payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (paid_by = auth.uid() OR paid_to = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politiques pour REVIEWS (si la table existe)
DROP POLICY IF EXISTS "Admin can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can delete reviews" ON public.reviews;

CREATE POLICY "Admin can view all reviews" ON public.reviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete reviews" ON public.reviews FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Vérification finale
SELECT
  'profiles' as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'profiles'
UNION ALL
SELECT
  'bookings' as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'bookings'
UNION ALL
SELECT
  'houses' as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'houses'
UNION ALL
SELECT
  'payments' as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'payments';
