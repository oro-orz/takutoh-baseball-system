-- サンプルユーザーデータの作成
-- 既存のユーザーデータを削除（必要に応じて）
-- DELETE FROM users;

-- 管理者ユーザー（PIN: 0000）
INSERT INTO users (id, name, pin, is_admin, created_at, updated_at)
VALUES (
  'ec3d3180-0dd4-4e4d-8852-e83a1bece773',
  '管理者',
  '0000',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pin = EXCLUDED.pin,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 保護者ユーザー（PIN: 1001）
INSERT INTO users (id, name, pin, is_admin, created_at, updated_at)
VALUES (
  'f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6',
  '田中家',
  '1001',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pin = EXCLUDED.pin,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- その他の保護者ユーザー
INSERT INTO users (id, name, pin, is_admin, created_at, updated_at)
VALUES 
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '佐藤家', '1002', false, NOW(), NOW()),
  ('b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7', '鈴木家', '1003', false, NOW(), NOW()),
  ('c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8', '高橋家', '1004', false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pin = EXCLUDED.pin,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();
