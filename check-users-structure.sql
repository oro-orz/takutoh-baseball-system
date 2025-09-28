-- usersテーブルの構造確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- usersテーブルの内容確認（pinカラムなし）
SELECT * FROM users LIMIT 5;
