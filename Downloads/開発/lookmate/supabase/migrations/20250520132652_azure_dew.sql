/*
  # Update admin email address
  
  1. Changes
    - Update email address for admin user from admin@timingood.co.jp to oyama@timingood.co.jp
*/

UPDATE admin_users 
SET email = 'oyama@timingood.co.jp' 
WHERE email = 'admin@timingood.co.jp';