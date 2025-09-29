-- 現在のデータ確認 STEP4: ひらがな名形式チェック
SELECT 
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
ORDER BY u.pin
