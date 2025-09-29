-- システム設計に合わせたサンプルデータ登録（メールアドレス不要）

-- 1. 現在のusersテーブル構造確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 既存データのクリーンナップ
DELETE FROM users 
WHERE pin LIKE '1%' OR pin LIKE '2%' OR pin LIKE '3%'
OR role IN ('parent', 'player', 'coach');

-- 3. 管理者のみ残すか確認
SELECT 'クリーンナップ後のユーザー数' as status, COUNT(*) as count FROM users;

-- 4. 保護者データの追加（PIN、名前、ロールのみ）
-- PIN 1001-1015: 保護者
INSERT INTO users (pin, name, role, created_at, updated_at) VALUES 
  ('1001', '田中健一', 'parent', NOW(), NOW()),
  ('1002', '田中大輔', 'parent', NOW(), NOW()),
  ('1003', '佐藤太郎', 'parent', NOW(), NOW()),
  ('1004', '佐藤次郎', 'parent', NOW(), NOW()),
  ('1005', '鈴木一郎', 'parent', NOW(), NOW()),
  ('1006', '高橋三郎', 'parent', NOW(), NOW()),
  ('1007', '高橋四郎', 'parent', NOW(), NOW()),
  ('1008', '伊藤五郎', 'parent', NOW(), NOW()),
  ('1009', '山田六郎', 'parent', NOW(), NOW()),
  ('1010', '渡辺七郎', 'parent', NOW(), NOW()),
  ('1011', '中村八郎', 'parent', NOW(), NOW()),
  ('1012', '小林九郎', 'parent', NOW(), NOW()),
  ('1013', '加藤十郎', 'parent', NOW(), NOW()),
  ('1014', '吉田十一', 'parent', NOW(), NOW()),
  ('1015', '山本十二', 'parent', NOW(), NOW());

-- 5. コーチデータの追加（PIN 3001-3003）
INSERT INTO users (pin, name, role, created_at, updated_at) VALUES 
  ('3001', 'コーチA', 'coach', NOW(), NOW()),
  ('3002', 'コーチB', 'coach', NOW(), NOW()),
  ('3003', 'コーチC', 'coach', NOW(), NOW());

-- 6. 確認クエリ
SELECT 'サンプルデータ追加完了' as status;

-- ロール別ユーザー数
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;

-- 保護者のリスト（確認用）
SELECT name, pin, role, created_at 
FROM users 
WHERE role = 'parent' 
ORDER BY pin;
