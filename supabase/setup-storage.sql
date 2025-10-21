-- Créer le bucket pour stocker les médias des maisons
INSERT INTO storage.buckets (id, name, public)
VALUES ('house-media', 'house-media', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre à tout le monde de lire les fichiers
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'house-media' );

-- Politique pour permettre aux propriétaires d'uploader des fichiers
CREATE POLICY "Allow owners to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'house-media' 
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre aux propriétaires de supprimer leurs fichiers
CREATE POLICY "Allow owners to delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'house-media'
  AND auth.role() = 'authenticated'
);
