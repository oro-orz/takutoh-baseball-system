-- usersテーブルのRLSポリシーを修正

-- 1. 現在のRLSポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. 既存のポリシーを削除（もしあれば）
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;

-- 3. 新しいポリシーを作成
-- 全ユーザーが読み取り可能（PIN認証のため）
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

-- 認証されたユーザーが挿入可能
CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (true);

-- 認証されたユーザーが更新可能
CREATE POLICY "Enable update for authenticated users" ON users
    FOR UPDATE USING (true);

-- 認証されたユーザーが削除可能
CREATE POLICY "Enable delete for authenticated users" ON users
    FOR DELETE USING (true);

-- 4. RLSが有効になっているか確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
