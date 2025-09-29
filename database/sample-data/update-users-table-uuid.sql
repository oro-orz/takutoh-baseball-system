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
  gen_random_uuid(),
  '田中家',
  '1001',
  false,
  'tanaka@example.com',
  'parent',
  NOW(),
  NOW()
);

-- その他の保護者ユーザーを追加
INSERT INTO users (id, name, pin, is_admin, email, role, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '佐藤家', '1002', false, 'sato@example.com', 'parent', NOW(), NOW()),
  (gen_random_uuid(), '鈴木家', '1003', false, 'suzuki@example.com', 'parent', NOW(), NOW()),
  (gen_random_uuid(), '高橋家', '1004', false, 'takahashi@example.com', 'parent', NOW(), NOW());

-- 確認
SELECT id, name, pin, is_admin, email, role FROM users ORDER BY created_at;
