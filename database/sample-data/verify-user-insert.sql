-- ユーザー追加前の確認クエリ

-- 1. 現在のユーザー数を確認
SELECT COUNT(*) as total_users FROM users;

-- 2. 既存のPINを確認（重複チェック用）
SELECT pin, name FROM users ORDER BY pin;

-- 3. 既存の選手を確認
SELECT 
  u.name as parent_name,
  u.pin,
  jsonb_array_length(u.players) as player_count,
  u.players
FROM users u
WHERE u.role = 'parent'
ORDER BY u.pin;

-- ===== ここでINSERT文を実行 =====

-- 4. 追加後の確認クエリ
SELECT 
  id,
  pin,
  name,
  role,
  jsonb_array_length(players) as player_count,
  default_car_capacity,
  default_equipment_car,
  default_umpire,
  created_at
FROM users
WHERE role = 'parent'
ORDER BY pin;

-- 5. 選手の詳細を確認
SELECT 
  u.pin,
  u.name as parent_name,
  p.value->>'name' as player_name,
  p.value->>'hiraganaName' as hiragana_name,
  p.value->>'grade' as grade,
  p.value->>'position' as position
FROM users u,
jsonb_array_elements(u.players) p
WHERE u.role = 'parent'
ORDER BY u.pin, (p.value->>'grade')::int DESC;

-- 6. PINの重複確認
SELECT pin, COUNT(*) as count
FROM users
GROUP BY pin
HAVING COUNT(*) > 1;

-- 7. 全体のサマリー
SELECT 
  role,
  COUNT(*) as user_count,
  SUM(jsonb_array_length(players)) as total_players
FROM users
GROUP BY role;

