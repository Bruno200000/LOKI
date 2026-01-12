-- Migration: 004_sync_profiles.sql
-- Copy phone/city/role/owner metadata from auth.users -> profiles for existing users

-- Note: Run this as a privileged user (e.g., in Supabase SQL editor as an admin)



-- Update profiles with metadata from auth.users when missing
UPDATE public.profiles p
SET
  phone = COALESCE(NULLIF(u.raw_user_meta_data->>'phone',''), p.phone),
  city = COALESCE(NULLIF(u.raw_user_meta_data->>'city',''), p.city),
  role = COALESCE(NULLIF((u.raw_user_meta_data->>'role'),''), p.role::text)::user_role,
  owner_type = COALESCE(NULLIF(u.raw_user_meta_data->>'owner_type',''), p.owner_type),
  main_activity_neighborhood = COALESCE(NULLIF(u.raw_user_meta_data->>'main_activity_neighborhood',''), p.main_activity_neighborhood)
FROM auth.users u
WHERE p.id = u.id
  AND (
    p.phone IS NULL OR p.phone = '' OR
    p.city IS NULL OR p.city = '' OR
    p.owner_type IS NULL OR p.owner_type = ''
  );

COMMIT;
