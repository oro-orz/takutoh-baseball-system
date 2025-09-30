-- 無効なuploaded_byをNULLに更新
-- まず、無効なuploaded_byのレコードを確認
SELECT id, name, uploaded_by 
FROM files 
WHERE uploaded_by IS NOT NULL 
AND uploaded_by NOT IN (SELECT id FROM users);

-- 無効なuploaded_byをNULLに更新
UPDATE files 
SET uploaded_by = NULL 
WHERE uploaded_by IS NOT NULL 
AND uploaded_by NOT IN (SELECT id FROM users);

-- 更新結果を確認
SELECT COUNT(*) as total_files, 
       COUNT(uploaded_by) as files_with_uploader,
       COUNT(*) - COUNT(uploaded_by) as files_without_uploader
FROM files;
