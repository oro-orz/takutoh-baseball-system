-- usersテーブルにhiragana_nameカラムを追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS hiragana_name TEXT;

-- 既存のデータがある場合のコメント
-- SELECT 'hiragana_nameカラムが追加されました' as status;
