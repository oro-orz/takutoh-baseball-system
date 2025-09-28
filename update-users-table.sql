-- usersテーブルにpinとis_adminカラムを追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin VARCHAR(4) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 既存のユーザーを管理者に設定（PIN: 0000）
UPDATE users 
SET pin = '0000', is_admin = true, name = '管理者'
WHERE id = 'b0097155-c78b-41b1-8b92-15216da6f822';

-- 保護者ユーザーを追加（PIN: 1001）
INSERT INTO users (id, name, pin, is_admin, email, role, created_at, updated_at)
VALUES (
  'f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6',
  '田中家',
  '1001',
  false,
  'tanaka@example.com',
  'parent',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pin = EXCLUDED.pin,
  is_admin = EXCLUDED.is_admin,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- その他の保護者ユーザーを追加
INSERT INTO users (id, name, pin, is_admin, email, role, created_at, updated_at)
VALUES 
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '佐藤家', '1002', false, 'sato@example.com', 'parent', NOW(), NOW()),
  ('b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7', '鈴木家', '1003', false, 'suzuki@example.com', 'parent', NOW(), NOW()),
  ('c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8', '高橋家', '1004', false, 'takahashi@example.com', 'parent', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pin = EXCLUDED.pin,
  is_admin = EXCLUDED.is_admin,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 確認
SELECT id, name, pin, is_admin, email, role FROM users ORDER BY created_at;
