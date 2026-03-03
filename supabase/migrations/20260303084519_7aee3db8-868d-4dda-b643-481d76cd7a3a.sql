
-- Drop the FK constraint on vendors.user_id so we can seed data
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_user_id_fkey;
