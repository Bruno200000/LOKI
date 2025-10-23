-- 🛡️ Politiques RLS (Row Level Security) pour AdminDashboard LOKI
-- Ces politiques permettent à l'administrateur de lire toutes les données

-- =============================================
-- 1️⃣ PROFILS - Accès complet pour les administrateurs
-- =============================================

-- Politique de lecture pour les profils (tous les rôles)
CREATE POLICY "Admin can view all profiles" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique d'insertion pour les profils (si nécessaire)
CREATE POLICY "Admin can insert profiles" ON public.profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour pour les profils
CREATE POLICY "Admin can update profiles" ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression pour les profils
CREATE POLICY "Admin can delete profiles" ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 2️⃣ RÉSERVATIONS - Accès complet pour les administrateurs
-- =============================================

-- Politique de lecture pour les réservations
CREATE POLICY "Admin can view all bookings" ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique d'insertion pour les réservations
CREATE POLICY "Admin can insert bookings" ON public.bookings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour pour les réservations
CREATE POLICY "Admin can update bookings" ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression pour les réservations
CREATE POLICY "Admin can delete bookings" ON public.bookings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 3️⃣ MAISONS - Accès complet pour les administrateurs
-- =============================================

-- Politique de lecture pour les maisons
CREATE POLICY "Admin can view all houses" ON public.houses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique d'insertion pour les maisons
CREATE POLICY "Admin can insert houses" ON public.houses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour pour les maisons
CREATE POLICY "Admin can update houses" ON public.houses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression pour les maisons
CREATE POLICY "Admin can delete houses" ON public.houses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 4️⃣ PAIEMENTS - Accès complet pour les administrateurs
-- =============================================

-- Politique de lecture pour les paiements
CREATE POLICY "Admin can view all payments" ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique d'insertion pour les paiements
CREATE POLICY "Admin can insert payments" ON public.payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour pour les paiements
CREATE POLICY "Admin can update payments" ON public.payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression pour les paiements
CREATE POLICY "Admin can delete payments" ON public.payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 5️⃣ AVIS/REVIEWS - Accès pour les administrateurs
-- =============================================

-- Politique de lecture pour les avis
CREATE POLICY "Admin can view all reviews" ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression pour les avis (modération)
CREATE POLICY "Admin can delete reviews" ON public.reviews
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 6️⃣ ACTIVATION/DÉSACTIVATION DES POLITIQUES
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7️⃣ POLITIQUES POUR LES UTILISATEURS NORMAUX
-- =============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Les propriétaires peuvent voir leurs propres maisons
CREATE POLICY "Owners can view own houses" ON public.houses
FOR SELECT
USING (owner_id = auth.uid());

-- Les propriétaires peuvent gérer leurs propres maisons
CREATE POLICY "Owners can manage own houses" ON public.houses
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Les locataires et propriétaires peuvent voir leurs réservations
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT
USING (
  tenant_id = auth.uid() OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Les utilisateurs peuvent voir leurs paiements
CREATE POLICY "Users can view own payments" ON public.payments
FOR SELECT
USING (
  paid_by = auth.uid() OR
  paid_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 8️⃣ VÉRIFICATION DES POLITIQUES
-- =============================================

-- Vérifier que les politiques sont créées
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 9️⃣ COMMENTAIRES ET EXPLICATIONS
-- =============================================

/*
📋 EXPLICATIONS DES POLITIQUES :

1️⃣ ACCÈS ADMINISTRATEUR :
   - L'admin peut TOUT voir et TOUT modifier
   - Vérification via : role = 'admin' dans profiles

2️⃣ ACCÈS PROPRIÉTAIRE :
   - Peut gérer ses propres maisons (owner_id = auth.uid())
   - Peut voir les réservations de ses maisons
   - Peut voir les paiements liés à ses maisons

3️⃣ ACCÈS LOCATAIRE :
   - Peut voir son profil
   - Peut voir ses réservations
   - Peut voir ses paiements

4️⃣ SÉCURITÉ :
   - RLS activé sur toutes les tables sensibles
   - Vérification d'identité via auth.uid()
   - Contrôle granulaire des permissions

🔐 UTILISATION :
- Exécutez ce script dans Supabase SQL Editor
- L'admin avec email katchabruno52@gmail.com aura accès complet
- Les autres utilisateurs auront un accès limité à leurs données
*/
