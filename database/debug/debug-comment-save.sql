-- 参加状況テーブルのコメント確認クエリ
SELECT 
  p.id,
  p.event_id,
  p.player_id,
  p.status,
  p.comment,
  p.created_at,
  p.updated_at
FROM participations p
WHERE p.comment IS NOT NULL 
  AND p.comment != ''
ORDER BY p.updated_at DESC
LIMIT 10;
