-- 🛡️ Politiques RLS (Row Level Security) améliorées pour LOKI
-- Version sécurisée avec des contraintes strictes

-- =============================================
-- 1️⃣ ACTIVATION RLS SUR TOUTES LES TABLES
-- =============================================

-- S'assurer que RLS est activé sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2️⃣ PROFILS - Politiques strictes
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- Politique de lecture (utilisateur + admin)
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique d'insertion (auto via trigger + admin)
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour (utilisateur + admin)
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 3️⃣ MAISONS - Politiques sécurisées
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view available houses" ON public.houses;
DROP POLICY IF EXISTS "Owners can manage their own houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can view all houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can insert houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can update houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can delete houses" ON public.houses;

-- Politique de lecture (public + propriétaire + admin)
CREATE POLICY "houses_select_policy" ON public.houses
FOR SELECT
USING (
  status = 'available' OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique d'insertion (propriétaire + admin)
CREATE POLICY "houses_insert_policy" ON public.houses
FOR INSERT
WITH CHECK (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour (propriétaire + admin)
CREATE POLICY "houses_update_policy" ON public.houses
FOR UPDATE
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression (propriétaire + admin)
CREATE POLICY "houses_delete_policy" ON public.houses
FOR DELETE
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 4️⃣ RÉSERVATIONS - Politiques très strictes
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Tenants can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tenants can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tenants can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can delete bookings" ON public.bookings;

-- Politique de lecture (locataire + propriétaire + admin)
CREATE POLICY "bookings_select_policy" ON public.bookings
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

-- Politique d'insertion (locataire seulement)
CREATE POLICY "bookings_insert_policy" ON public.bookings
FOR INSERT
WITH CHECK (
  tenant_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.houses
    WHERE id = house_id
    AND status = 'available'
  )
);

-- Politique de mise à jour (locataire + propriétaire + admin)
CREATE POLICY "bookings_update_policy" ON public.bookings
FOR UPDATE
USING (
  tenant_id = auth.uid() OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  tenant_id = auth.uid() OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 5️⃣ PAIEMENTS - Politiques ultra-sécurisées
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can delete payments" ON public.payments;

-- Politique de lecture (utilisateur impliqué + admin)
CREATE POLICY "payments_select_policy" ON public.payments
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

-- Politique d'insertion (utilisateur + admin)
CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT
WITH CHECK (
  paid_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de mise à jour (admin seulement pour les paiements)
CREATE POLICY "payments_update_policy" ON public.payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 6️⃣ AVIS/REVIEWS - Politiques modérées
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Tenants can create reviews for their bookings" ON public.reviews;
DROP POLICY IF EXISTS "Tenants can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can delete reviews" ON public.reviews;

-- Politique de lecture (tout le monde)
CREATE POLICY "reviews_select_policy" ON public.reviews
FOR SELECT
USING (true);

-- Politique d'insertion (locataire avec réservation complétée)
CREATE POLICY "reviews_insert_policy" ON public.reviews
FOR INSERT
WITH CHECK (
  tenant_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.tenant_id = auth.uid()
    AND bookings.house_id = reviews.house_id
    AND bookings.status IN ('completed', 'active')
  )
);

-- Politique de mise à jour (locataire + admin)
CREATE POLICY "reviews_update_policy" ON public.reviews
FOR UPDATE
USING (
  tenant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Politique de suppression (admin seulement)
CREATE POLICY "reviews_delete_policy" ON public.reviews
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 7️⃣ CONTRAINTES DE SÉCURITÉ ADDITIONNELLES
-- =============================================

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est propriétaire d'une maison
CREATE OR REPLACE FUNCTION is_house_owner(house_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.houses
    WHERE id = house_uuid
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est locataire d'une réservation
CREATE OR REPLACE FUNCTION is_booking_tenant(booking_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = booking_uuid
    AND tenant_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8️⃣ TRIGGERS DE SÉCURITÉ
-- =============================================

-- Trigger pour empêcher les suppressions de profils admin
CREATE OR REPLACE FUNCTION prevent_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Impossible de supprimer un profil administrateur';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_admin_deletion_trigger
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_deletion();

-- Trigger pour journaliser les modifications importantes
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES profiles(id),
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view security logs" ON public.security_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =============================================
-- 9️⃣ VALIDATION DES DONNÉES
-- =============================================

-- Fonction de validation des emails
CREATE OR REPLACE FUNCTION validate_email_format(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Fonction de validation des téléphones
CREATE OR REPLACE FUNCTION validate_phone_format(phone text)
RETURNS boolean AS $$
BEGIN
  -- Format international: +225 XX XX XX XX XX ou 01 23 45 67 89
  RETURN phone ~* '^(\+\d{1,3})?[\d\s\-\(\)]{8,}$';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 🔟 VÉRIFICATION FINALE
-- =============================================

-- Vérifier que toutes les politiques sont en place
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

-- Vérifier que RLS est activé
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'houses', 'bookings', 'payments', 'reviews');
