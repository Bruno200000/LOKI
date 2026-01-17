-- 🛠️ CORRECTION DU STOCKAGE SUPABASE
-- Copiez tout ce code et exécutez-le dans l'éditeur SQL de Supabase (SQL Editor)

-- 1. Création ou mise à jour du bucket 'house-media'
-- Nous utilisons INSERT ... ON CONFLICT pour gérer le cas où il existe déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-media',
  'house-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf'];

-- 2. Création des politiques de sécurité (Policies)
-- Nous ne tentons pas de modifier la table proprement dite (ALTER TABLE) pour éviter l'erreur de permissions

-- Suppression des anciennes politiques potentiellement conflictuelles
DROP POLICY IF EXISTS "Public Access to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in house-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in house-media" ON storage.objects;

-- Politique de LECTURE PUBLIQUE
CREATE POLICY "Public Access to house-media" ON storage.objects
FOR SELECT
USING (bucket_id = 'house-media');

-- Politique d'UPLOAD (Utilisateurs connectés uniquement)
CREATE POLICY "Authenticated users can upload to house-media" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);

-- Politique de MISE À JOUR (Utilisateurs connectés uniquement)
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

-- Politique de SUPPRESSION (Utilisateurs connectés uniquement)
CREATE POLICY "Users can delete own files in house-media" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'house-media' AND
  auth.role() = 'authenticated'
);
