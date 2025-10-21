-- =============================================================================
-- SQL: ADD MISSING FIELDS TO HOUSES TABLE
-- =============================================================================

-- Add photos column (this was missing)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS photos text[];

-- Add virtual_tour_url column to houses table
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS virtual_tour_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.houses.photos IS 'URLs des photos de la propriété';
COMMENT ON COLUMN public.houses.virtual_tour_url IS 'Lien vers une visite virtuelle 360° ou vidéo de la propriété';
