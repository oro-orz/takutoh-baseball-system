-- 重複選手データのクリーンアップ

-- 1. 独立したplayerロールのユーザーを削除
DELETE FROM users 
WHERE role = 'player';

-- 2. 確認：保護者のみになるはず
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;
