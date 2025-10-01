-- システム設計に合わせた最終サンプルデータ（emailフィールド必須対応）

-- 1. 既存データのクリーンナップ
DELETE FROM users 
WHERE pin LIKE '1%' OR pin LIKE '3%'
OR role IN ('parent', 'coach');

-- 2. 保護者データの追加（email フィールド必須なのでダミーemailを使用）
-- PIN 1001-1015: 保護者（実際のシステムではemail収集しないが、DB制約のため設定）
INSERT INTO users (pin, name, email, role, is_admin, created_at, updated_at) VALUES 
  ('1001', '田中健一', 'parent_1001@system.local', 'parent', false, NOW(), NOW()),
  ('1002', '田中大輔', 'parent_1002@system.local', 'parent', false, NOW(), NOW()),
  ('1003', '佐藤太郎', 'parent_1003@system.local', 'parent', false, NOW(), NOW()),
  ('1004', '佐藤次郎', 'parent_1004@system.local', 'parent', false, NOW(), NOW()),
  ('1005', '鈴木一郎', 'parent_1005@system.local', 'parent', false, NOW(), NOW()),
  ('1006', '高橋三郎', 'parent_1006@system.local', 'parent', false, NOW(), NOW()),
  ('1007', '高橋四郎', 'parent_1007@system.local', 'parent', false, NOW(), NOW()),
  ('1008', '伊藤五郎', 'parent_1008@system.local', 'parent', false, NOW(), NOW()),
  ('1009', '山田六郎', 'parent_1009@system.local', 'parent', false, NOW(), NOW()),
  ('1010', '渡辺七郎', 'parent_1010@system.local', 'parent', false, NOW(), NOW()),
  ('1011', '中村八郎', 'parent_1011@system.local', 'parent', false, NOW(), NOW()),
  ('1012', '小林九郎', 'parent_1012@system.local', 'parent', false, NOW(), NOW()),
  ('1013', '加藤十郎', 'parent_1013@system.local', 'parent', false, NOW(), NOW()),
  ('1014', '吉田十一', 'parent_1014@system.local', 'parent', false, NOW(), NOW()),
  ('1015', '山本十二', 'parent_1015@system.local', 'parent', false, NOW(), NOW());

-- 3. コーチデータの追加（PIN 3001-3003）
INSERT INTO users (pin, name, email, role, is_active, created_at, updated_at) VALUES 
  ('3001', 'コーチA', 'coach_3001@system.local', 'coach', false, NOW(), NOW()),
  ('3002', 'コーチB', 'coach_3002@system.local', 'coach', false, NOW(), NOW()),
  ('3003', 'コーチC', 'coach_3003@system.local', 'coach', false, NOW(), NOW());

-- 4. 確認クエリ
SELECT '最終サンプルデータ追加完了' as status;

-- ロール別ユーザー数
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;

-- 保護者の一覧（実際の運用で使うデータ）
SELECT pin, name, role, created_at 
FROM users 
WHERE role = 'parent' 
ORDER BY pin;

-- ダミーemailの確認（実際には使わない）
SELECT pin, name, email, role 
FROM users 
WHERE email LIKE '%@system.local%' 
ORDER BY role, pin;

-- システム設計に合わせた実運用用のクエリコメント
-- 
-- 【注意】
-- - emailフィールドはSupabaseの制約で必須のためダミーを設定
-- - 実際の運用ではemail@system.localは使用しない
-- - 保護者は参加状況入力時はPINコードでの認証のみ
-- - 選手データは各保護者のマイページから追加・管理
-- - 選手のひらがな名、学年、ポジションはplayersフィールド（JSONB）に保存
