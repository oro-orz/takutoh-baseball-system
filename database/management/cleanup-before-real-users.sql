-- 実部員データ追加前のクリーンアップ
-- 既存のサンプルデータを削除し、管理者PINを変更

-- 1. 実行前の確認（現在のユーザー数）
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
       COUNT(CASE WHEN role = 'parent' THEN 1 END) as parent_count
FROM users;

-- 2. 管理者以外のユーザーを削除（サンプルデータ削除）
DELETE FROM users WHERE role != 'admin';

-- 3. 管理者のPINを9999に変更
UPDATE users 
SET pin = '9999' 
WHERE role = 'admin';

-- 4. 実行後の確認
SELECT id, pin, name, role, created_at 
FROM users 
ORDER BY pin;

-- 5. 関連データも確認（孤立データがないか）
SELECT 
  (SELECT COUNT(*) FROM events) as total_events,
  (SELECT COUNT(*) FROM participations) as total_participations,
  (SELECT COUNT(*) FROM game_records) as total_game_records,
  (SELECT COUNT(*) FROM files) as total_files,
  (SELECT COUNT(*) FROM expenses) as total_expenses;

-- この後、add-takutoh-players.sql を実行してください

