/*
  # Create initial admin user

  1. Changes
    - Insert initial admin user into admin_users table
    - Email: admin@timingood.co.jp
    - Role: admin
*/

INSERT INTO admin_users (email, role)
VALUES ('admin@timingood.co.jp', 'admin');