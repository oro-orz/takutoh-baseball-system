-- 実際のフローに基づいた保護者+選手データの追加
-- 1.管理者が保護者を追加 → 2.保護者が選手を追加

-- 現在のusersテーブルの構造をチェック
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('players', 'default_car_capacity', 'default_equipment_car', 'default_umpire');

-- 1. 田中健一（保護者）- 複数学年に選手
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
)
VALUES (
  '1001',
  '田中健一',
  'tanaka.ken@example.com',
  'parent',
  false,
  '[
    {"id": "player_1001_1", "name": "田中次郎", "hiraganaName": "じろう", "grade": 6, "position": "ピッチャー"},
    {"id": "player_1001_2", "name": "田中花子", "hiraganaName": "はなこ", "grade": 4, "position": "キャッチャー"}
  ]'::jsonb,
  4,
  true,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  players = EXCLUDED.players,
  default_car_capacity = EXCLUDED.default_car_capacity,
  default_equipment_car = EXCLUDED.default_equipment_car,
  default_Car_capacity = EXCLUDED.default_umpire,
  updated_at = NOW();

-- 2. 田中大輔（保護者）- 1名の選手
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
)
VALUES (
  '1002',
  '田中大輔', 
  'tanaka.daisuke@example.com',
  'parent',
  false,
  '[
    {"id": "player_1002_1", "name": "田中太郎", "hiraganaName": "たろう", "grade": 5, "position": "ファースト"}
  ]'::jsonb,
  3,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  players = EXCLUDED.players,
  default_car_capacity = EXCLUDED.default_car_capacity,
  default_equipment_car = EXCLUDED.default_equipment_car,
  default_umpire = EXCLUDED.default_umpire,
  updated = NOW();

-- 3. 佐藤太郎（保護者）- 高学年の選手
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
)
VALUES (
  '1003',
  '佐藤太郎',
  'sato.taro@example.com',
  'parent',
  false,
  '[
    {"id": "player_1003_1", "name": "佐藤三郎", "hiraganaName": "さぶろう", "grade": 6, "position": "ショート"}
  ]'::jsonb,
  2,
  true,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  players = EXCLUDED.players,
  default_car_capacity = EXCLUDED.default_car_capacity,
  default_equipment_car = EXCLUDED.default_equipment_car,
  default_umpire = EXCLUDED.default_umpire,
  updated_at = NOW();

-- 4. 佐藤次郎（保護者）- 複数の低学年選手
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
)
VALUES (
  '1004',
  '佐藤次郎',
  'sato.jiro@example.com',
  'parent',
  false,
  '[
    {"id": "player_1004_1", "name": "佐藤二郎", "hiraganaName": "じろう（さ〕", "grade": 4, "position": "セカンド"},
    {"id": "player_1004_2", "name": "佐藤太郎（小〕", "hiraganaName": "たろう（さ〕", "grade": 2, "position": "サード"}
  ]'::jsonb,
  5,
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  players = EXCLUDED.players,
  default_car_capacity = EXCLUDED.default_car_capacity,
  default_equipment_car = EXCLUDED.default_equipment_car,
  default_umpire = EXCLUDED.default_umpire,
  updated_at = NOW();

-- 5-7. 他の保護者（1名ずつの選手）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
)
VALUES 
  ('1005', '鈴木一郎', 'suzuki.ichiro@example.com', 'parent', false,
   '[{"id": "player_1005_1", "name": "鈴木一郎", "hiraganaName": "いちろう", "grade": 5, "position": "ライト"}]'::jsonb,
   3, true, false, NOW(), NOW()),
  
  ('1006', '高橋三郎', 'takahashi.saburo@example.com', 'parent', false,
   '[{"id": "player_1006_1", "name": "高橋三郎", "hiraganaName": "さぶろう（た〕", "grade": 3, "position": "センター"}]'::jsonb,
   2, false, true, NOW(), NOW()),
  
  ('1007', '高橋四郎', 'takahashi.shiro@example.com', 'parent', false,
   '[{"id": "player_1007_1", "name": "高橋さくら", "hiraganaName": "さくら", "grade": 2, "position": "レフト"}]'::jsonb,
   4, false, false, NOW(), NOW())

ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  players = EXCLUDED.players,
  default_car_capacity = EXCLUDED.default_car_capacity,
  default_equipment_car = EXCLUDED.default_equipment_car,
  default_umpire = EXCLUDED.default_umpire,
  updated_at = NOW();

-- 8. 追加の保護者（8-15）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
)
VALUES 
  ('1008', '伊藤五郎', 'ito.goro@example.com', 'parent', false,
   '[{"id": "player_1008_1", "name": "伊藤五郎", "hiraganaName": "ごろう", "grade": 6, "position": "."}]'::jsonb,
   3, false, false, NOW(), NOW()),
  
  ('1009', '山田六郎', 'yamada.rokuro@example.com', 'parent', false,
   '[{"id": "player_1009_1", "name": "山田六郎", "hiraganaName": "ろくろう", "grade": 4, "position": "ユーティリティ"}]'::jsonb,
   2, true, false, NOW(), NOW()),
  
  ('1010', '渡辺七郎', 'watanabe.shichiro@example.com', 'parent', false,
   '[{"id": "player_1010_1", "name": "渡辺七郎", "hiraganaName": "しちろう", "grade": 3, "position": "ベンチ"}]'::jsonb,
   4, false, true, NOW(), NOW()),
  
  ('1011', '中村八郎', 'nakamura.hachiro@example.com', 'parent', false,
   '[{"id": "player_1011_1", "name": "中村八郎", "hiraganaName": "はちろう", "grade": 1, "position": "見学"}]'::jsonb,
   3, false, false, NOW(), NOW()),
  
  ('1012', '小林九郎', 'kobayashi.kuroro@example.com', 'parent', false,
   '[{"id": "player_1012_1", "name": "小林九郎", "hiraganaName": "くろう", "grade": 1, "position": "練習"}]'::jsonb,
   2, true, false, NOW(), NOW()),
  
  ('1013', '加藤十郎', 'kato.juro@example.com', 'parent', false,
   '[{"id": "player_1013_1", "name": "加藤十郎", "hiraganaName": "じゅうろう", "grade": 2, "position": "基礎"}]'::jsonb,
   4, false, false, NOW(), NOW()),
  
  ('1014', '吉田十一', 'yoshida.juichiro@example.com', 'parent', false,
   '[{"id": "player_1014_1", "name": "吉田十一郎", "hiraganaName": "じゅういちろう", "grade": 5, "position": "メイン"}]'::jsonb,
   3, true, false, NOW(), NOW()),
  
  ('1015', '山本十二', 'yamamoto.juni@example.com', 'parent', false,
   '[{"id": "player_1015_1", "name": "山本十二郎", "hiraganaName": "じゅうにろう", "grade": 6, "position": "キャプテン"}]'::jsonb,
   5, false, true, NOW(), NOW())

ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  players	= EXCLUDED.players,
  default_car_capacity = EXCLUDED.default_car_capacity,
  default_equipment_car = EXCLUDED.default_equipment_car,
  default_umpire = EXCLUDED.default_umpire,
  updated_at = NOW();

-- 確認クエリ
SELECT '保護者+選手データ追加完了' as status;

-- 保護者ごとの選手数と学年分布
SELECT 
  name as parent_name,
  pin as parent_pin,
  jsonb_array_length(players) as player_count,
  jsonb_agg(json_build_object(
    'name', (player->>'name'), 
    'grade', (player->>'grade')::int,
    'position', player->>'position'
  )) as players_info
FROM users 
WHERE role = 'parent' AND players IS NOT NULL
GROUP BY name, pin
ORDER BY player_count DESC, name;

-- 複数選手を持つ保護者の確認
SELECT 
  name as parent_name,
  jsonb_array_length(players) as player_count,
  jsonb_agg(player->>'name') as player_names,
  jsonb_agg(player->>'grade') as grades
FROM users 
WHERE role = 'parent' 
AND jsonb_array_length(players) > 1
GROUP BY name, pin
ORDER BY player_count DESC;
