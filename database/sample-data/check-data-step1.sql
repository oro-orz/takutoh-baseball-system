-- 現在のデータ確認 STEP1: ユーザー基本情報
SELECT 
  pin,
  name,
  email,
  role,
  is_admin,
  created_at
FROM users 
ORDER BY role, pin
