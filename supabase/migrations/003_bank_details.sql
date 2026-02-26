-- Add bank details to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS account_name text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'
  CHECK (payment_status IN ('pending', 'submitted', 'active'));
-- payment_status: 'pending' (no bank details), 'submitted' (awaiting admin), 'active' (subaccount linked)

-- Create admin users table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin table
CREATE POLICY "Admins can read admins" ON admins
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admins));
