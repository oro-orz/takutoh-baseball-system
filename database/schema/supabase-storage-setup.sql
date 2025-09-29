-- Supabaseストレージバケットの設定
-- レシート画像保存用のバケットを作成

-- バケットの作成
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- バケットのポリシー設定
-- 認証されたユーザーはレシートをアップロード可能
CREATE POLICY "認証されたユーザーはレシートをアップロード可能" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);

-- 認証されたユーザーはレシートを閲覧可能
CREATE POLICY "認証されたユーザーはレシートを閲覧可能" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);

-- 認証されたユーザーはレシートを更新可能
CREATE POLICY "認証されたユーザーはレシートを更新可能" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);

-- 認証されたユーザーはレシートを削除可能
CREATE POLICY "認証されたユーザーはレシートを削除可能" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);
