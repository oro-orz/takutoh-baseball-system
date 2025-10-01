-- 簡単にユーザーを追加するためのSQL（必要なフィールドのみ）

-- 既存のemail制約をチェック
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'email';

-- 管理者ユーザー（PIN: 0000）
INSERT INTO users (pin, name, email, role, is_admin, created_at, updated_at)
VALUES (
  '0000',
  '管理者',
  'admin@system.local',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 保護者ユーザー (15名)
INSERT INTO users (pin, name, email, role, is_admin, created_at, updated_at)
VALUES 
  ('1001', '田中健一', 'user1001@system.local', 'parent', false, NOW(), NOW()),
  ('1002', '田中大輔', 'user1002@system.local', 'parent', false, NOW(), NOW()),
  ('1003', '佐藤太郎', 'user1003@system.local', 'parent', false, NOW(), NOW()),
  ('1004', '佐藤次郎', 'user1004@system.local', 'parent', false, NOW(), NOW()),
  ('1005', '鈴木一郎', 'user1005@system.local', 'parent', false, NOW(), NOW()),
  ('1006', '高橋三郎', 'user1006@system.local', 'parent', false, NOW(), NOW()),
  ('1007', '高橋四郎', 'user1007@system.local', 'parent', false, NOW(), NOW()),
  ('1008', '伊藤五郎', 'user1008@system.local', 'parent', false, NOW(), NOW()),
  ('1009', '山田六郎', 'user1009@system.local', 'parent', false, NOW(), NOW()),
  ('1010', '渡辺七郎', 'user1010@system.local', 'parent', false, NOW(), NOW()),
  ('1011', '中村八郎', 'user1011@system.local', 'parent', false, NOW(), NOW()),
  ('1012', '小林九郎', 'user1012@system.local', 'parent', false, NOW(), NOW()),
  ('1013', '加藤十郎', 'user1013@system.local', 'parent', false, NOW(), NOW()),
  ('1014', '吉田十一', 'user1014@system.local', 'parent', false, NOW(), NOW()),
  ('1015', '山本十二', 'user1015@system.local', 'parent', false, NOW(), NOW())
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 選手ユーザー (13名)
INSERT INTO users (pin, name, email, role, is_admin, created_at, updated_at)
VALUES 
  ('2001', '田中次郎', 'player2001@system.local', 'player', false, NOW(), NOW()),
  ('2002', '佐藤三郎', 'player2002@system.local', 'player', false, NOW(), NOW()),
  ('2003', '高橋四郎', 'player2003@system.local', 'player', false, NOW(), NOW()),
  ('2004', '田中太郎', 'player2004@system.local', 'player', false, NOW(), NOW()),
  ('2005', '鈴木一郎', 'player2005@system.local', 'player', false, NOW(), NOW()),
  ('2006', '伊藤五郎', 'player2006@system.local', 'player', false, NOW(), NOW()),
  ('2007', '田中花子', 'player2007@system.local', 'player', false, NOW(), NOW()),
  ('2008', '佐藤二郎', 'player2008@system.local', 'player', false, NOW(), NOW()),
  ('2009', '山田六郎', 'player2009@system.local', 'player', false, NOW(), NOW()),
  ('2010', '高橋三郎', 'player2010@system.local', 'player', false, NOW(), NOW()),
  ('2011', '渡辺七郎', 'player2011@system.local', 'player', false, NOW(), NOW()),
  ('2012', '高橋さくら', 'player2012@system.local', 'player', false, NOW(), NOW()),
  ('2013', '中村八郎', 'player2013@system.local', 'player', false, NOW(), NOW())
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- コーチユーザー (3名)
INSERT INTO users (pin, name, email, role, is_admin, created_at, updated_at)
VALUES 
  ('3001', 'コーチA', 'coach3001@system.local', 'coach', false, NOW(), NOW()),
  ('3002', 'コーチB', 'coach3002@system.local', 'coach', false, NOW(), NOW()),
  ('3003', 'コーチC', 'coach3003@system.local', 'coach', false, NOW(), NOW())
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 確認
SELECT 'データ追加完了' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role;
