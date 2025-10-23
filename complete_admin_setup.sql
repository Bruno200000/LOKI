-- Requête SQL complète pour créer l'administrateur
-- Exécutez cette requête dans Supabase SQL Editor

-- Étape 1: Vérifier si l'utilisateur existe déjà
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'katchabruno52@gmail.com';

-- Étape 2: Si l'utilisateur n'existe pas, vous devez le créer manuellement via l'interface Supabase
-- OU utiliser cette requête UPDATE (si l'utilisateur existe déjà)

-- Étape 3: Mettre à jour le profil avec le rôle admin
UPDATE public.profiles
SET
  role = 'admin',
  full_name = 'Administrateur LOKI'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'katchabruno52@gmail.com'
);

-- Étape 4: Vérifier le résultat
SELECT p.id, u.email, p.full_name, p.role, p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'katchabruno52@gmail.com';

-- Étape 5: Confirmer l'email si nécessaire
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'katchabruno52@gmail.com' AND email_confirmed_at IS NULL;
