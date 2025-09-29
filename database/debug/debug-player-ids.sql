-- 現在のユーザーとプレイヤーのID形式を確認
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.pin,
  u.players
FROM users u
WHERE u.role = 'parent'
LIMIT 5;
