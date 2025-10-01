-- 4年生保護者の名前修正（PIN 1018-1025）
-- 選手名と保護者名が入れ違っていたため修正

UPDATE users SET name = '上野' WHERE pin = '1018';
UPDATE users SET name = '本田' WHERE pin = '1019';
UPDATE users SET name = '東' WHERE pin = '1020';
UPDATE users SET name = '福田' WHERE pin = '1021';
UPDATE users SET name = '福田' WHERE pin = '1022';
UPDATE users SET name = '上川' WHERE pin = '1023';
UPDATE users SET name = '嶽本' WHERE pin = '1024';
UPDATE users SET name = '小平' WHERE pin = '1025';

-- 確認クエリ
SELECT 
  pin, 
  name as parent_name, 
  players->0->>'name' as player_name,
  players->0->>'hiraganaName' as player_hiragana
FROM users
WHERE pin IN ('1018', '1019', '1020', '1021', '1022', '1023', '1024', '1025')
ORDER BY pin;

