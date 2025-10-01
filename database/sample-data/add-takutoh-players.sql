-- 託麻東少年野球クラブ 実部員の追加
-- 保護者名は苗字のみ、詳細はマイページで修正可能

INSERT INTO users (pin, name, role, players, default_car_capacity, default_equipment_car, default_umpire)
VALUES 
-- 6年生（9名）
('1001', '重村', 'parent', '[{"id": "p001", "name": "重村 俊之介", "hiraganaName": "しゅんのすけ", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1002', '杉本', 'parent', '[{"id": "p002", "name": "杉本 瑛真", "hiraganaName": "えいしん", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1003', '中川', 'parent', '[{"id": "p003", "name": "中川 煌雅", "hiraganaName": "こうが", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1004', '古市', 'parent', '[{"id": "p004", "name": "古市 佳輝", "hiraganaName": "よしき", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1005', '浦田', 'parent', '[{"id": "p005", "name": "浦田 颯将", "hiraganaName": "そうま", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1006', '松谷', 'parent', '[{"id": "p006", "name": "松谷 太聖", "hiraganaName": "たいせい", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1007', '満永', 'parent', '[{"id": "p007", "name": "満永 匡香", "hiraganaName": "きょうか", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1008', '齋藤', 'parent', '[{"id": "p008", "name": "齋藤 天翔", "hiraganaName": "てんしょう", "grade": 6, "position": ""}]'::jsonb, 0, false, false),
('1009', '千々岩', 'parent', '[{"id": "p009", "name": "千々岩 琉生", "hiraganaName": "るい", "grade": 6, "position": ""}]'::jsonb, 0, false, false),

-- 5年生（9名）
('1010', '吉田', 'parent', '[{"id": "p010", "name": "吉田 涼悟", "hiraganaName": "りょうご", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1011', '坂口', 'parent', '[{"id": "p011", "name": "坂口 結輝", "hiraganaName": "ゆうき", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1012', '松岡', 'parent', '[{"id": "p012", "name": "松岡 遼玖", "hiraganaName": "りく", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1013', '河野', 'parent', '[{"id": "p013", "name": "河野 兼典", "hiraganaName": "けんすけ", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1014', '田中', 'parent', '[{"id": "p014", "name": "田中 海晴", "hiraganaName": "かいせい", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1015', '佐藤', 'parent', '[{"id": "p015", "name": "佐藤 映太", "hiraganaName": "えいた", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1016', '山口(5)', 'parent', '[{"id": "p016", "name": "山口 逢生", "hiraganaName": "ひかる", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1017', '倪', 'parent', '[{"id": "p017", "name": "倪 永旭", "hiraganaName": "あさひ", "grade": 5, "position": ""}]'::jsonb, 0, false, false),
('1018', '小平', 'parent', '[{"id": "p018", "name": "小平 聖夏", "hiraganaName": "せな", "grade": 5, "position": ""}]'::jsonb, 0, false, false),

-- 4年生（8名）
('1019', '上野', 'parent', '[{"id": "p019", "name": "上野 奏音", "hiraganaName": "かのん", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1020', '本田', 'parent', '[{"id": "p020", "name": "本田 悠浬", "hiraganaName": "ゆうり", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1021', '山口(4)', 'parent', '[{"id": "p021", "name": "山口 光星", "hiraganaName": "こうせい", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1022', '東', 'parent', '[{"id": "p022", "name": "東 泰我", "hiraganaName": "たいが", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1023', '福田(4)', 'parent', '[{"id": "p023", "name": "福田 傑", "hiraganaName": "すぐる", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1024', '福田(4-2)', 'parent', '[{"id": "p024", "name": "福田 海心", "hiraganaName": "かいしん", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1025', '上川', 'parent', '[{"id": "p025", "name": "上川 菜穂", "hiraganaName": "なほ", "grade": 4, "position": ""}]'::jsonb, 0, false, false),
('1026', '嶽本', 'parent', '[{"id": "p026", "name": "嶽本 羽玖", "hiraganaName": "わく", "grade": 4, "position": ""}]'::jsonb, 0, false, false),

-- 3年生（6名）
('1027', '松下', 'parent', '[{"id": "p027", "name": "松下 慶将", "hiraganaName": "けいしょう", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1028', '北村', 'parent', '[{"id": "p028", "name": "北村 隆青", "hiraganaName": "りゅうせい", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1029', '福田(3)', 'parent', '[{"id": "p029", "name": "福田 斗琉", "hiraganaName": "とおり", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1030', '野田', 'parent', '[{"id": "p030", "name": "野田 悠真", "hiraganaName": "はるま", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1031', '小山', 'parent', '[{"id": "p031", "name": "小山 颯介", "hiraganaName": "そうすけ", "grade": 3, "position": ""}]'::jsonb, 0, false, false),
('1032', '佐藤(3)', 'parent', '[{"id": "p032", "name": "佐藤 暢亮", "hiraganaName": "ようすけ", "grade": 3, "position": ""}]'::jsonb, 0, false, false),

-- 2年生（4名）
('1033', '宮田', 'parent', '[{"id": "p033", "name": "宮田 楓心", "hiraganaName": "ふうと", "grade": 2, "position": ""}]'::jsonb, 0, false, false),
('1034', '山口(2)', 'parent', '[{"id": "p034", "name": "山口 誠一朗", "hiraganaName": "せいいちろう", "grade": 2, "position": ""}]'::jsonb, 0, false, false),
('1035', '鎗水', 'parent', '[{"id": "p035", "name": "鎗水 太凰", "hiraganaName": "たいおう", "grade": 2, "position": ""}]'::jsonb, 0, false, false),
('1036', '坂本(2)', 'parent', '[{"id": "p036", "name": "坂本 晴", "hiraganaName": "はる", "grade": 2, "position": ""}]'::jsonb, 0, false, false),

-- 1年生（3名）
('1037', '松岡(1)', 'parent', '[{"id": "p037", "name": "松岡 侑矢", "hiraganaName": "ゆうや", "grade": 1, "position": ""}]'::jsonb, 0, false, false),
('1038', '坂本(1)', 'parent', '[{"id": "p038", "name": "坂本 想", "hiraganaName": "そう", "grade": 1, "position": ""}]'::jsonb, 0, false, false),
('1039', '服部', 'parent', '[{"id": "p039", "name": "服部 健人", "hiraganaName": "けんと", "grade": 1, "position": ""}]'::jsonb, 0, false, false);

-- 実行後の確認
-- verify-user-insert.sql の4-7番のクエリで確認してください

