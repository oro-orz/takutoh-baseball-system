-- 実際の部員を追加するテンプレート
-- 使用方法：
-- 1. verify-user-insert.sql の1-3番を実行して既存データを確認
-- 2. 以下のテンプレートを編集して実行
-- 3. verify-user-insert.sql の4-7番を実行して追加データを確認

INSERT INTO users (pin, name, role, players, default_car_capacity, default_equipment_car, default_umpire)
VALUES 
-- 保護者1（選手1名）
('1001', '田中太郎', 'parent', 
 '[{"id": "p001", "name": "田中一郎", "hiraganaName": "いちろう", "grade": 6, "position": "ピッチャー"}]'::jsonb, 
 3, false, false),
 
-- 保護者2（選手1名）
('1002', '佐藤花子', 'parent', 
 '[{"id": "p002", "name": "佐藤次郎", "hiraganaName": "(さ)じろう", "grade": 5, "position": "ファースト"}]'::jsonb, 
 2, true, true),
 
-- 保護者3（兄弟2名）
('1003', '鈴木三郎', 'parent', 
 '[
   {"id": "p003", "name": "鈴木四郎", "hiraganaName": "しろう", "grade": 6, "position": "ショート"},
   {"id": "p004", "name": "鈴木五郎", "hiraganaName": "ごろう", "grade": 3, "position": "セカンド"}
 ]'::jsonb, 
 4, false, false);

-- 注意事項：
-- 1. PIN: 重複しないように（1001, 1002, 1003...）
-- 2. 選手ID: ユニークなID（p001, p002, p003...）
-- 3. ひらがな名: 同姓同名の区別用（いちろう、(た)じろう、(さ)じろうなど）
-- 4. 学年: 1-6の数字
-- 5. default_car_capacity: 車の乗車可能人数（0-10程度）
-- 6. default_equipment_car: 道具車担当（true/false）
-- 7. default_umpire: 審判担当（true/false）

-- よく使うポジション例：
-- ピッチャー、キャッチャー、ファースト、セカンド、サード、ショート、
-- レフト、センター、ライト、外野、内野

