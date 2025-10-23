-- Script SQL pour ajouter un administrateur dans Supabase
-- Exécutez ce script dans l'interface SQL de Supabase

-- 1. Créer l'utilisateur dans auth.users (remplacez 'YOUR_SERVICE_ROLE_KEY' par votre clé de service)
-- Note: Cette partie doit être faite via l'API Supabase Admin ou l'interface Supabase

-- 2. Mettre à jour le profil avec le rôle admin
UPDATE public.profiles
SET
  role = 'admin',
  full_name = 'Administrateur LOKI',
  updated_at = now()
WHERE email = 'admin@gmail.com';

-- 3. Vérifier que l'utilisateur a été créé avec le bon rôle
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE email = 'admin@gmail.com';

-- 4. Alternative: Si l'utilisateur n'existe pas encore, vous devez d'abord le créer via l'interface Supabase Auth
-- ou utiliser l'API Supabase Admin avec une requête POST vers:
-- https://your-project.supabase.co/auth/v1/admin/users
-- avec les headers:
-- Authorization: Bearer YOUR_SERVICE_ROLE_KEY
-- Content-Type: application/json
--
-- Body:
-- {
--   "email": "admin@gmail.com",
--   "password": "44390812",
--   "user_metadata": {
--     "full_name": "Administrateur LOKI"
--   },
--   "email_confirm": true
-- }

-- 5. Ensuite exécuter la requête UPDATE ci-dessus pour définir le rôle admin
