-- 修正版：完全なサンプルデータ作成（JSON構文エラー修正）

-- 1. 現在のusersテーブル構造の確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'pin', 'name', 'email', 'role', 'players')
ORDER BY ordinal_position;

-- 2. playersカラムが存在しない場合、追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS players JSONB DEFAULT '[]'::jsonb;

-- その他の必要なカラムも追加（存在しない場合）
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_car_capacity INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_equipment_car BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_umpire BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 3. 既存のテストデータを削除（管理者以外）
DELETE FROM users 
WHERE pin IN (
  '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010',
  '1011', '1012', '1013', '1014', '1015', '1016', '1017', '3001', '3002', '3003'
);

-- 管理者の確認
SELECT '管理者を残して他のユーザーを削除しました' as status;

-- 4. 保護者＋選手データの追加（JSON修正版）

-- 田中健一（複数の子どもたち）
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES (
  '1001', 
  '田中健一', 
  'parent_1001@system.local', 
  'parent', 
  false,
  '[
    {
      "id": "player_1001_1",
      "name": "田中次郎",
      "hiraganaName": "じろう",
      "grade": 6,
      "position": "ピッチャー"
    },
    {
      "id": "player_1001_2", 
      "name": "田中花子",
      "hiraganaName": "はなこ",
      "grade": 4,
      "position": "キャッチャー"
    }
  ]'::jsonb,
  NOW(), 
  NOW()
);

-- 田中大輔（1人の子ども）
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES (
  '1002', 
  '田中大輔', 
  'parent_1002@system.local', 
  'parent', 
  false,
  '[
    {
      "id": "player_1002_1",
      "name": "田中太郎",
      "hiraganaName": "たろう",
      "grade": 5,
      "position": "ファースト"
    }
  ]'::jsonb,
  NOW(), 
  NOW()
);

-- 佐藤太郎（高学年の子ども）
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES (
  '1003', 
  '佐藤太郎', 
  'parent_1003@system.local', 
  'parent', 
  false,
  '[
    {
      "id": "player_1003_1",
      "name": "佐藤三郎",
      "hiraganaName": "さぶろう",
      "grade": 6,
      "position": "ショート"
    }
  ]'::jsonb,
  NOW(), 
  NOW()
);

-- 佐藤次郎（複数の低学年の子どもたち）
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES (
  '1004', 
  '佐藤次郎', 
  'parent_1004@system.local', 
  'parent', 
  false,
  '[
    {
      "id": "player_1004_1",
      "name": "佐藤二郎",
      "hiraganaName": "じろう（さ）",
      "grade": 4,
      "position": "セカンド"
    },
    {
      "id": "player_1004_2",
      "name": "佐藤さくら",
      "hiraganaName": "さくら（さ）",
      "grade": 2,
      "position": "サード"
    }
  ]'::jsonb,
  NOW(), 
  NOW()
);

-- その他の保護者（1名ずつの選手）- JSON修正版
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES 
  ('1005', '鈴木一郎', 'parent_1005@system.local', 'parent', false, '[{"id": "player_1005_1", "name": "鈴木一郎", "hiraganaName": "いちろう", "grade": 5, "position": "ライト"}]'::jsonb, NOW(), NOW()),
  ('1006', '高橋三郎', 'parent_1006@system.local', 'parent', false, '[{"id": "player_1006_1", "name": "高橋三郎", "hiraganaName": "さぶろう（た）", "grade": 3, "position": "センター"}]'::jsonb, NOW(), NOW()),
  ('1007', '高橋四郎', 'parent_1007@system.local', 'parent', false, '[{"id": "player_1007_1", "name": "高橋さくら", "hiraganaName": "さくら", "grade": 2, "position": "レフト"}]'::jsonb, NOW(), NOW()),
  ('1008', '伊藤五郎', 'parent_1008@system.local', 'parent', false, '[{"id": "player_1008_1", "name": "伊藤五郎", "hiraganaName": "ごろう", "grade": 6, "position": "ユーティリティ"}]'::jsonb, NOW(), NOW()),
  ('1009', '山田六郎', 'parent_1009@system.local', 'parent', false, '[{"id": "player_1009_1", "name": "山田六郎", "hiraganaName": "ろくろう", "grade": 4, "position": "ユーティリティ"}]'::jsonb, NOW(), NOW()),
  ('1010', '渡辺七郎', 'parent_1010@system.local', 'parent', false, '[{"id": "player_1010_1", "name": "渡辺七郎", "hiraganaName": "しちろう", "grade": 3, "position": "ベンチ"}]'::jsonb, NOW(), NOW()),
  ('1011', '中村八郎', 'parent_1011@system.local', 'parent', false, '[{"id": "player_1011_1", "name": "中村八郎", "hiraganaName": "はちろう", "grade": 1, "position": "見学"}]'::jsonb, NOW(), NOW()),
  ('1012', '小林九郎', 'parent_1012@system.local', 'parent', false, '[{"id": "player_1012_1", "name": "小林九郎", "hiraganaName": "くろう", "grade": 1, "position": "練習"}]'::jsonb, NOW(), NOW()),
  ('1013', '加藤十郎', 'parent_1013@system.local', 'parent', false, '[{"id": "player_1013_1", "name": "加藤十郎", "hiraganaName": "じゅうろう", "grade": 2, "position": "基礎"}]'::jsonb, NOW(), NOW()),
  ('1014', '吉田十一', 'parent_1014@system.local', 'parent', false, '[{"id": "player_1014_1", "name": "吉田十一郎", "hiraganaName": "じゅういちろう", "grade": 5, "position": "メイン"}]'::jsonb, NOW(), NOW()),
  ('1015', '山本十二', 'parent_1015@system.local', 'parent', false, '[{"id": "player_1015_1", "name": "山本十二郎", "hiraganaName": "じゅうにろう", "grade": 6, "position": "キャプテン"}]'::jsonb, NOW(), NOW());

-- 5. コーチデータの追加（選手なし）
INSERT INTO users (pin, name, email, role, is_admin, players, created_at, updated_at) VALUES 
  ('3001', 'コーチA', 'coach_3001@system.local', 'coach', false, '[]'::jsonb, NOW(), NOW()),
  ('3002', 'コーチB', 'coach_3002@system.local', 'coach', false, '[]'::jsonb, NOW(), NOW()),
  ('3003', 'コーチC', 'coach_3003@system.local', 'coach', false, '[]'::jsonb, NOW(), NOW());

-- 6. 確認クエリ
SELECT 'JSON構文修正版サンプルデータ追加完了' as status;

-- ロール別ユーザー数
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;

-- 保護者ごとの選手数確認
SELECT 
  name as parent_name,
  pin,
  jsonb_array_length(players) as player_count,
  jsonb_agg(json_build_object(
    'name', player->>'name',
    'grade', (player->>'grade')::int,
    'position', player->>'position'
  )) as players_info
FROM users,
     jsonb_array_elements(players) as player
WHERE role = 'parent'
GROUP BY name, pin, players
ORDER BY player_count DESC, parent_name;

-- 選手名簿表示用の確認（学年別）
SELECT 
  (player->>'grade')::int as grade,
  COUNT(*) as player_count,
  jsonb_agg(player->>'name') as player_names
FROM users,
     jsonb_array_elements(players) as player
WHERE role = 'parent'
GROUP BY (player->>'grade')::int
ORDER BY grade;
