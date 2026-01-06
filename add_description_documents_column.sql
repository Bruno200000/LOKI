-- 🔧 Ajouter la colonne pour les documents de description dans la table houses
-- Permet de stocker des images et documents liés à la description

-- Vérifier si la colonne existe et l'ajouter si nécessaire
DO $$
BEGIN
    -- Ajouter description_documents pour les documents et images de description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'description_documents'
    ) THEN
        ALTER TABLE houses ADD COLUMN description_documents JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonne description_documents ajoutée';
    END IF;
END $$;

-- Mettre à jour le schéma du cache de PostgREST
NOTIFY pgrst, 'reload schema';

-- Vérifier la colonne ajoutée
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'houses' 
AND column_name = 'description_documents'
ORDER BY column_name;
