-- 既存ユーザーの選手IDを新しいID規則（学年×1000+連番）に更新
-- 実行前に必ずバックアップを取得してください

-- 実行前の確認
SELECT 
  u.pin,
  u.name,
  p.value->>'id' as old_player_id,
  p.value->>'name' as player_name,
  p.value->>'grade' as grade
FROM users u,
jsonb_array_elements(u.players) p
WHERE u.role = 'parent'
ORDER BY u.pin;

-- 全ユーザーの選手IDを更新（一括上書き）
-- 注意: 以下のUPDATE文を実行すると、既存の選手IDがすべて上書きされます

UPDATE users SET players = '[{"id": "6001", "name": "重村 俊之介", "hiraganaName": "しゅんのすけ", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1001';
UPDATE users SET players = '[{"id": "6002", "name": "杉本 瑛真", "hiraganaName": "えいしん", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1002';
UPDATE users SET players = '[{"id": "6003", "name": "中川 煌雅", "hiraganaName": "こうが", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1003';
UPDATE users SET players = '[{"id": "6004", "name": "古市 佳輝", "hiraganaName": "よしき", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1004';
UPDATE users SET players = '[{"id": "6005", "name": "浦田 颯将", "hiraganaName": "そうすけ", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1005';
UPDATE users SET players = '[{"id": "6006", "name": "松谷 太聖", "hiraganaName": "たいせい", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1006';
UPDATE users SET players = '[{"id": "6007", "name": "満永 匡香", "hiraganaName": "きょうか", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1007';
UPDATE users SET players = '[{"id": "6008", "name": "齋藤 天翔", "hiraganaName": "てんしょう", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1008';
UPDATE users SET players = '[{"id": "6009", "name": "千々岩 琉生", "hiraganaName": "るい", "grade": 6, "position": ""}]'::jsonb WHERE pin = '1009';

UPDATE users SET players = '[{"id": "5001", "name": "吉田 涼悟", "hiraganaName": "りょうご", "grade": 5, "position": ""}]'::jsonb WHERE pin = '1010';
UPDATE users SET players = '[{"id": "5002", "name": "坂口 結輝", "hiraganaName": "ゆうき", "grade": 5, "position": ""}]'::jsonb WHERE pin = '1011';
UPDATE users SET players = '[{"id": "5003", "name": "松岡 遼玖", "hiraganaName": "りく", "grade": 5, "position": ""}, {"id": "1001", "name": "松岡 侑矢", "hiraganaName": "ゆうや", "grade": 1, "position": ""}]'::jsonb WHERE pin = '1012';
UPDATE users SET players = '[{"id": "5004", "name": "河野 兼典", "hiraganaName": "けんすけ", "grade": 5, "position": ""}]'::jsonb WHERE pin = '1013';
UPDATE users SET players = '[{"id": "5005", "name": "田中 海晴", "hiraganaName": "かいせい", "grade": 5, "position": ""}]'::jsonb WHERE pin = '1014';
UPDATE users SET players = '[{"id": "5006", "name": "佐藤 映太", "hiraganaName": "えいた", "grade": 5, "position": ""}]'::jsonb WHERE pin = '1015';
UPDATE users SET players = '[{"id": "5007", "name": "山口 逢生", "hiraganaName": "あおい", "grade": 5, "position": ""}, {"id": "4007", "name": "山口 光星", "hiraganaName": "ひかる", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1016';
UPDATE users SET players = '[{"id": "5008", "name": "倪 永旭", "hiraganaName": "あさひ", "grade": 5, "position": ""}]'::jsonb WHERE pin = '1017';

UPDATE users SET players = '[{"id": "4001", "name": "上野 奏音", "hiraganaName": "かのん", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1018';
UPDATE users SET players = '[{"id": "4002", "name": "本田 悠浬", "hiraganaName": "ゆうり", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1019';
UPDATE users SET players = '[{"id": "4003", "name": "東 泰我", "hiraganaName": "たいが", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1020';
UPDATE users SET players = '[{"id": "4004", "name": "福田 傑", "hiraganaName": "すぐる", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1021';
UPDATE users SET players = '[{"id": "4005", "name": "福田 海心", "hiraganaName": "かいしん", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1022';
UPDATE users SET players = '[{"id": "4006", "name": "上川 菜穂", "hiraganaName": "なほ", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1023';
UPDATE users SET players = '[{"id": "4008", "name": "嶽本 羽玖", "hiraganaName": "わく", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1024';
UPDATE users SET players = '[{"id": "4009", "name": "小平 聖夏", "hiraganaName": "せな", "grade": 4, "position": ""}]'::jsonb WHERE pin = '1025';

UPDATE users SET players = '[{"id": "3001", "name": "松下 慶将", "hiraganaName": "けいしょう", "grade": 3, "position": ""}]'::jsonb WHERE pin = '1026';
UPDATE users SET players = '[{"id": "3002", "name": "北村 隆青", "hiraganaName": "りゅうせい", "grade": 3, "position": ""}]'::jsonb WHERE pin = '1027';
UPDATE users SET players = '[{"id": "3003", "name": "福田 斗琉", "hiraganaName": "とおり", "grade": 3, "position": ""}]'::jsonb WHERE pin = '1028';
UPDATE users SET players = '[{"id": "3004", "name": "野田 悠真", "hiraganaName": "はるま", "grade": 3, "position": ""}]'::jsonb WHERE pin = '1029';
UPDATE users SET players = '[{"id": "3005", "name": "小山 颯介", "hiraganaName": "そうすけ", "grade": 3, "position": ""}]'::jsonb WHERE pin = '1030';
UPDATE users SET players = '[{"id": "3006", "name": "佐藤 暢亮", "hiraganaName": "ようすけ", "grade": 3, "position": ""}]'::jsonb WHERE pin = '1031';

UPDATE users SET players = '[{"id": "2001", "name": "宮田 楓心", "hiraganaName": "ふうと", "grade": 2, "position": ""}]'::jsonb WHERE pin = '1032';
UPDATE users SET players = '[{"id": "2002", "name": "鎗水 太凰", "hiraganaName": "たいおう", "grade": 2, "position": ""}]'::jsonb WHERE pin = '1033';
UPDATE users SET players = '[{"id": "2003", "name": "坂本 晴", "hiraganaName": "はる", "grade": 2, "position": ""}, {"id": "1002", "name": "坂本 想", "hiraganaName": "そう", "grade": 1, "position": ""}]'::jsonb WHERE pin = '1034';

UPDATE users SET players = '[{"id": "1003", "name": "服部 健人", "hiraganaName": "けんと", "grade": 1, "position": ""}]'::jsonb WHERE pin = '1035';

-- 実行後の確認
SELECT 
  u.pin,
  u.name,
  p.value->>'id' as new_player_id,
  p.value->>'name' as player_name,
  p.value->>'grade' as grade
FROM users u,
jsonb_array_elements(u.players) p
WHERE u.role = 'parent'
ORDER BY u.pin;

-- participationsテーブルの選手IDも更新が必要な場合は以下を実行
-- 注意: 既存の参加状況データがある場合、player_idの更新が必要です
-- 以下は手動で旧ID→新IDのマッピングを確認してから実行してください

