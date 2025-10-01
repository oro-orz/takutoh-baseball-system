-- フルネーム形式のサンプルデータ（同姓処理機能追加済み）

-- 1. カラム追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS players JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_car_capacity INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_equipment_car BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_umpire BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 2. 既存のテストデータを削除
DELETE FROM users 
WHERE pin IN ('1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '1011', '1012', '1013', '1014', '1015', '3001', '3002', '3003');

-- 3. 保護者データの追加（フルネーム形式のひらがな）

INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES 
-- 田中家（複数世帯）
('1001', '田中健一', 'parent_1001@system.local', 'parent', false, '[{"id": "player_1001_1", "name": "田中次郎", "hiraganaName": "たなか じろう", "grade": 6, "position": "ピッチャー"}, {"id": "player_1001_2", "name": "田中花子", "hiraganaName": "たなか はなこ", "grade": 4, "position": "キャッチャー"}]'::jsonb, NOW(), NOW()),

('1002', '田中大輔', 'parent_1002@system.local', 'parent', false, '[{"id": "player_1002_1", "name": "田中太郎", "hiraganaName": "たなか たろう", "grade": 5, "position": "ファースト"}]'::jsonb, NOW(), NOW()),

-- 佐藤家（複数世帯）
('1003', '佐藤太郎', 'parent_1003@system.local', 'parent', false, '[{"id": "player_1003_1", "name": "佐藤三郎", "hiraganaName": "さとう さぶろう", "grade": 6, "position": "ショート"}]'::jsonb, NOW(), NOW()),

('1004', '佐藤次郎', 'parent_1004@system.local', 'parent', false, '[{"id": "player_1004_1", "name": "佐藤二郎", "hiraganaName": "さとう じろう", "grade": 4, "position": "セカンド"}, {"id": "player_1004_2", "name": "佐藤さくら", "hiraganaName": "さとう さくら", "grade": 2, "position": "サード"}]'::jsonb, NOW(), NOW()),

-- その他の保護者
('1005', '鈴木一郎', 'parent_1005@system.local', 'parent', false, '[{"id": "player_1005_1", "name": "鈴木一郎", "hiraganaName": "すずき いちろう", "grade": 5, "position": "ライト"}]'::jsonb, NOW(), NOW()),
('1006', '高橋三郎', 'parent_1006@system.local', 'parent', false, '[{"id": "player_1006_1", "name": "高橋三郎", "hiraganaName": "たかはし さぶろう", "grade": 3, "position": "センター"}]'::jsonb, NOW(), NOW()),
('1007', '高橋四郎', 'parent_1007@system.local', 'parent', false, '[{"id": "player_1007_1", "name": "高橋さくら", "hiraganaName": "たかはし さくら", "grade": 2, "position": "レフト"}]'::jsonb, NOW(), NOW()),
('1008', '伊藤五郎', 'parent_1008@system.local', 'parent', false, '[{"id": "player_1008_1", "name": "伊藤五郎", "hiraganaName": "いとう ごろう", "grade": 6, "position": "ユーティリティ"}]'::jsonb, NOW(), NOW()),
('1009', '山田六郎', 'parent_1009@system.local', 'parent', false, '[{"id": "player_1009_1", "name": "山田六郎", "hiraganaName": "やまだ ろくろう", "grade": 4, "position": "ユーティリティ"}]'::jsonb, NOW(), NOW()),
('1010', '渡辺七郎', 'parent_1010@system.local', 'parent', false, '[{"id": "player_1010_1", "name": "渡辺七郎", "hiraganaName": "わたなべ しちろう", "grade": 3, "position": "ベンチ"}]'::jsonb, NOW(), NOW()),
('1011', '中村八郎', 'parent_1011@system.local', 'parent', false, '[{"id": "player_1011_1", "name": "中村八郎", "hiraganaName": "なかむら はちろう", "grade": 1, "position": "見学"}]'::jsonb, NOW(), NOW()),
('1012', '小林九郎', 'parent_1012@system.local', 'parent', false, '[{"id": "player_1012_1", "name": "小林九郎", "hiraganaName": "こばやし くろう", "grade": 1, "position": "練習"}]'::jsonb, NOW(), NOW()),
('1013', '加藤十郎', 'parent_1013@system.local', 'parent', false, '[{"id": "player_1013_1", "name": "加藤十郎", "hiraganaName": "かとう じゅうろう", "grade": 2, "position": "基礎"}]'::jsonb, NOW(), NOW()),
('1014', '吉田十一', 'parent_1014@system.local', 'parent', false, '[{"id": "player_1014_1", "name": "吉田十一郎", "hiraganaName": "よしだ じゅういちろう", "grade": 5, "position": "メイン"}]'::jsonb, NOW(), NOW()),
('1015', '山本十二', 'parent_1015@system.local', 'parent', false, '[{"id": "player_1015_1", "name": "山本十二郎", "hiraganaName": "やまもと じゅうにろう", "grade": 6, "position": "キャプテン"}]'::jsonb, NOW(), NOW());

-- 4. コーチデータ
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES 
('3001', 'コーチA', 'coach_3001@system.local', 'coach', false, '[]'::jsonb, NOW(), NOW()),
('3002', 'コーチB', 'coach_3002@system.local', 'coach', false, '[]'::jsonb, NOW(), NOW()),
('3003', 'コーチC', 'coach_3003@system.local', 'coach', false, '[]'::jsonb, NOW(), NOW());

-- 5. 確認
SELECT 'フルネーム形式サンプルデータ完了' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;
