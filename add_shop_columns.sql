-- 🔧 Ajouter les colonnes manquantes pour les magasins dans la table houses
-- Corrige l'erreur PGRST204: Could not find 'has_ac' column

-- Vérifier si les colonnes existent et les ajouter si nécessaire
DO $$
BEGIN
    -- Ajouter has_ac pour la climatisation des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_ac'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_ac BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_ac ajoutée';
    END IF;

    -- Ajouter has_toilet pour les toilettes des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_toilet'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_toilet BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_toilet ajoutée';
    END IF;

    -- Ajouter has_storage pour le stockage des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_storage'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_storage BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_storage ajoutée';
    END IF;

    -- Ajouter has_showcase pour les vitrines des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_showcase'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_showcase BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_showcase ajoutée';
    END IF;

    -- Ajouter has_security_system pour les systèmes de sécurité des magasins
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'has_security_system'
    ) THEN
        ALTER TABLE houses ADD COLUMN has_security_system BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne has_security_system ajoutée';
    END IF;

    -- Ajouter shop_type pour le type de magasin
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'houses' AND column_name = 'shop_type'
    ) THEN
        ALTER TABLE houses ADD COLUMN shop_type TEXT DEFAULT 'retail';
        RAISE NOTICE 'Colonne shop_type ajoutée';
    END IF;
END $$;

-- Mettre à jour le schéma du cache de PostgREST
NOTIFY pgrst, 'reload schema';

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'houses' 
AND column_name IN ('has_ac', 'has_toilet', 'has_storage', 'has_showcase', 'has_security_system', 'shop_type')
ORDER BY column_name;
