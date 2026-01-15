-- 🔧 Fonction RPC pour contourner RLS et récupérer toutes les réservations pour les admins
-- Cette fonction s'exécute avec les privilèges de l'utilisateur qui la définit (definer rights)
-- À exécuter dans l'éditeur SQL de Supabase

CREATE OR REPLACE FUNCTION get_all_bookings_for_admin()
RETURNS TABLE (
  id uuid,
  house_id bigint,
  tenant_id uuid,
  owner_id uuid,
  start_date timestamptz,
  move_in_date timestamptz,
  status text,
  commission_fee bigint,
  monthly_rent bigint,
  notes text,
  created_at timestamptz,
  tenant_full_name text,
  tenant_email text,
  tenant_phone text,
  owner_full_name text,
  owner_email text,
  owner_phone text,
  house_title text,
  house_city text,
  house_price bigint
) AS $$
BEGIN
  -- Vérifier si l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé: admin requis';
  END IF;
  
  -- Retourner toutes les réservations avec les détails liés
  RETURN QUERY
  SELECT 
    b.id,
    b.house_id,
    b.tenant_id,
    b.owner_id,
    b.start_date,
    b.move_in_date,
    b.status,
    b.commission_fee,
    b.monthly_rent,
    b.notes,
    b.created_at,
    -- Infos tenant
    t.full_name as tenant_full_name,
    t.email as tenant_email,
    t.phone as tenant_phone,
    -- Infos owner
    o.full_name as owner_full_name,
    o.email as owner_email,
    o.phone as owner_phone,
    -- Infos house
    h.title as house_title,
    h.city as house_city,
    h.price as house_price
  FROM public.bookings b
  LEFT JOIN public.profiles t ON b.tenant_id = t.id
  LEFT JOIN public.profiles o ON b.owner_id = o.id
  LEFT JOIN public.houses h ON b.house_id = h.id
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_all_bookings_for_admin() TO authenticated;
