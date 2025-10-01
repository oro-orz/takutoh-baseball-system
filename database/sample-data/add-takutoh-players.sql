-- 託麻東少年野球クラブ 実部員の追加
-- 保護者名は苗字のみ、詳細はマイページで修正可能

INSERT INTO users (pin, name, role, players, default_car_capacity, default_equipment_car, default_umpire)
VALUES 
-- 6年生（9名）※ID: 6001-6009
('1001', '重村', 'parent', '[{"id": "6001", "name": "重村 俊之介", "hiraganaName": "しゅんのすけ", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1002', '杉本', 'parent', '[{"id": "6002", "name": "杉本 瑛真", "hiraganaName": "えいしん", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1003', '中川', 'parent', '[{"id": "6003", "name": "中川 煌雅", "hiraganaName": "こうが", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1004', '古市', 'parent', '[{"id": "6004", "name": "古市 佳輝", "hiraganaName": "よしき", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1005', '浦田', 'parent', '[{"id": "6005", "name": "浦田 颯将", "hiraganaName": "そうすけ", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1006', '松谷', 'parent', '[{"id": "6006", "name": "松谷 太聖", "hiraganaName": "たいせい", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1007', '満永', 'parent', '[{"id": "6007", "name": "満永 匡香", "hiraganaName": "きょうか", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1008', '齋藤', 'parent', '[{"id": "6008", "name": "齋藤 天翔", "hiraganaName": "てんしょう", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1009', '千々岩', 'parent', '[{"id": "6009", "name": "千々岩 琉生", "hiraganaName": "るい", "grade": 6, "position": ""}]'::jsonb, 0, false, false),

-- 5年生（8名）※ID: 5001-5008
('1010', '吉田', 'parent', '[{"id": "5001", "name": "吉田 涼悟", "hiraganaName": "りょうご", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1011', '坂口', 'parent', '[{"id": "5002", "name": "坂口 結輝", "hiraganaName": "ゆうき", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1012', '松岡', 'parent', '[{"id": "5003", "name": "松岡 遼玖", "hiraganaName": "りく", "grade": 5, "position": ""}, {"id": "1001", "name": "松岡 侑矢", "hiraganaName": "ゆうや", "grade": 1, "position": ""}]'::jsonb, 0, false, false),
('1013', '河野', 'parent', '[{"id": "5004", "name": "河野 兼典", "hiraganaName": "けんすけ", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1014', '田中', 'parent', '[{"id": "5005", "name": "田中 海晴", "hiraganaName": "かいせい", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1015', '佐藤', 'parent', '[{"id": "5006", "name": "佐藤 映太", "hiraganaName": "えいた", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1016', '山口', 'parent', '[{"id": "5007", "name": "山口 逢生", "hiraganaName": "あおい", "grade": 5, "position": ""}, {"id": "4007", "name": "山口 光星", "hiraganaName": "ひかる", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1017', '倪', 'parent', '[{"id": "5008", "name": "倪 永旭", "hiraganaName": "あさひ", "grade": 5, "position": ""}]'::jsonb, 0, false, false),

-- 4年生（8名）※ID: 4001-4008（山口4007は1016に含まれる）
('1018', '上野', 'parent', '[{"id": "4001", "name": "上野 奏音", "hiraganaName": "かのん", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1019', '本田', 'parent', '[{"id": "4002", "name": "本田 悠浬", "hiraganaName": "ゆうり", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1020', '東', 'parent', '[{"id": "4003", "name": "東 泰我", "hiraganaName": "たいが", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1021', '福田', 'parent', '[{"id": "4004", "name": "福田 傑", "hiraganaName": "すぐる", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1022', '福田', 'parent', '[{"id": "4005", "name": "福田 海心", "hiraganaName": "かいしん", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1023', '上川', 'parent', '[{"id": "4006", "name": "上川 菜穂", "hiraganaName": "なほ", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1024', '嶽本', 'parent', '[{"id": "4008", "name": "嶽本 羽玖", "hiraganaName": "わく", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1025', '小平', 'parent', '[{"id": "4009", "name": "小平 聖夏", "hiraganaName": "せな", "grade": 4, "position": ""}]'::jsonb, 0, false, false),

-- 3年生（6名）※ID: 3001-3006
('1026', '松下', 'parent', '[{"id": "3001", "name": "松下 慶将", "hiraganaName": "けいしょう", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1027', '北村', 'parent', '[{"id": "3002", "name": "北村 隆青", "hiraganaName": "りゅうせい", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1028', '福田', 'parent', '[{"id": "3003", "name": "福田 斗琉", "hiraganaName": "とおり", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1029', '野田', 'parent', '[{"id": "3004", "name": "野田 悠真", "hiraganaName": "はるま", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1030', '小山', 'parent', '[{"id": "3005", "name": "小山 颯介", "hiraganaName": "そうすけ", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1031', '佐藤', 'parent', '[{"id": "3006", "name": "佐藤 暢亮", "hiraganaName": "ようすけ", "grade": 3, "position": ""}]'::jsonb, 0, false, false),

-- 2年生（3名）※ID: 2001-2003（坂本2003は1034に含まれる）
('1032', '宮田', 'parent', '[{"id": "2001", "name": "宮田 楓心", "hiraganaName": "ふうと", "grade": 2, "position": ""}]'::jsonb, 0, false, false),
('1033', '鎗水', 'parent', '[{"id": "2002", "name": "鎗水 太凰", "hiraganaName": "たいおう", "grade": 2, "position": ""}]'::jsonb, 0, false, false),
('1034', '坂本', 'parent', '[{"id": "2003", "name": "坂本 晴", "hiraganaName": "はる", "grade": 2, "position": ""}, {"id": "1002", "name": "坂本 想", "hiraganaName": "そう", "grade": 1, "position": ""}]'::jsonb, 0, false, false),

-- 1年生（2名）※ID: 1001-1002（松岡1001は1012、坂本1002は1034に含まれる）
('1035', '服部', 'parent', '[{"id": "1003", "name": "服部 健人", "hiraganaName": "けんと", "grade": 1, "position": ""}]'::jsonb, 0, false, false);

-- 実行後の確認
-- verify-user-insert.sql の4-7番のクエリで確認してください

-- サマリー:
-- 合計35アカウント（保護者）
-- 合計39名の選手
-- 6年生: 9名（9アカウント）※ID: 6001-6009
-- 5年生: 8名（8アカウント）※ID: 5001-5008
-- 4年生: 8名（8アカウント）※ID: 4001-4009（4007は山口兄、欠番）
-- 3年生: 6名（6アカウント）※ID: 3001-3006
-- 2年生: 3名（3アカウント）※ID: 2001-2003（2003は坂本兄）
-- 1年生: 2名（1アカウント）※ID: 1001-1003（1001は松岡弟、1002は坂本弟）
-- PIN: 1001-1035（連番、欠番なし）
-- 
-- 選手ID規則:
-- 学年×1000 + 連番（例: 6年生=6001, 5年生=5001, 4年生=4001...）
-- 兄弟の場合は上の学年のIDを使用
-- 
-- 兄弟アカウント:
-- - PIN 1012: 松岡 遼玖（5003/5年）+ 松岡 侑矢（1001/1年）
-- - PIN 1016: 山口 逢生（5007/5年）+ 山口 光星（4007/4年）
-- - PIN 1034: 坂本 晴（2003/2年）+ 坂本 想（1002/1年）

