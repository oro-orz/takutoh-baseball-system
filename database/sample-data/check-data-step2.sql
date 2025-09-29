-- 現在のデータ確認 STEP2: 選手詳細（個別）
SELECT 
  u.pin as parent_pin,
  u.name as parent_name,
  player_item->>'name' as player_name,
  player_item->>'hiraganaName' as player_hiragana,
  (player_item->>'grade')::int as player_grade,
  player_item->>'position' as player_position
FROM users u,
     jsonb_array_elements(u.players) as player_item
WHERE u.role = 'parent' AND jsonb_array_length(u.players) > 0
ORDER BY player_grade DESC, u.name
