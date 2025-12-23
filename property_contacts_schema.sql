-- Property Contacts Table for African Property Contact System
-- Tracks all contact actions between tenants and property owners

CREATE TABLE IF NOT EXISTS property_contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  house_id BIGINT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for anonymous contacts
  tenant_name VARCHAR(255) NOT NULL,
  tenant_phone VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'residence', 'house', 'land', 'shop'
  neighborhood VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'contact_initiated' CHECK (status IN ('contact_initiated', 'reservation_made', 'rental_confirmed')),
  contact_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_contacts_house_id ON property_contacts(house_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_owner_id ON property_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_tenant_id ON property_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_status ON property_contacts(status);
CREATE INDEX IF NOT EXISTS idx_property_contacts_contact_date ON property_contacts(contact_date);

-- Add contact_id column to payments table for fee tracking
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS contact_id BIGINT REFERENCES property_contacts(id) ON DELETE SET NULL;

-- RLS (Row Level Security) Policies
ALTER TABLE property_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own contacts (if they are tenants)
-- and owners can see contacts for their properties
CREATE POLICY "Users can view their own contacts and owners can view their property contacts" ON property_contacts
  FOR SELECT USING (
    auth.uid() = tenant_id OR 
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Users can insert contacts (tenants contacting owners)
CREATE POLICY "Users can create contacts" ON property_contacts
  FOR INSERT WITH CHECK (true); -- Allow anyone to create contacts

-- Policy: Admins can update all contacts, owners can update their property contacts
CREATE POLICY "Admins and property owners can update contacts" ON property_contacts
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete all contacts
CREATE POLICY "Admins can delete contacts" ON property_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
-- Note: This function might already exist from other migrations, so we use CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_property_contacts_updated_at ON property_contacts;
CREATE TRIGGER update_property_contacts_updated_at
  BEFORE UPDATE ON property_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add owner_type and main_activity_neighborhood to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owner_type VARCHAR(20) CHECK (owner_type IN ('particulier', 'agent'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS main_activity_neighborhood VARCHAR(255);

-- Comments for documentation
COMMENT ON TABLE property_contacts IS 'Tracks contact actions between tenants and property owners in the African property system';
COMMENT ON COLUMN property_contacts.status IS 'Contact status: contact_initiated, reservation_made, rental_confirmed';
COMMENT ON COLUMN property_contacts.property_type IS 'Property type: residence, house, land, shop';

-- Comments for profiles table columns
COMMENT ON COLUMN profiles.owner_type IS 'Owner type: particulier (individual) or agent (real estate agent)';
COMMENT ON COLUMN profiles.main_activity_neighborhood IS 'Main neighborhood where owner operates';
