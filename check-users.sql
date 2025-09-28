-- usersテーブルの内容確認
SELECT id, name, pin FROM users ORDER BY created_at;

-- PIN 1001のユーザーが存在するか確認
SELECT id, name, pin FROM users WHERE pin = '1001';

-- PIN 0000のユーザーが存在するか確認  
SELECT id, name, pin FROM users WHERE pin = '0000';
