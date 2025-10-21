/*
  # LOKI House Colocation Platform - Database Schema (Supabase / PostgreSQL)
```sql
/*
  # LOKI House Colocation Platform - Database Schema (Supabase / PostgreSQL)

  ## Nouvelle section ajoutée :
  - Table `reviews` : pour les avis et évaluations des maisons par les locataires.
*/

-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE user_role AS ENUM ('owner', 'tenant', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'active', 'completed', 'canceled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('wave', 'orange_money', 'moov_money', 'cash');
CREATE TYPE house_status AS ENUM ('available', 'taken');

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  role user_role DEFAULT 'tenant' NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatically create profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- HOUSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric CHECK (price > 0),
  location text NOT NULL,
  city text NOT NULL,
  bedrooms int DEFAULT 1 CHECK (bedrooms > 0),
  bathrooms int DEFAULT 1 CHECK (bathrooms > 0),
  area_sqm numeric CHECK (area_sqm > 0),
  photos text[],
  videos text[],
  amenities text[],
  status house_status DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available houses"
  ON houses FOR SELECT
  USING (status = 'available');

CREATE POLICY "Owners can manage their own houses"
  ON houses FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE TRIGGER trg_houses_updated_at
  BEFORE UPDATE ON houses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- BOOKINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id uuid NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_date timestamptz DEFAULT now(),
  move_in_date date NOT NULL,
  status booking_status DEFAULT 'pending',
  commission_fee numeric DEFAULT 2000 CHECK (commission_fee >= 0),
  monthly_rent numeric NOT NULL CHECK (monthly_rent > 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own bookings"
  ON bookings FOR SELECT
  USING (tenant_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Tenants can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can update own bookings"
  ON bookings FOR UPDATE
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PAYMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text CHECK (payment_type IN ('commission', 'rent', 'deposit')),
  payment_method payment_method DEFAULT 'wave',
  status payment_status DEFAULT 'pending',
  transaction_id text,
  paid_by uuid REFERENCES profiles(id),
  paid_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (paid_by = auth.uid() OR paid_to = auth.uid());

CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  WITH CHECK (paid_by = auth.uid());

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- REVIEWS TABLE (NEW)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id uuid NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (house_id, tenant_id) -- un seul avis par locataire pour une maison
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Tenants can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    tenant_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.tenant_id = auth.uid()
      AND bookings.house_id = reviews.house_id
      AND bookings.status IN ('completed')
    )
  );

CREATE POLICY "Tenants can update own reviews"
  ON reviews FOR UPDATE
  USING (tenant_id = auth.uid());

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ADMIN VIEWS
-- =============================================================================
CREATE OR REPLACE VIEW admin_commission_stats AS
SELECT
  COUNT(*) AS total_bookings,
  SUM(commission_fee) AS total_commissions,
  SUM(CASE WHEN b.status = 'active' THEN commission_fee ELSE 0 END) AS active_commissions,
  SUM(CASE WHEN b.status = 'completed' THEN commission_fee ELSE 0 END) AS completed_commissions
FROM bookings b;

CREATE OR REPLACE VIEW admin_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE role = 'owner') AS total_owners,
  (SELECT COUNT(*) FROM profiles WHERE role = 'tenant') AS total_tenants,
  (SELECT COUNT(*) FROM houses) AS total_houses,
  (SELECT COUNT(*) FROM houses WHERE status = 'available') AS available_houses,
  (SELECT COUNT(*) FROM bookings) AS total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'active') AS active_bookings;

