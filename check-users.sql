-- ユーザーデータ確認とサンプル更新
SELECT id, name, pin, is_admin FROM users ORDER BY created_at;

-- 田中家の名前を田中一郎に更新
UPDATE users 
SET name = '田中一郎'
WHERE name = '田中家' AND id = (
  SELECT id FROM users WHERE name = '田中家' LIMIT 1
);

-- 確認
SELECT id, name, pin, is_admin FROM users WHERE name = '田中一郎';
