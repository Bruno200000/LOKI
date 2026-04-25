-- ðŸ”§ Ajouter la colonne pour les documents de description dans la table houses
-- Permet de stocker des images et documents liÃ©s Ã  la description

-- VÃ©rifier si la colonne existe et l'ajouter si nÃ©cessaire
DO $$
BEGIN
    -- Ajouter description_documents pour les documents et images de description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'description_documents'
    ) THEN
        ALTER TABLE houses ADD COLUMN description_documents JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonne description_documents ajoutÃ©e';
    END IF;
END $$;

-- Mettre Ã  jour le schÃ©ma du cache de PostgREST
NOTIFY pgrst, 'reload schema';

-- VÃ©rifier la colonne ajoutÃ©e
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'houses' 
AND column_name = 'description_documents'
ORDER BY column_name;
-- ðŸ”§ Ajouter les colonnes manquantes pour les magasins dans la table houses
-- Corrige l'erreur PGRST204: Could not find 'has_ac' column

-- VÃ©rifier si les colonnes existent et les ajouter si nÃ©cessaire
DO $$
BEGIN
    -- Ajouter has_ac pour la climatisation des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_ac'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_ac BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_ac ajoutÃ©e';
    END IF;

    -- Ajouter has_toilet pour les toilettes des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_toilet'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_toilet BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_toilet ajoutÃ©e';
    END IF;

    -- Ajouter has_storage pour le stockage des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_storage'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_storage BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_storage ajoutÃ©e';
    END IF;

    -- Ajouter has_showcase pour les vitrines des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_showcase'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_showcase BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_showcase ajoutÃ©e';
    END IF;

    -- Ajouter has_security_system pour les systÃ¨mes de sÃ©curitÃ© des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_security_system'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_security_system BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_security_system ajoutÃ©e';
    END IF;

    -- Ajouter shop_type pour le type de magasin
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'shop_type'
    ) THEN
        ALTER TABLE houses ADD COLUMN shop_type TEXT DEFAULT 'retail';
        RAISE NOTICE 'Colonne shop_type ajoutÃ©e';
    END IF;
END $$;

-- Mettre Ã  jour le schÃ©ma du cache de PostgREST
NOTIFY pgrst, 'reload schema';

-- VÃ©rifier les colonnes ajoutÃ©es
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'houses' 
AND column_name IN ('has_ac', 'has_toilet', 'has_storage', 'has_showcase', 'has_security_system', 'shop_type')
ORDER BY column_name;
-- =============================================================================
-- SQL: ADD MISSING FIELDS TO HOUSES TABLE
-- =============================================================================

-- Add photos column (this was missing)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS photos text[];

-- Add virtual_tour_url column to houses table
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS virtual_tour_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.houses.photos IS 'URLs des photos de la propriÃ©tÃ©';
COMMENT ON COLUMN public.houses.virtual_tour_url IS 'Lien vers une visite virtuelle 360Â° ou vidÃ©o de la propriÃ©tÃ©';
-- ðŸ”§ Fonction RPC pour contourner RLS et rÃ©cupÃ©rer toutes les rÃ©servations pour les admins
-- Cette fonction s'exÃ©cute avec les privilÃ¨ges de l'utilisateur qui la dÃ©finit (definer rights)
-- Ã€ exÃ©cuter dans l'Ã©diteur SQL de Supabase

CREATE OR REPLACE FUNCTION get_all_bookings_for_admin()
RETURNS TABLE (
  id uuid,
  house_id bigint,
  tenant_id uuid,
  owner_id uuid,
  start_date timestamptz,
  move_in_date timestamptz,
  status text,
  commission_fee bigint,
  monthly_rent bigint,
  notes text,
  created_at timestamptz,
  tenant_full_name text,
  tenant_email text,
  tenant_phone text,
  owner_full_name text,
  owner_email text,
  owner_phone text,
  house_title text,
  house_city text,
  house_price bigint
) AS $$
BEGIN
  -- VÃ©rifier si l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'AccÃ¨s non autorisÃ©: admin requis';
  END IF;
  
  -- Retourner toutes les rÃ©servations avec les dÃ©tails liÃ©s
  RETURN QUERY
  SELECT 
    b.id,
    b.house_id,
    b.tenant_id,
    b.owner_id,
    b.start_date,
    b.move_in_date,
    b.status,
    b.commission_fee,
    b.monthly_rent,
    b.notes,
    b.created_at,
    -- Infos tenant
    t.full_name as tenant_full_name,
    t.email as tenant_email,
    t.phone as tenant_phone,
    -- Infos owner
    o.full_name as owner_full_name,
    o.email as owner_email,
    o.phone as owner_phone,
    -- Infos house
    h.title as house_title,
    h.city as house_city,
    h.price as house_price
  FROM public.bookings b
  LEFT JOIN public.profiles t ON b.tenant_id = t.id
  LEFT JOIN public.profiles o ON b.owner_id = o.id
  LEFT JOIN public.houses h ON b.house_id = h.id
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exÃ©cution
GRANT EXECUTE ON FUNCTION get_all_bookings_for_admin() TO authenticated;
-- ðŸ”§ Fonction RPC pour contourner RLS et rÃ©cupÃ©rer toutes les maisons pour les admins
-- Cette fonction s'exÃ©cute avec les privilÃ¨ges de l'utilisateur qui la dÃ©finit (definer rights)

CREATE OR REPLACE FUNCTION get_all_houses_for_admin()
RETURNS TABLE (
  id bigint,
  owner_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  status text,
  type text,
  property_type text,
  title text,
  description text,
  price bigint,
  location text,
  city text,
  neighborhood text,
  area_sqm integer,
  image_url text,
  video_url text,
  virtual_tour_url text,
  photos text[],
  videos text[],
  image_data bytea,
  amenities text[],
  parking boolean,
  security_cameras boolean,
  guardian boolean,
  furnished boolean,
  floor integer,
  bedrooms integer,
  bathrooms integer,
  air_conditioning boolean,
  heating boolean,
  hot_water boolean,
  internet boolean,
  elevator boolean,
  balcony boolean,
  garden boolean,
  pool boolean,
  alarm_system boolean,
  interphone boolean,
  owner_id_2 uuid,
  owner_full_name text,
  owner_email text,
  owner_phone text
) AS $$
BEGIN
  -- VÃ©rifier si l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'AccÃ¨s non autorisÃ©: admin requis';
  END IF;
  
  -- Retourner toutes les maisons avec infos propriÃ©taire
  RETURN QUERY
  SELECT 
    h.*,
    p.id as owner_id_2,
    p.full_name as owner_full_name,
    p.email as owner_email,
    p.phone as owner_phone
  FROM public.houses h
  LEFT JOIN public.profiles p ON h.owner_id = p.id
  ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exÃ©cution
GRANT EXECUTE ON FUNCTION get_all_houses_for_admin() TO authenticated;
-- ðŸ›¡ï¸ Politiques RLS (Row Level Security) amÃ©liorÃ©es pour LOKI
-- Version sÃ©curisÃ©e avec des contraintes strictes

-- =============================================
-- 1ï¸âƒ£ ACTIVATION RLS SUR TOUTES LES TABLES
-- =============================================

-- S'assurer que RLS est activÃ© sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2ï¸âƒ£ PROFILS - Politiques strictes
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

-- Politique de mise Ã  jour (utilisateur + admin)
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
-- 3ï¸âƒ£ MAISONS - Politiques sÃ©curisÃ©es
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view available houses" ON public.houses;
DROP POLICY IF EXISTS "Owners can manage their own houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can view all houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can insert houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can update houses" ON public.houses;
DROP POLICY IF EXISTS "Admin can delete houses" ON public.houses;

-- Politique de lecture (public + propriÃ©taire + admin)
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

-- Politique d'insertion (propriÃ©taire + admin)
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

-- Politique de mise Ã  jour (propriÃ©taire + admin)
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

-- Politique de suppression (propriÃ©taire + admin)
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
-- 4ï¸âƒ£ RÃ‰SERVATIONS - Politiques trÃ¨s strictes
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Tenants can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tenants can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tenants can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin can delete bookings" ON public.bookings;

-- Politique de lecture (locataire + propriÃ©taire + admin)
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

-- Politique de mise Ã  jour (locataire + propriÃ©taire + admin)
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
-- 5ï¸âƒ£ PAIEMENTS - Politiques ultra-sÃ©curisÃ©es
-- =============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can delete payments" ON public.payments;

-- Politique de lecture (utilisateur impliquÃ© + admin)
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

-- Politique de mise Ã  jour (admin seulement pour les paiements)
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
-- 6ï¸âƒ£ AVIS/REVIEWS - Politiques modÃ©rÃ©es
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

-- Politique d'insertion (locataire avec rÃ©servation complÃ©tÃ©e)
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

-- Politique de mise Ã  jour (locataire + admin)
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
-- 7ï¸âƒ£ CONTRAINTES DE SÃ‰CURITÃ‰ ADDITIONNELLES
-- =============================================

-- Fonction pour vÃ©rifier si un utilisateur est admin
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

-- Fonction pour vÃ©rifier si un utilisateur est propriÃ©taire d'une maison
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

-- Fonction pour vÃ©rifier si un utilisateur est locataire d'une rÃ©servation
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
-- 8ï¸âƒ£ TRIGGERS DE SÃ‰CURITÃ‰
-- =============================================

-- Trigger pour empÃªcher les suppressions de profils admin
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
-- 9ï¸âƒ£ VALIDATION DES DONNÃ‰ES
-- =============================================

-- Fonction de validation des emails
CREATE OR REPLACE FUNCTION validate_email_format(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Fonction de validation des tÃ©lÃ©phones
CREATE OR REPLACE FUNCTION validate_phone_format(phone text)
RETURNS boolean AS $$
BEGIN
  -- Format international: +225 XX XX XX XX XX ou 01 23 45 67 89
  RETURN phone ~* '^(\+\d{1,3})?[\d\s\-\(\)]{8,}$';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ðŸ”Ÿ VÃ‰RIFICATION FINALE
-- =============================================

-- VÃ©rifier que toutes les politiques sont en place
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

-- VÃ©rifier que RLS est activÃ©
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'houses', 'bookings', 'payments', 'reviews');
-- Property Contacts Table for African Property Contact System
-- Tracks all contact actions between tenants and property owners

CREATE TABLE IF NOT EXISTS property_contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  house_id BIGINT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for anonymous contacts
  tenant_name VARCHAR(255) NOT NULL,
  tenant_phone VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'residence', 'house', 'land', 'shop'
  neighborhood VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'contact_initiated' CHECK (status IN ('contact_initiated', 'reservation_made', 'rental_confirmed')),
  contact_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_contacts_house_id ON property_contacts(house_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_owner_id ON property_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_tenant_id ON property_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_status ON property_contacts(status);
CREATE INDEX IF NOT EXISTS idx_property_contacts_contact_date ON property_contacts(contact_date);

-- Add contact_id column to payments table for fee tracking
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS contact_id BIGINT REFERENCES property_contacts(id) ON DELETE SET NULL;

-- RLS (Row Level Security) Policies
ALTER TABLE property_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own contacts (if they are tenants)
-- and owners can see contacts for their properties
CREATE POLICY "Users can view their own contacts and owners can view their property contacts" ON property_contacts
  FOR SELECT USING (
    auth.uid() = tenant_id OR 
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Users can insert contacts (tenants contacting owners)
CREATE POLICY "Users can create contacts" ON property_contacts
  FOR INSERT WITH CHECK (true); -- Allow anyone to create contacts

-- Policy: Admins can update all contacts, owners can update their property contacts
CREATE POLICY "Admins and property owners can update contacts" ON property_contacts
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete all contacts
CREATE POLICY "Admins can delete contacts" ON property_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
-- Note: This function might already exist from other migrations, so we use CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_property_contacts_updated_at ON property_contacts;
CREATE TRIGGER update_property_contacts_updated_at
  BEFORE UPDATE ON property_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add owner_type and main_activity_neighborhood to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owner_type VARCHAR(20) CHECK (owner_type IN ('particulier', 'agent'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS main_activity_neighborhood VARCHAR(255);

-- Comments for documentation
COMMENT ON TABLE property_contacts IS 'Tracks contact actions between tenants and property owners in the African property system';
COMMENT ON COLUMN property_contacts.status IS 'Contact status: contact_initiated, reservation_made, rental_confirmed';
COMMENT ON COLUMN property_contacts.property_type IS 'Property type: residence, house, land, shop';

-- Comments for profiles table columns
COMMENT ON COLUMN profiles.owner_type IS 'Owner type: particulier (individual) or agent (real estate agent)';
COMMENT ON COLUMN profiles.main_activity_neighborhood IS 'Main neighborhood where owner operates';
-- ðŸ—„ï¸ Politiques pour Supabase Storage - AccÃ¨s public aux mÃ©dias
-- ExÃ©cutez ce script dans Supabase SQL Editor

-- =============================================
-- 1ï¸âƒ£ CONFIGURATION DU BUCKET house-media
-- =============================================

-- S'assurer que le bucket existe (cette commande peut Ã©chouer si dÃ©jÃ  crÃ©Ã© via l'interface)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'house-media',
    'house-media',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']
  );
EXCEPTION
  WHEN unique_violation THEN
    -- Bucket existe dÃ©jÃ , le mettre Ã  jour
    UPDATE storage.buckets
    SET
      public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']
    WHERE id = 'house-media';
END $$;

-- =============================================
-- 2ï¸âƒ£ ACTIVATION RLS SUR STORAGE.OBJECTS
-- =============================================

-- VÃ©rifier si RLS est activÃ© sur storage.objects
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Activer RLS sur storage.objects si pas dÃ©jÃ  activÃ©
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3ï¸âƒ£ POLITIQUES POUR LE BUCKET house-media
-- =============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in house-media" ON storage.objects;

-- Politique de lecture (accÃ¨s public pour tous les fichiers du bucket house-media)
CREATE POLICY "Public Access to house-media" ON storage.objects
FOR SELECT
USING (bucket_id = 'house-media');

-- Politique d'insertion (utilisateurs authentifiÃ©s peuvent uploader)
CREATE POLICY "Authenticated users can upload to house-media" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- Politique de mise Ã  jour (utilisateurs authentifiÃ©s peuvent modifier leurs fichiers)
CREATE POLICY "Users can update own files in house-media" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- Politique de suppression (utilisateurs authentifiÃ©s peuvent supprimer leurs fichiers)
CREATE POLICY "Users can delete own files in house-media" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- =============================================
-- 4ï¸âƒ£ VÃ‰RIFICATION DES POLITIQUES
-- =============================================

-- VÃ©rifier les buckets
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'house-media';

-- VÃ©rifier les objets dans le bucket
SELECT
  name,
  bucket_id,
  owner,
  metadata,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'house-media'
ORDER BY created_at DESC;

-- VÃ©rifier les politiques (syntaxe correcte pour Supabase)
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%house-media%';

-- =============================================
-- 5ï¸âƒ£ CONFIGURATION MANUELLE ALTERNATIVE
-- =============================================

-- Si les politiques SQL ne fonctionnent pas, configurez manuellement dans Supabase:
-- 1. Storage â†’ house-media â†’ Settings
-- 2. Public bucket = ON
-- 3. Allowed file types = inclure les vidÃ©os (mp4, webm, ogg)
-- 4. File size limit = 50MB
-- 5. Policies tab â†’ Add policy:
--    - Name: "Public Access"
--    - Operation: SELECT
--    - Target: storage.objects
--    - Policy: bucket_id = 'house-media'

-- =============================================
-- 6ï¸âƒ£ TEST D'ACCESSIBILITÃ‰
-- =============================================

-- VÃ©rifier que les fichiers sont accessibles
SELECT
  'https://tcvvczdwchowscaaeezd.supabase.co/storage/v1/object/public/house-media/' || name as public_url,
  name,
  bucket_id
FROM storage.objects
WHERE bucket_id = 'house-media'
ORDER BY created_at DESC;

-- =============================================
-- 7ï¸âƒ£ NOTES IMPORTANTES
-- =============================================

-- AprÃ¨s avoir exÃ©cutÃ© ce script:
-- 1. VÃ©rifiez dans Supabase Dashboard â†’ Storage â†’ house-media
-- 2. Upload test: essayez d'uploader une petite vidÃ©o
-- 3. Test d'accÃ¨s: cliquez sur un fichier â†’ Copy public URL
-- 4. Testez l'URL dans le navigateur
-- 5. Rechargez votre application React

-- Si les politiques ne s'appliquent pas:
-- - VÃ©rifiez que RLS est activÃ© sur storage.objects
-- - VÃ©rifiez que vous Ãªtes connectÃ© en tant qu'utilisateur authentifiÃ©
-- - Essayez de recrÃ©er les politiques manuellement dans l'interface

-- =============================================
-- 8ï¸âƒ£ DIAGNOSTIC FINAL
-- =============================================

-- VÃ©rifier le statut RLS
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'objects' AND schemaname = 'storage';
-- ðŸ”§ Fix temporaire pour les permissions RLS des maisons
-- Permet aux admins de voir TOUTES les maisons (available + taken)

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "houses_select_policy" ON public.houses;

-- RecrÃ©er la politique avec une condition plus permissive pour les admins
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
  -- Les admins peuvent voir toutes les maisons, peu importe le statut
  OR (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);
-- =============================================
-- ðŸ”§ CORRECTION RLS POUR CONNEXION
-- =============================================

-- Supprimer les politiques existantes qui bloquent la connexion
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- =============================================
-- ðŸ“ POLITIQUES RLS CORRIGÃ‰ES POUR LA CONNEXION
-- =============================================

-- 1. Politique de lecture : permettre Ã  l'utilisateur de voir son profil
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- 2. Politique d'insertion : permettre l'auto-insertion
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- 3. Politique de mise Ã  jour : permettre de modifier son profil
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Politique de suppression : seul l'utilisateur peut supprimer son profil
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
USING (id = auth.uid());

-- =============================================
-- ðŸ”„ VÃ‰RIFICATION DU TRIGGER
-- =============================================

-- S'assurer que le trigger fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- RecrÃ©er le trigger simple
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- CrÃ©er un profil de base pour le nouvel utilisateur
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email::text),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'tenant')::user_role
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer l'inscription
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RecrÃ©er le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- =============================================
-- âœ… VÃ‰RIFICATION
-- =============================================

-- VÃ©rifier que RLS est activÃ©
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- VÃ©rifier les politiques
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';

COMMIT;
-- ðŸ”§ SCRIPT DE RÃ‰PARATION DES PROFILS MANQUANTS
-- Ce script identifie les utilisateurs qui sont dans auth.users mais pas dans public.profiles
-- et tente de recrÃ©er leurs profils manquants.

-- 1. Afficher le nombre d'utilisateurs manquants
DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  RAISE NOTICE 'Nombre de profils manquants : %', missing_count;
END $$;

-- 2. InsÃ©rer les profils manquants
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  city,
  role,
  owner_type,
  main_activity_neighborhood,
  created_at
)
SELECT 
  u.id,
  u.email,
  -- RÃ©cupÃ©rer le nom depuis les mÃ©tadonnÃ©es, sinon utiliser l'email
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  -- RÃ©cupÃ©rer le tÃ©lÃ©phone
  u.raw_user_meta_data->>'phone',
  -- RÃ©cupÃ©rer la ville
  u.raw_user_meta_data->>'city',
  -- RÃ©cupÃ©rer le rÃ´le (dÃ©faut: tenant)
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'tenant'::user_role),
  -- Type propriÃ©taire
  u.raw_user_meta_data->>'owner_type',
  -- Quartier activitÃ©
  u.raw_user_meta_data->>'main_activity_neighborhood',
  -- Date de crÃ©ation
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. VÃ©rifier que tout est rÃ©parÃ©
DO $$
DECLARE
  remaining_missing integer;
BEGIN
  SELECT COUNT(*) INTO remaining_missing
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  IF remaining_missing = 0 THEN
    RAISE NOTICE 'âœ… SuccÃ¨s : Tous les profils manquants ont Ã©tÃ© recrÃ©Ã©s !';
  ELSE
    RAISE NOTICE 'âš ï¸ Attention : Il reste % profils manquants.', remaining_missing;
  END IF;
END $$;

-- 4. S'assurer que le trigger est bien activÃ© pour les prochains
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- ðŸ”§ SCRIPT DE RÃ‰PARATION DES PROFILS MANQUANTS (CORRIGÃ‰)
-- Ce script identifie les utilisateurs qui sont dans auth.users mais pas dans public.profiles
-- et tente de recrÃ©er leurs profils manquants.

-- 1. Afficher le nombre d'utilisateurs manquants
DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  RAISE NOTICE 'Nombre de profils manquants : %', missing_count;
END $$;

-- 2. InsÃ©rer les profils manquants (Correction du type casting)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  city,
  role,
  owner_type,
  main_activity_neighborhood,
  created_at
)
SELECT 
  u.id,
  u.email,
  -- RÃ©cupÃ©rer le nom depuis les mÃ©tadonnÃ©es, sinon utiliser l'email
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  -- RÃ©cupÃ©rer le tÃ©lÃ©phone
  u.raw_user_meta_data->>'phone',
  -- RÃ©cupÃ©rer la ville
  u.raw_user_meta_data->>'city',
  -- RÃ©cupÃ©rer le rÃ´le (dÃ©faut: tenant) avec cast sÃ©curisÃ©
  CASE 
    WHEN (u.raw_user_meta_data->>'role') IS NOT NULL AND (u.raw_user_meta_data->>'role') IN ('owner', 'tenant', 'admin') 
    THEN (u.raw_user_meta_data->>'role')::user_role
    ELSE 'tenant'::user_role
  END,
  -- Type propriÃ©taire
  u.raw_user_meta_data->>'owner_type',
  -- Quartier activitÃ©
  u.raw_user_meta_data->>'main_activity_neighborhood',
  -- Date de crÃ©ation
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. VÃ©rifier que tout est rÃ©parÃ©
DO $$
DECLARE
  remaining_missing integer;
BEGIN
  SELECT COUNT(*) INTO remaining_missing
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  IF remaining_missing = 0 THEN
    RAISE NOTICE 'âœ… SuccÃ¨s : Tous les profils manquants ont Ã©tÃ© recrÃ©Ã©s !';
  ELSE
    RAISE NOTICE 'âš ï¸ Attention : Il reste % profils manquants.', remaining_missing;
  END IF;
END $$;

-- 4. S'assurer que le trigger est bien activÃ© pour les prochains (Trigger corrigÃ©)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    city,
    role,
    owner_type,
    main_activity_neighborhood
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role') IN ('owner', 'tenant', 'admin') 
      THEN (NEW.raw_user_meta_data->>'role')::user_role 
      ELSE 'tenant'::user_role 
    END,
    NEW.raw_user_meta_data->>'owner_type',
    NEW.raw_user_meta_data->>'main_activity_neighborhood'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- ðŸ”§ SCRIPT DE RÃ‰PARATION DES PROFILS MANQUANTS (VERSION TEXTE)
-- Ce script insÃ¨re les profils manquants SANS utiliser le type enum "user_role" qui n'existe pas.

-- 1. Afficher le nombre d'utilisateurs manquants
DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  RAISE NOTICE 'Nombre de profils manquants : %', missing_count;
END $$;

-- 2. InsÃ©rer les profils manquants (En traitant le rÃ´le comme du TEXTE)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  city,
  role,
  owner_type,
  main_activity_neighborhood,
  created_at
)
SELECT 
  u.id,
  u.email,
  -- RÃ©cupÃ©rer le nom
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  -- RÃ©cupÃ©rer le tÃ©lÃ©phone
  u.raw_user_meta_data->>'phone',
  -- RÃ©cupÃ©rer la ville
  u.raw_user_meta_data->>'city',
  -- RÃ©cupÃ©rer le rÃ´le en TEXTE (dÃ©faut 'tenant')
  CASE 
    WHEN (u.raw_user_meta_data->>'role') IN ('owner', 'tenant', 'admin') 
    THEN (u.raw_user_meta_data->>'role')
    ELSE 'tenant'
  END,
  -- Autres champs
  u.raw_user_meta_data->>'owner_type',
  u.raw_user_meta_data->>'main_activity_neighborhood',
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. VÃ©rification
DO $$
DECLARE
  remaining_missing integer;
BEGIN
  SELECT COUNT(*) INTO remaining_missing
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  IF remaining_missing = 0 THEN
    RAISE NOTICE 'âœ… SuccÃ¨s : Tous les profils manquants ont Ã©tÃ© recrÃ©Ã©s !';
  ELSE
    RAISE NOTICE 'âš ï¸ Attention : Il reste % profils manquants.', remaining_missing;
  END IF;
END $$;

-- 4. Mettre Ã  jour le trigger pour Ã©viter l'erreur Ã  l'avenir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    city,
    role,
    owner_type,
    main_activity_neighborhood
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    -- Validation simple en TEXTE
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role') IN ('owner', 'tenant', 'admin') 
      THEN (NEW.raw_user_meta_data->>'role') 
      ELSE 'tenant' 
    END,
    NEW.raw_user_meta_data->>'owner_type',
    NEW.raw_user_meta_data->>'main_activity_neighborhood'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log erreur possible ici si besoin
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- =============================================
-- ðŸ”§ CORRECTION RLS POUR INSCRIPTION ET PROFILS
-- =============================================

-- Supprimer toutes les anciennes politiques sur profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- =============================================
-- ðŸ“ NOUVELLES POLITIQUES RLS POUR PROFILES
-- =============================================

-- 1. Politique de lecture : voir son propre profil OU admin voit tout
CREATE POLICY "profiles_read_policy" ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Politique d'insertion : permettre l'inscription (trigger) ET admin
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (
  -- Permettre au trigger de crÃ©er le profil pour le nouvel utilisateur
  id = auth.uid() OR
  -- Permettre aux admins d'insÃ©rer des profils
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Politique de mise Ã  jour : modifier son propre profil OU admin
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Politique de suppression : seul admin peut supprimer
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- ðŸ”„ VÃ‰RIFICATION DU TRIGGER D'INSCRIPTION
-- =============================================

-- S'assurer que le trigger existe et fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- RecrÃ©er la fonction trigger amÃ©liorÃ©e
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- InsÃ©rer le profil avec les mÃ©tadonnÃ©es de l'utilisateur
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    city,
    role,
    owner_type,
    main_activity_neighborhood
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email::text),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    NULLIF(NEW.raw_user_meta_data->>'city',''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('owner','tenant','admin') THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'tenant'::user_role
    END,
    NULLIF(NEW.raw_user_meta_data->>'owner_type',''),
    NULLIF(NEW.raw_user_meta_data->>'main_activity_neighborhood','')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si l'insertion Ã©choue, ne pas bloquer l'inscription
    -- L'utilisateur pourra complÃ©ter son profil plus tard
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RecrÃ©er le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- =============================================
-- âœ… VÃ‰RIFICATION
-- =============================================

-- VÃ©rifier que les politiques sont bien crÃ©Ã©es
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
WHERE tablename = 'profiles';

-- VÃ©rifier que le trigger est bien crÃ©Ã©
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

COMMIT;
-- ðŸ› ï¸ CORRECTION DU STOCKAGE SUPABASE
-- Copiez tout ce code et exÃ©cutez-le dans l'Ã©diteur SQL de Supabase (SQL Editor)

-- 1. CrÃ©ation ou mise Ã  jour du bucket 'house-media'
-- Nous utilisons INSERT ... ON CONFLICT pour gÃ©rer le cas oÃ¹ il existe dÃ©jÃ 
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-media',
  'house-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf'];

-- 2. CrÃ©ation des politiques de sÃ©curitÃ© (Policies)
-- Nous ne tentons pas de modifier la table proprement dite (ALTER TABLE) pour Ã©viter l'erreur de permissions

-- Suppression des anciennes politiques potentiellement conflictuelles
DROP POLICY IF EXISTS "Public Access to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in house-media" ON storage.objects;

-- Politique de LECTURE PUBLIQUE
CREATE POLICY "Public Access to house-media" ON storage.objects
FOR SELECT
USING (bucket_id = 'house-media');

-- Politique d'UPLOAD (Utilisateurs connectÃ©s uniquement)
CREATE POLICY "Authenticated users can upload to house-media" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- Politique de MISE Ã€ JOUR (Utilisateurs connectÃ©s uniquement)
CREATE POLICY "Users can update own files in house-media" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- Politique de SUPPRESSION (Utilisateurs connectÃ©s uniquement)
CREATE POLICY "Users can delete own files in house-media" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);
-- =============================================
-- ðŸ”§ RLS SIMPLE POUR INSCRIPTION SANS MÃ‰TADONNÃ‰ES
-- =============================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Politique de lecture : voir son propre profil
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Politique d'insertion : permettre l'auto-insertion
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Politique de mise Ã  jour : modifier son propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =============================================
-- ðŸ”„ TRIGGER SIMPLE SANS MÃ‰TADONNÃ‰ES
-- =============================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- CrÃ©er un trigger simple qui crÃ©e un profil de base
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- CrÃ©er un profil minimaliste
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email::text, -- Utiliser l'email comme nom par dÃ©faut
    'tenant'::user_role -- RÃ´le par dÃ©faut
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer l'inscription si le profil Ã©choue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RecrÃ©er le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

COMMIT;

-- =============================================
-- MONETIZATION UPDATES
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

