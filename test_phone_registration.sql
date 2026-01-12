-- Test script pour vérifier l'enregistrement du numéro de téléphone
-- Ce script peut être utilisé pour tester si le numéro de téléphone est bien enregistré

-- Vérifier les profils avec leurs numéros de téléphone
SELECT 
    id,
    email,
    full_name,
    phone,
    city,
    role,
    created_at
FROM profiles 
WHERE phone IS NOT NULL 
ORDER BY created_at DESC;

-- Vérifier les métadonnées d'authentification
-- Note: Les métadonnées sont stockées dans auth.users et ne sont pas directement queryables en SQL standard
