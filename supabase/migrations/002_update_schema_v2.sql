/*
  # Update Schema for SaaS Refactor
  
  1. New Columns for `houses`:
     - `type` (enum): residence, house, land, shop
     - `neighborhood`: text (for easier searching)
  
  2. Updates for `bookings`:
     - `check_in` (date) - reusing move_in_date or adding new
     - `check_out` (date) - for residences
     - `guest_name` (text)
     - `guest_phone` (text)
     - `total_price` (numeric) - for residence calculation
*/

-- Create House Type Enum
CREATE TYPE house_type AS ENUM ('residence', 'house', 'land', 'shop');

-- Add columns to houses
ALTER TABLE public.houses 
ADD COLUMN IF NOT EXISTS type house_type DEFAULT 'house',
ADD COLUMN IF NOT EXISTS neighborhood text;

-- Add checking columns to bookings for residences
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS check_out date,
ADD COLUMN IF NOT EXISTS guest_name text,
ADD COLUMN IF NOT EXISTS guest_phone text;

-- Update RLS for Houses to allow public view of all types
-- (Existing policy "Public can view available houses" checks status='available', which is fine)

-- Trigger to calculating Owner Commission is complex to do purely in SQL without business logic
-- We will handle the "Due" creation in the application layer or a separate function.

-- Separate 'Commission' tracking in Payments
-- existing payments table has 'payment_type', we can use 'commission'
