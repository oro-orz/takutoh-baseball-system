-- 現在のusersテーブルの構造と内容を確認

-- 1. テーブル構造の確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. テーブルの基本情報
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'users';

-- 3. 現在登録されているユーザー数
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role;

-- 4. 最新のユーザーデータ（最初の10件）
SELECT 
    id,
    pin,
    name,
    hiragana_name,
    line_id,
    role,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- 5. hiragana_nameカラムが存在するかの確認
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'hiragana_name'
        ) THEN 'hiragana_nameカラムが存在します'
        ELSE 'hiragana_nameカラムが存在しません'
    END as hiragana_column_status;

-- 6. PINの重複チェック
SELECT 
    pin,
    COUNT(*) as duplicate_count
FROM users 
GROUP BY pin 
HAVING COUNT(*) > 1;

-- 7. 名前の重複チェック
SELECT 
    name,
    COUNT(*) as duplicate_count
FROM users 
GROUP BY name 
HAVING COUNT(*) > 1;

-- 8. 選手ユーザーの学年分布
SELECT 
    CASE 
        WHEN name LIKE '%（1年）' THEN '1年'
        WHEN name LIKE '%（2年）' THEN '2年'
        WHEN name LIKE '%（3年）' THEN '3年'
        WHEN name LIKE '%（4年）' THEN '4年'
        WHEN name LIKE '%（5年）' THEN '5年'
        WHEN name LIKE '%（6年）' THEN '6年'
        ELSE '学年不明'
    END as grade,
    COUNT(*) as player_count
FROM users 
WHERE role = 'player'
GROUP BY grade
ORDER BY grade;

-- 9. 保護者の同姓チェック
SELECT 
    SUBSTRING(name FROM '^.+?(?=家〔)') as family_name,
    COUNT(*) as family_count
FROM users 
WHERE role = 'parent'
GROUP BY family_name
HAVING COUNT(*) > 1
ORDER BY family_count DESC;
