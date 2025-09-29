-- emailカラムを削除して個人情報を最小限に

-- 1. 現在のusersテーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. emailカラムを削除
ALTER TABLE users DROP COLUMN IF EXISTS email;

-- 3. 削除後のテーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
