/*
  # Update Schema for Missing Property Features
  
  Cette migration ajoute toutes les colonnes manquantes dans la table `houses` 
  pour supporter les terrains, locaux commerciaux, et toutes les caractéristiques
  (piscine, jardin, équipements).
*/

ALTER TABLE public.houses
  -- Type de bien alias (Optionnel, si le front l'utilise)
  ADD COLUMN IF NOT EXISTS property_type text,
  
  -- Médias
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS virtual_tour_url text,
  ADD COLUMN IF NOT EXISTS description_documents jsonb,
  ADD COLUMN IF NOT EXISTS image_data bytea,
  
  -- Équipements généraux
  ADD COLUMN IF NOT EXISTS parking boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS security_cameras boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS guardian boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS furnished boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS floor int,
  
  -- Résidences / Maisons
  ADD COLUMN IF NOT EXISTS air_conditioning boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS heating boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hot_water boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS internet boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS elevator boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS balcony boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS garden boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pool boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alarm_system boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS interphone boolean DEFAULT false,
  
  -- Terrains
  ADD COLUMN IF NOT EXISTS land_type text,
  ADD COLUMN IF NOT EXISTS has_water boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_electricity boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_flat boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_fence boolean DEFAULT false,
  
  -- Locaux Commerciaux (Shops)
  ADD COLUMN IF NOT EXISTS shop_type text,
  ADD COLUMN IF NOT EXISTS has_toilet boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_storage boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_showcase boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_ac boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_security_system boolean DEFAULT false;
