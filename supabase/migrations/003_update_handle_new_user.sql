-- Migration: 003_update_handle_new_user.sql
-- Replace the trigger function to copy phone/city and other user metadata into profiles

CREATE OR REPLACE FUNCTION handle_new_user()
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
    main_activity_neighborhood
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email::text),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    NULLIF(NEW.raw_user_meta_data->>'city',''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('owner','tenant','admin') THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'tenant'::user_role
    END,
    NULLIF(NEW.raw_user_meta_data->>'owner_type',''),
    NULLIF(NEW.raw_user_meta_data->>'main_activity_neighborhood','')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- If the trigger does not exist, create it; if it exists, it will still call the new function
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
