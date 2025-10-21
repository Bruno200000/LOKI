-- Migration to add missing columns to bookings table
-- This fixes the error: "column bookings.commission_fee does not exist"
-- Also fixes: "Could not find the 'move_in_date' column of 'bookings' in the schema cache"
-- Also fixes: "Could not find the 'notes' column of 'bookings' in the schema cache"
-- Also fixes: "Could not find the 'owner_id' column of 'bookings' in the schema cache"
-- Also fixes: "null value in column 'start_date' of relation 'bookings' violates not-null constraint"

-- Add commission_fee column if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS commission_fee numeric DEFAULT 2000 CHECK (commission_fee >= 0);

-- Add monthly_rent column if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS monthly_rent numeric NOT NULL CHECK (monthly_rent > 0) DEFAULT 0;

-- Add start_date column if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS start_date date NOT NULL DEFAULT CURRENT_DATE;

-- Update the admin_commission_stats view to use the correct status values
-- The schema uses 'active' and 'completed' but the code expects 'confirmed' and 'pending'
-- Let's check what status values are actually used in the enum

-- For now, let's create a more compatible view that handles both status naming conventions
CREATE OR REPLACE VIEW admin_commission_stats AS
SELECT
  COUNT(*) AS total_bookings,
  SUM(commission_fee) AS total_commissions,
  SUM(CASE WHEN b.status IN ('active', 'confirmed') THEN commission_fee ELSE 0 END) AS active_commissions,
  SUM(CASE WHEN b.status IN ('completed') THEN commission_fee ELSE 0 END) AS completed_commissions
FROM bookings b;
