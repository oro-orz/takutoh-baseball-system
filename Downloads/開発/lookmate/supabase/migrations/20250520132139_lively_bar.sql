/*
  # Admin schema setup

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `updated_by` (uuid)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read admin_users
CREATE POLICY "Admins can read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES admin_users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read system_settings
CREATE POLICY "Admins can read system_settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Only allow admins to update system_settings
CREATE POLICY "Admins can update system_settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add default system settings
INSERT INTO system_settings (key, value) VALUES
  ('commission_rate', '{"rate": 0.1, "description": "Platform commission rate"}'),
  ('notification_templates', '{
    "matching_approved": {"subject": "マッチングが承認されました", "template": "..."},
    "matching_rejected": {"subject": "マッチングが却下されました", "template": "..."}
  }'),
  ('terms_of_service', '{"version": "1.0", "last_updated": "2025-03-01"}'),
  ('privacy_policy', '{"version": "1.0", "last_updated": "2025-03-01"}')
ON CONFLICT (key) DO NOTHING;