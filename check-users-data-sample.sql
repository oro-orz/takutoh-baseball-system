-- usersテーブルの現在のデータを詳細確認

-- 1. 実際のレコード数とロール分布
SELECT 
    CASE 
        WHEN role IS NULL THEN 'role不明'
        WHEN role = '' THEN 'role空'
        ELSE role 
    END as role_status,
    COUNT(*) as count
FROM users 
GROUP BY role_status
ORDER BY count DESC;

-- 2. PINフィールドの状況
SELECT 
    CASE 
        WHEN pin IS NULL THEN 'PINなし'
        WHEN pin = '' THEN 'PIN空'
        WHEN LENGTH(pin) <= 4 THEN 'PIN短い'
        ELSE 'PIN正常'
    END as pin_status,
    COUNT(*) as count
FROM users 
GROUP BY pin_status
ORDER BY count DESC;

-- 3. 名前フィールドの状況（最初の20件）
SELECT 
    id,
    pin,
    name,
    role,
    CASE 
        WHEN pin IS NOT NULL THEN pin 
        ELSE 'PINなし'
    END as pin_display,
    created_at
FROM users 
WHERE pin IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- 4. line_id相当のフィールドを探す
SELECT 
    'email' as field_name,
    COUNT(*) as non_null_count
FROM users WHERE email IS NOT NULL AND email != ''
UNION ALL
SELECT 
    'phone' as field_name,
    COUNT(*) as non_null_count
FROM users WHERE phone IS NOT NULL AND phone != ''
UNION ALL
SELECT 
    'raw_user_meta_data' as field_name,
    COUNT(*) as non_null_count
FROM users WHERE raw_user_meta_data IS NOT NULL;

-- 5. LINE関連情報があるかチェック
SELECT 
    raw_user_meta_data
FROM users 
WHERE raw_user_meta_data IS NOT NULL 
AND raw_user_meta_data::text LIKE '%line%'
LIMIT 5;

-- 6. is_adminフィールドの使用状況
SELECT 
    CASE 
        WHEN is_admin = true THEN '管理者'
        WHEN is_admin = false THEN '非管理者'
        WHEN is_admin IS NULL THEN 'NULL'
    END as admin_status,
    COUNT(*) as count
FROM users 
GROUP BY admin_status;

-- 7. PINパターンの確認
SELECT 
    pin,
    COUNT(*) as usage_count
FROM users 
WHERE pin IS NOT NULL
GROUP BY pin
ORDER BY usage_count DESC, pin
LIMIT 15;

-- 8. nameフィールドの内容確認（最初の10件）
SELECT 
    name,
    role,
    pin,
    LENGTH(name) as name_length
FROM users 
ORDER BY created_at DESC
LIMIT 10;
