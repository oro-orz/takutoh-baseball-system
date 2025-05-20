/*
  # 管理者ユーザーの作成とポリシーの設定

  1. 変更内容
    - admin_usersテーブルのRLSポリシーを設定
    - 管理者ユーザーを作成（既存の場合は更新）

  2. セキュリティ
    - 管理者のみが他の管理者情報を参照可能
*/

-- admin_usersテーブルのRLSポリシーを設定
CREATE POLICY "管理者は全てのadmin_usersを参照可能"
ON admin_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.email = auth.email()
  )
);

-- 管理者ユーザーを作成
DO $$
DECLARE
  user_id uuid;
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
    recovery_token
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
    encode(gen_random_bytes(32), 'hex')
  )
  RETURNING id INTO user_id;

  -- admin_usersテーブルに管理者を追加（既存の場合は更新）
  INSERT INTO admin_users (id, email, role)
  VALUES (user_id, 'oyama@timingood.co.jp', 'admin')
  ON CONFLICT (email) DO UPDATE
  SET role = 'admin';
END $$;