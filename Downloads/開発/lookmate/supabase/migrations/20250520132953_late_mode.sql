/*
  # Set admin user password

  1. Changes
    - Set password for admin user (oyama@timingood.co.jp)
    
  Note: This is for testing purposes only. In production, passwords should never be stored in migrations!
*/

-- Set password for admin user
UPDATE auth.users
SET encrypted_password = crypt('pass1234', gen_salt('bf'))
WHERE email = 'oyama@timingood.co.jp';