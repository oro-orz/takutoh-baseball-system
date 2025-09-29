-- Supabase Storage RLSポリシー修正
-- receiptsバケットのRLSポリシーを更新

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow authenticated users to upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to view receipts" ON storage.objects;

-- 新しいポリシーを作成
CREATE POLICY "Allow authenticated users to upload receipts"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow anyone to view receipts"
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated users to update receipts"
ON storage.objects FOR UPDATE 
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated users to delete receipts"
ON storage.objects FOR DELETE 
USING (bucket_id = 'receipts');
