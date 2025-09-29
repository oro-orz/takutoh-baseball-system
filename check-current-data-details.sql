-- 現在のSupabaseデータ詳細確認クエリ

-- 1. 全ユーザーの基本情報
SELECT 
  'ユーザー一覧' as category,
  pin,
  name,
  email,
  role,
  is_admin,
  line_id,
  players,
  default_car_capacity,
  default_equipment_car,
  default_umpire,
  created_at,
  updated_at
FROM users 
ORDER BY role, pin;

-- 2. ロール別ユーザー数（再確認）
SELECT 
  'ロール別集計' as category,
  role,
  COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY role;

-- 3. 保護者の選手情報詳細
SELECT 
  '保護者と選手詳細' as category,
  u.pin as parent_pin,
  u.name as parent_name,
  u.line_id as parent_line_id,
  jsonb_array_length(u.players) as player_count,
  u.players
FROM users u
WHERE u.role = 'parent'
ORDER BY u.pin;

-- 4. 選手の学年分布
SELECT 
  '選手学年分布' as category,
  player_grade,
  COUNT(*) as count
FROM (
  SELECT DISTINCT
    u.pin as parent_pin,
    u.name as parent_name,
    player_item,
    (player_item->>'grade')::int as player_grade,
    player_item->>'name' as player_name,
    player_item->>'hiraganaName' as player_hiragana
  FROM users u,
       jsonb_array_elements(u.players) as player_item
  WHERE u.role = 'parent' AND jsonb_array_length(u.players) > 0
) t
GROUP BY player_grade
ORDER BY player_grade DESC;

-- 5. 選手詳細（個別）
SELECT 
  '選手個別詳細' as category,
  u.pin as parent_pin,
  u.name as parent_name,
  (player_item->>'id') as player_id,
  player_item->>'name' as player_name,
  player_item->>'hiraganaName' as player_hiragana,
  (player_item->>'grade')::int as player_grade,
  player_item->>'position' as player_position
FROM users u,
     jsonb_array_elements(u.players) as player_item
WHERE u.role = 'parent' AND jsonb_array_length(u.players) > 0
ORDER BY player_grade DESC, u.name;

-- 6. 同姓保護者の確認
SELECT 
  '同姓保護者確認' as category,
  LEFT(name, 2) as family_name,
  COUNT(*) as count,
  STRING_AGG(name || '(' || pin || ')', ', ') as same_family_parents
FROM users 
WHERE role = 'parent'
GROUP BY LEFT(name, 2)
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 7. フルネーム/短縮形式のひらがな名チェック
SELECT 
  'ひらがな名形式チェック' as category,
  u.pin as parent_pin,
  u.name as parent_name,
  player_item->>'hiraganaName' as hiragana_name,
  CASE 
    WHEN (player_item->>'hiraganaName') LIKE '% %' THEN 'フルネーム形式'
    ELSE '短縮形式'
  END as format_type
FROM users u,
     jsonb_array_elements(u.players) as player_item
WHERE u.role = 'parent' 
  AND jsonb_array_length(u.players) > 0
  AND player_item->>'hiraganaName' IS NOT NULL
ORDER BY u.pin;

-- 8. コーチ詳細
SELECT 
  'コーチ詳細' as category,
  pin,
  name,
  email,
  line_id,
  is_admin
FROM users 
WHERE role = 'coach'
ORDER BY pin;

-- 9. 管理
SELECT 
  '管理者確認' as category,
  pin,
  name,
  email,
  is_admin,
  line_id
FROM users 
WHERE role = 'admin' OR is_admin = true
ORDER BY pin;

-- 10. データ整合性チェック
SELECT 
  'データ整合性チェック' as category,
  '全ユーザー数' as check_item,
  COUNT(*)::text as value
FROM users
UNION ALL
SELECT 
  'データ整合性チェック',
  '選手総数',
  (SELECT COUNT(*)::text 
   FROM users u, jsonb_array_elements(u.players) as player_item 
   WHERE u.role = 'parent') as value
UNION ALL
SELECT 
  'データ整合性チェック',
  'PIN重複チェック',
  (SELECT CASE WHEN COUNT(DISTINCT pin) = COUNT(*) THEN 'OK' ELSE 'DUPLICATE_PIN_ERROR' END
   FROM users) as value
UNION ALL
SELECT 
  'データ整合性チェック',
  'email重複チェック',
  (SELECT CASE WHEN COUNT(DISTINCT email) = COUNT(*) THEN 'OK' ELSE 'DUPLICATE_EMAIL_ERROR' END
   FROM users WHERE email IS NOT NULL) as value;
