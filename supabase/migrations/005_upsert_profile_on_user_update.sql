-- Migration: 005_upsert_profile_on_user_update.sql
-- Ensure that when auth.users metadata changes (e.g., phone updated), the profiles table is inserted/updated accordingly.

-- This script should be run as an admin in Supabase SQL editor

CREATE OR REPLACE FUNCTION upsert_profile_from_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    city,
    role,
    owner_type,
    main_activity_neighborhood,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email::text),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    NULLIF(NEW.raw_user_meta_data->>'city',''),
    CASE WHEN NEW.raw_user_meta_data->>'role' IN ('owner','tenant','admin') THEN (NEW.raw_user_meta_data->>'role')::text ELSE 'tenant'::text END,
    NULLIF(NEW.raw_user_meta_data->>'owner_type',''),
    NULLIF(NEW.raw_user_meta_data->>'main_activity_neighborhood',''),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), EXCLUDED.full_name),
    phone = COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone',''), public.profiles.phone),
    city = COALESCE(NULLIF(NEW.raw_user_meta_data->>'city',''), public.profiles.city),
    role = COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), public.profiles.role::text)::text,
    owner_type = COALESCE(NULLIF(NEW.raw_user_meta_data->>'owner_type',''), public.profiles.owner_type),
    main_activity_neighborhood = COALESCE(NULLIF(NEW.raw_user_meta_data->>'main_activity_neighborhood',''), public.profiles.main_activity_neighborhood),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updates to auth.users raw_user_meta_data
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF raw_user_meta_data ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE FUNCTION upsert_profile_from_user();
