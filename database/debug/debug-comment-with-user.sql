-- ユーザーIDとイベントIDでコメントを特定するクエリ
SELECT 
  p.id,
  p.event_id,
  p.player_id,
  p.status,
  p.comment,
  u.id as user_id,
  u.name as user_name,
  u.pin
FROM participations p
LEFT JOIN users u ON u.id = (
  SELECT u2.id 
  FROM users u2 
  WHERE u2.role = 'parent' 
    AND u2.players::text LIKE '%' || p.player_id || '%'
  LIMIT 1
)
WHERE p.comment IS NOT NULL 
  AND p.comment != ''
ORDER BY p.updated_at DESC
LIMIT 10;
