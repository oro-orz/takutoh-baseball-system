-- 新しいテストユーザーを追加
INSERT INTO users (id, name, pin, is_admin, email, role, created_at, updated_at) 
VALUES (
  gen_random_uuid(),
  '山田太郎',  -- 正しい名前で登録
  '1234',
  false,
  'yamada@example.com',
  'parent',
  NOW(),
  NOW()
);
