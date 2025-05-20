/*
  # 管理者ユーザーの作成

  1. 変更内容
    - 管理者ユーザーを作成
    - admin_usersテーブルに管理者情報を追加

  2. セキュリティ
    - パスワードは暗号化して保存
    - メールアドレス確認済みに設定
*/

-- 管理者ユーザーを作成
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- auth.usersテーブルにユーザーを作成
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'oyama@timingood.co.jp',
    crypt('pass1234', gen_salt('bf')),
    now(),
    now(),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Oyama"}'
  )
  RETURNING id INTO new_user_id;

  -- admin_usersテーブルに管理者を追加
  INSERT INTO admin_users (id, email, role)
  VALUES (new_user_id, 'oyama@timingood.co.jp', 'admin')
  ON CONFLICT (email) DO UPDATE
  SET id = EXCLUDED.id, role = EXCLUDED.role;
END $$;