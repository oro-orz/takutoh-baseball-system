-- ギャラリー画像テーブル
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_by ON gallery_images(created_by);

-- RLS (Row Level Security) ポリシー
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが画像を閲覧可能
CREATE POLICY "gallery_images_select_policy" ON gallery_images
  FOR SELECT USING (is_active = true);

-- 管理者のみ画像をアップロード可能
CREATE POLICY "gallery_images_insert_policy" ON gallery_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 管理者のみ画像を更新可能
CREATE POLICY "gallery_images_update_policy" ON gallery_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 管理者のみ画像を削除可能
CREATE POLICY "gallery_images_delete_policy" ON gallery_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ストレージバケットの設定（既存の場合はスキップ）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシー
CREATE POLICY "gallery_images_storage_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "gallery_images_storage_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery-images' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "gallery_images_storage_update_policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery-images' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "gallery_images_storage_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery-images' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
