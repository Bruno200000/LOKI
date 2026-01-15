-- 🔧 SCRIPT DE RÉPARATION DES PROFILS MANQUANTS
-- Ce script identifie les utilisateurs qui sont dans auth.users mais pas dans public.profiles
-- et tente de recréer leurs profils manquants.

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

-- 2. Insérer les profils manquants
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
  -- Récupérer le nom depuis les métadonnées, sinon utiliser l'email
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  -- Récupérer le téléphone
  u.raw_user_meta_data->>'phone',
  -- Récupérer la ville
  u.raw_user_meta_data->>'city',
  -- Récupérer le rôle (défaut: tenant)
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'tenant'::user_role),
  -- Type propriétaire
  u.raw_user_meta_data->>'owner_type',
  -- Quartier activité
  u.raw_user_meta_data->>'main_activity_neighborhood',
  -- Date de création
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Vérifier que tout est réparé
DO $$
DECLARE
  remaining_missing integer;
BEGIN
  SELECT COUNT(*) INTO remaining_missing
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  IF remaining_missing = 0 THEN
    RAISE NOTICE '✅ Succès : Tous les profils manquants ont été recréés !';
  ELSE
    RAISE NOTICE '⚠️ Attention : Il reste % profils manquants.', remaining_missing;
  END IF;
END $$;

-- 4. S'assurer que le trigger est bien activé pour les prochains
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
