/*
  # Add admin dashboard tables

  1. New Tables
    - `matchings`
      - `id` (uuid, primary key)
      - `influencer_id` (uuid, references profiles)
      - `company_name` (text)
      - `amount` (integer)
      - `status` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `reviewed_by` (uuid, references admin_users)
      - `review_message` (text)

    - `payments`
      - `id` (uuid, primary key)
      - `matching_id` (uuid, references matchings)
      - `amount` (integer)
      - `status` (text)
      - `paid_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Matchings table
CREATE TABLE IF NOT EXISTS matchings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES admin_users(id),
  review_message text,
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE matchings ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all matchings
CREATE POLICY "Admins can read all matchings"
  ON matchings
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to update matchings
CREATE POLICY "Admins can update matchings"
  ON matchings
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Allow influencers to read their own matchings
CREATE POLICY "Influencers can read own matchings"
  ON matchings
  FOR SELECT
  TO authenticated
  USING (influencer_id = auth.uid());

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matching_id uuid REFERENCES matchings(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all payments
CREATE POLICY "Admins can read all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to update payments
CREATE POLICY "Admins can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Allow influencers to read their own payments
CREATE POLICY "Influencers can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matchings
    WHERE matchings.id = payments.matching_id
    AND matchings.influencer_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER matchings_updated_at
  BEFORE UPDATE ON matchings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();