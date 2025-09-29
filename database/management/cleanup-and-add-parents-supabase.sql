-- Supabaseクエリエディタ用のクリーンナップ＋保護者データ追加
-- 一括実行対応版

-- ===== 1. 既存データクリーンナップ =====
-- 管理者以外のユーザーを削除
DELETE FROM users 
WHERE role IN ('parent', 'player', 'coach')
AND pin IN (
  '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010',
  '1011', '1012', '1013', '1014', '1015', '1016', '1017',
  '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010',
  '2011', '2012', '2013', '3001', '3002', '3003'
);

-- ===== 2. 保護者データ追加 =====
-- 田中健一（複数選手）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1001', '田中健一', 'tanaka.ken@example.com', 'parent', false,
  '[
    {"id": "player_1001_1", "name": "田中次郎", "hiraganaName": "じろう", "grade": 6, "position": "ピッチャー"},
    {"id": "player_1001_2", "name": "田中花子", "hiraganaName": "はなこ", "grade": 4, "position": "キャッチャー"}
  ]'::jsonb,
  4, true, false, NOW(), NOW()
);

-- 田中大輔
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1002', '田中大輔', 'tanaka.daisuke@example.com', 'parent', false,
  '[{"id": "player_1002_1", "name": "田中太郎", "hiraganaName": "たろう", "grade": 5, "position": "ファースト"}]'::jsonb,
  3, false, true, NOW(), NOW()
);

-- 佐藤太郎
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1003', '佐藤太郎', 'sato.taro@example.com', 'parent', false,
  '[{"id": "player_1003_1", "name": "佐藤三郎", "hiraganaName": "さぶろう", "grade": 6, "position": "ショート"}]'::jsonb,
  2, true, false, NOW(), NOW()
);

-- 佐藤次郎（複数選手）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1004', '佐藤次郎', 'sato.jiro@example.com', 'parent', false,
  '[
    {"id": "player_1004_1", "name": "佐藤二郎", "hiraganaName": "じろう（さ〕", "grade": 4, "position": "セカンド"},
    {"id": "player_1004_2", "name": "佐藤さくら", "hiraganaName": "さくら（さ〕", "grade": 2, "position": "サード"}
  ]'::jsonb,
  5, false, false, NOW(), NOW()
);

-- 鈴木一郎
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1005', '鈴木一郎', 'suzuki.ichiro@example.com', 'parent', false,
  '[{"id": "player_1005_1", "name": "鈴木一郎", "hiraganaName": "いちろう", "grade": 5, "position": "ライト"}]'::jsonb,
  3, true, false, NOW(), NOW()
);

-- 高橋三郎
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1006', '高橋三郎', 'takahashi.saburo@example.com', 'parent', false,
  '[{"id": "player_1006_1", "name": "高橋三郎", "hiraganaName": "さぶろう（た〕", "grade": 3, "position": "センター"}]'::jsonb,
  2, false, true, NOW(), NOW()
);

-- 高橋四郎
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES (
  '1007', '高橋四郎', 'takahashi.shiro@example.com', 'parent', false,
  '[{"id": "player_1007_1", "name": "高橋さくら", "hiraganaName": "さくら", "grade": 2, "position": "レフト"}]'::jsonb,
  4, false, false, NOW(), NOW()
);

-- ===== 3. 残りの保護者（一括INSERT） =====
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES 
  ('1008', '伊藤五郎', 'ito.goro@example.com', 'parent', false, '[{"id": "player_1008_1", "name": "伊藤五郎", "hiraganaName": "ごろう", "grade": 6, "position": "ユーティリティ"}]'::jsonb, 3, false, false, NOW(), NOW()),
  ('1009', '山田六郎', 'yamada.rokuro@example.com', 'parent', false, '[{"id": "player_1009_1", "name": "山田六郎", "hiraganaName": "ろくろう", "grade": 4, "position": "ユーティリティ"}]'::jsonb, 2, true, false, NOW(), NOW()),
  ('1010', '渡辺七郎', 'watanabe.shichiro@example.com', 'parent', false, '[{"id": "player_1010_1", "name": "渡辺七郎", "hiraganaName": "しちろう", "grade": 3, "position": "ベンチ"}]'::jsonb, 4, false, true, NOW(), NOW()),
  ('1011', '中村八郎', 'nakamura.hachiro@example.com', 'parent', false, '[{"id": "player_1011_1", "name": "中村八郎", "hiraganaName": "はちろう", "grade": 1, "position": "見学"}]'::jsonb, 3, false, false, NOW(), NOW()),
  ('1012', '小林九郎', 'kobayashi.kuroro@example.com', 'parent', false, '[{"id": "player_1012_1", "name": "小林九郎", "hiraganaName": "くろう", "grade": 1, "position": "練習"}]'::jsonb, 2, true, false, NOW(), NOW()),
  ('1013', '加藤十郎', 'kato.juro@example.com', 'parent', false, '[{"id": "player_1013_1", "name": "加藤十郎", "hiraganaName": "じゅうろう", "grade": 2, "position": "基礎"}]'::jsonb, 4, false, false, NOW(), NOW()),
  ('1014', '吉田十一', 'yoshida.juichiro@example.com', 'parent', false, '[{"id": "player_1014_1", "name": "吉田十一郎", "hiraganaName": "じゅういちろう", "grade": 5, "position": "メイン"}]'::jsonb, 3, true, false, NOW(), NOW()),
  ('1015', '山本十二', 'yamamoto.juni@example.com', 'parent', false, '[{"id": "player_1015_1", "name": "山本十二郎", "hiraganaName": "じゅうにろう", "grade": 6, "position": "キャプテン"}]'::jsonb, 5, false, true, NOW(), NOW());

-- ===== 4. コーチ追加 =====
INSERT INTO users (
  pin, name, email, role, is_admin, 
  players, default_car_capacity, default_equipment_car, default_umpire,
  created_at, updated_at
) VALUES 
  ('3001', 'コーチA', 'coach.a@example.com', 'coach', false, '[]'::jsonb, 0, false, false, NOW(), NOW()),
  ('3002', 'コーチB', 'coach.b@example.com', 'coach', false, '[]'::jsonb, 0, false, false, NOW(), NOW()),
  ('3003', 'コーチC', 'coach.c@example.com', 'coach', false, '[]'::jsonb, 0, false, false, NOW(), NOW());

-- ===== 5. 確認クエリ =====
-- ロール別集計
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;

-- 複数選手を持つ保護者の確認
SELECT 
  name as parent_name,
  jsonb_array_length(players) as player_count,
  jsonb_agg(player->>'name') as player_names,
  jsonb_agg(player->>'grade') as grades
FROM users 
WHERE role = 'parent' AND jsonb_array_length(players) > 1
GROUP BY name, pin
ORDER BY player_count DESC;
