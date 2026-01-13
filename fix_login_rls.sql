-- =============================================
-- 🔧 CORRECTION RLS POUR CONNEXION
-- =============================================

-- Supprimer les politiques existantes qui bloquent la connexion
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- =============================================
-- 📝 POLITIQUES RLS CORRIGÉES POUR LA CONNEXION
-- =============================================

-- 1. Politique de lecture : permettre à l'utilisateur de voir son profil
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- 2. Politique d'insertion : permettre l'auto-insertion
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- 3. Politique de mise à jour : permettre de modifier son profil
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Politique de suppression : seul l'utilisateur peut supprimer son profil
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
USING (id = auth.uid());

-- =============================================
-- 🔄 VÉRIFICATION DU TRIGGER
-- =============================================

-- S'assurer que le trigger fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recréer le trigger simple
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer un profil de base pour le nouvel utilisateur
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

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ✅ VÉRIFICATION
-- =============================================

-- Vérifier que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Vérifier les politiques
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
