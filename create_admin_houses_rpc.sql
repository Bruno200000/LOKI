-- 🔧 Fonction RPC pour contourner RLS et récupérer toutes les maisons pour les admins
-- Cette fonction s'exécute avec les privilèges de l'utilisateur qui la définit (definer rights)

CREATE OR REPLACE FUNCTION get_all_houses_for_admin()
RETURNS TABLE (
  id bigint,
  owner_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  status text,
  type text,
  property_type text,
  title text,
  description text,
  price bigint,
  location text,
  city text,
  neighborhood text,
  area_sqm integer,
  image_url text,
  video_url text,
  virtual_tour_url text,
  photos text[],
  videos text[],
  image_data bytea,
  amenities text[],
  parking boolean,
  security_cameras boolean,
  guardian boolean,
  furnished boolean,
  floor integer,
  bedrooms integer,
  bathrooms integer,
  air_conditioning boolean,
  heating boolean,
  hot_water boolean,
  internet boolean,
  elevator boolean,
  balcony boolean,
  garden boolean,
  pool boolean,
  alarm_system boolean,
  interphone boolean,
  owner_id_2 uuid,
  owner_full_name text,
  owner_email text,
  owner_phone text
) AS $$
BEGIN
  -- Vérifier si l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé: admin requis';
  END IF;
  
  -- Retourner toutes les maisons avec infos propriétaire
  RETURN QUERY
  SELECT 
    h.*,
    p.id as owner_id_2,
    p.full_name as owner_full_name,
    p.email as owner_email,
    p.phone as owner_phone
  FROM public.houses h
  LEFT JOIN public.profiles p ON h.owner_id = p.id
  ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_all_houses_for_admin() TO authenticated;
