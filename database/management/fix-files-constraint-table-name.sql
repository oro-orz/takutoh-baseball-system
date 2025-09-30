-- filesテーブルの外部キー制約を正しいテーブル名に修正
-- 現在の制約を削除
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_uploaded_by_fkey;

-- 正しいテーブル名（users）で制約を再作成
ALTER TABLE files ADD CONSTRAINT files_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- 制約の確認
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confupdtype as update_action,
    confdeltype as delete_action
FROM pg_constraint 
WHERE conname = 'files_uploaded_by_fkey';
