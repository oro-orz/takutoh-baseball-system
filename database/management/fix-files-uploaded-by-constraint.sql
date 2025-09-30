-- filesテーブルのuploaded_by外部キー制約を修正
-- 既存の制約を削除してNULL許可に変更

-- 既存の外部キー制約を削除
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_uploaded_by_fkey;

-- 新しい外部キー制約を追加（NULL許可）
ALTER TABLE files ADD CONSTRAINT files_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
