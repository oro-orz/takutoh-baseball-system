-- 保護者と選手の紐づき確認

-- 1. 保護者の選手数と詳細
SELECT 
  '保護者と選手の紐づき' as check_type,
  u.pin as parent_pin,
  u.name as parent_name,
  jsonb_array_length(u.players) as player_count,
  CASE 
    WHEN jsonb_array_length(u.players) = 0 THEN '選手なし'
    WHEN jsonb_array_length(u.players) = 1 THEN '選手1人'
    WHEN jsonb_array_length(u.players) = 2 THEN '選手2人（きょうだい）'
    ELSE '選手多数'
  END as status,
  u.players
FROM users u
WHERE u.role = 'parent'
ORDER BY u.pin;

-- 2. きょうだい選手の確認（複数選手を持つ保護者）
SELECT 
  'きょうだい選手の詳細' as check_type,
  u.pin as parent_pin,
  u.name as parent_name,
  player_item->>'name' as player_name,
  player_item->>'hiraganaName' as player_hiragana,
  (player_item->>'grade')::int as player_grade,
  player_item->>'position' as player_position
FROM users u,
     jsonb_array_elements(u.players) as player_item
WHERE u.role = 'parent' 
  AND jsonb_array_length(u.players) > 1
ORDER BY u.pin, (player_item->>'grade')::int DESC;

-- 3. 同姓きょうだいの確認
SELECT 
  '同姓きょうだいの確認' as check_type,
  LEFT(u.name, 2) as family_name,
  u.name as parent_name,
  jsonb_array_length(u.players) as children_count,
  STRING_AGG(player_item->>'name', ', ') as children_names
FROM users u,
     jsonb_array_elements(u.players) as player_item
WHERE u.role = 'parent'
GROUP BY u.pin, u.name, LEFT(u.name, 2)
HAVING jsonb_array_length(u.players) > 1
ORDER BY LEFT(u.name, 2), u.name;
