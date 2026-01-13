-- =============================================
-- 🔧 RLS SIMPLE POUR INSCRIPTION SANS MÉTADONNÉES
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

-- Politique de mise à jour : modifier son propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =============================================
-- 🔄 TRIGGER SIMPLE SANS MÉTADONNÉES
-- =============================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Créer un trigger simple qui crée un profil de base
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer un profil minimaliste
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email::text, -- Utiliser l'email comme nom par défaut
    'tenant'::user_role -- Rôle par défaut
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer l'inscription si le profil échoue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

COMMIT;
