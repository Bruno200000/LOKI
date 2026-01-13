-- =============================================
-- 🔧 CORRECTION RLS POUR INSCRIPTION ET PROFILS
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
-- 📝 NOUVELLES POLITIQUES RLS POUR PROFILES
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
  -- Permettre au trigger de créer le profil pour le nouvel utilisateur
  id = auth.uid() OR
  -- Permettre aux admins d'insérer des profils
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Politique de mise à jour : modifier son propre profil OU admin
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
-- 🔄 VÉRIFICATION DU TRIGGER D'INSCRIPTION
-- =============================================

-- S'assurer que le trigger existe et fonctionne
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recréer la fonction trigger améliorée
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer le profil avec les métadonnées de l'utilisateur
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
    -- Si l'insertion échoue, ne pas bloquer l'inscription
    -- L'utilisateur pourra compléter son profil plus tard
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

-- Vérifier que les politiques sont bien créées
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

-- Vérifier que le trigger est bien créé
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
