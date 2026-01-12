-- Script pour vérifier et corriger l'enregistrement du numéro de téléphone
-- Vérifier la structure actuelle de la table profiles
\d profiles;

-- Vérifier les données actuelles avec les numéros de téléphone
SELECT 
    id,
    email,
    full_name,
    phone,
    city,
    role,
    owner_type,
    main_activity_neighborhood,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier s'il y a des profils sans numéro de téléphone
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN phone IS NULL OR phone = '' THEN 1 END) as profiles_without_phone,
    COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as profiles_with_phone
FROM profiles;

-- Vérifier les métadonnées d'authentification (requiert accès admin)
-- Cette partie nécessite d'être exécutée avec des droits d'admin
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%test%' OR email LIKE '%demo%'
ORDER BY created_at DESC
LIMIT 5;

-- Script pour mettre à jour les profils sans numéro de téléphone
-- ATTENTION: Exécuter seulement si nécessaire
/*
UPDATE profiles 
SET phone = NULL 
WHERE phone = '' OR phone IS NULL;
*/
