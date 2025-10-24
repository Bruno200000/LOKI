-- 🗄️ Politiques pour Supabase Storage - Accès public aux médias
-- Exécutez ce script dans Supabase SQL Editor

-- =============================================
-- 1️⃣ CONFIGURATION DU BUCKET house-media
-- =============================================

-- S'assurer que le bucket existe (cette commande peut échouer si déjà créé via l'interface)
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
    -- Bucket existe déjà, le mettre à jour
    UPDATE storage.buckets
    SET
      public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']
    WHERE id = 'house-media';
END $$;

-- =============================================
-- 2️⃣ ACTIVATION RLS SUR STORAGE.OBJECTS
-- =============================================

-- Vérifier si RLS est activé sur storage.objects
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Activer RLS sur storage.objects si pas déjà activé
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3️⃣ POLITIQUES POUR LE BUCKET house-media
-- =============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in house-media" ON storage.objects;

-- Politique de lecture (accès public pour tous les fichiers du bucket house-media)
CREATE POLICY "Public Access to house-media" ON storage.objects
FOR SELECT
USING (bucket_id = 'house-media');

-- Politique d'insertion (utilisateurs authentifiés peuvent uploader)
CREATE POLICY "Authenticated users can upload to house-media" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- Politique de mise à jour (utilisateurs authentifiés peuvent modifier leurs fichiers)
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

-- Politique de suppression (utilisateurs authentifiés peuvent supprimer leurs fichiers)
CREATE POLICY "Users can delete own files in house-media" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- =============================================
-- 4️⃣ VÉRIFICATION DES POLITIQUES
-- =============================================

-- Vérifier les buckets
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'house-media';

-- Vérifier les objets dans le bucket
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

-- Vérifier les politiques (syntaxe correcte pour Supabase)
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
-- 5️⃣ CONFIGURATION MANUELLE ALTERNATIVE
-- =============================================

-- Si les politiques SQL ne fonctionnent pas, configurez manuellement dans Supabase:
-- 1. Storage → house-media → Settings
-- 2. Public bucket = ON
-- 3. Allowed file types = inclure les vidéos (mp4, webm, ogg)
-- 4. File size limit = 50MB
-- 5. Policies tab → Add policy:
--    - Name: "Public Access"
--    - Operation: SELECT
--    - Target: storage.objects
--    - Policy: bucket_id = 'house-media'

-- =============================================
-- 6️⃣ TEST D'ACCESSIBILITÉ
-- =============================================

-- Vérifier que les fichiers sont accessibles
SELECT
  'https://oliizzwqbmlpeqozhofm.supabase.co/storage/v1/object/public/house-media/' || name as public_url,
  name,
  bucket_id
FROM storage.objects
WHERE bucket_id = 'house-media'
ORDER BY created_at DESC;

-- =============================================
-- 7️⃣ NOTES IMPORTANTES
-- =============================================

-- Après avoir exécuté ce script:
-- 1. Vérifiez dans Supabase Dashboard → Storage → house-media
-- 2. Upload test: essayez d'uploader une petite vidéo
-- 3. Test d'accès: cliquez sur un fichier → Copy public URL
-- 4. Testez l'URL dans le navigateur
-- 5. Rechargez votre application React

-- Si les politiques ne s'appliquent pas:
-- - Vérifiez que RLS est activé sur storage.objects
-- - Vérifiez que vous êtes connecté en tant qu'utilisateur authentifié
-- - Essayez de recréer les politiques manuellement dans l'interface

-- =============================================
-- 8️⃣ DIAGNOSTIC FINAL
-- =============================================

-- Vérifier le statut RLS
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'objects' AND schemaname = 'storage';
