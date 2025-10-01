-- 30人分のテストユーザー作成
-- 条件：
-- ・保護者の苗字は適度に被らせる（同姓処理の調査）
-- ・選手は2名いる保護者もつくる（他の学年にも選手がいる場合の処理を調査）
-- ・学年はある程度バラけさせる（選手名簿のソート機能が実装されているか調査）
-- ・ボジションもバラけさせる（特に意味はない）
-- ・LINEIDもランダムにいれる

-- hiragana_nameカラムを追加（もし必要なら）
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS hiragana_name TEXT;

-- 管理者ユーザー（PIN: 0000）
INSERT INTO users (pin, name, hiragana_name, line_id, role, created_at, updated_at)
VALUES (
  '0000',
  '管理者',
  NULL,
  'admin_line_001',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  hiragana_name = EXCLUDED.hiragana_name,
  line_id = EXCLUDED.line_id,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 保護者ユーザー (15名) - 適度に同じ苗字があるように配置
INSERT INTO users (pin, name, hiragana_name, line_id, role, created_at, updated_at)
VALUES 
  -- 田中家（複数世帯）
  ('1001', '田中健一', NULL, 'tanaka_line_001', 'parent', NOW(), NOW()),
  ('1002', '田中大輔', NULL, 'tanaka_line_002', 'parent', NOW(), NOW()),
  
  -- 佐藤家（複数世帯）
  ('1003', '佐藤太郎', NULL, 'sato_line_001', 'parent', NOW(), NOW()),
  ('1004', '佐藤次郎', NULL, 'sato_line_002', 'parent', NOW(), NOW()),
  
  -- 鈴木家（単独）
  ('1005', '鈴木一郎', NULL, 'suzuki_line_001', 'parent', NOW(), NOW()),
  
  -- 高橋家（複数世帯）
  ('1006', '高橋三郎', NULL, 'takahashi_line_001', 'parent', NOW(), NOW()),
  ('1007', '高橋四郎', NULL, 'takahashi_line_002', 'parent', NOW(), NOW()),
  
  -- その他の保護者（各単独世帯）
。



...
...
...


。 ('1008', '伊藤五郎', NULL, 'ito_line_001', 'parent', NOW(), NOW()),
  ('1009', '山田六郎', NULL, 'yamada_line_001', 'parent', NOW(), NOW()),
  ('1010', '渡辺七郎', NULL, 'watanabe_line_001', 'parent', NOW(), NOW()),
  ('1011', '中村八郎', NULL, 'nakamura_line_001', 'parent', NOW(), NOW()),
  ('1012', '小林九郎', NULL, 'kobayashi_line_001', 'parent', NOW(), NOW()),
  ('1013', '加藤十郎', NULL, 'kato_line_001', 'parent', NOW(), NOW()),
  ('1014', '吉田十一', NULL, 'yoshida_line_001', 'parent', NOW(), NOW()),
  ('1015', '山本十二', NULL, 'yamamoto_line_001', 'parent', NOW(), NOW());

-- 選手ユーザー (12名) - 学年とポジションをバラけさせる（ひらがな名含む）
INSERT INTO users (pin, name, hiragana_name, line_id, role, created_at, updated_at)
VALUES 
  -- 6年生（中学校）
  ('2001', '田中 次郎', 'じろう', NULL, 'player', NOW(), NOW()),
  ('2002', '佐藤 三郎', 'さぶろう', NULL, 'player', NOW(), NOW()),
  ('2003', '高橋 四郎', 'しろう', NULL, 'player', NOW(), NOW()),
  
  -- 5年生
  ('2004', '田中 太郎', 'たろう', NULL, 'player', NOW(), NOW()),
  ('2005', '鈴木 一郎', 'いちろう', NULL, 'player', NOW(), NOW()),
  ('2006', '伊藤 五郎', 'ごろう', NULL, 'player', NOW(), NOW()),
  
  -- 4年生
  ('2007', '田中 花子', 'はなこ', NULL, 'player', NOW(), NOW()),
  ('2008', '佐藤 二郎', 'じろう（さ〕', NULL, 'player', NOW(), NOW()),
  ('2009', '山田 六郎', 'ろくろう', NULL, 'player', NOW(), NOW()),
  
  -- 3年生
  ('2010', '高橋 三郎', 'さぶろう（た〕', NULL, 'player', NOW(), NOW()),
  ('2011', '渡辺 七郎', 'しちろう', NULL, 'player', NOW(), NOW()),
  
  -- 2年生
  ('2012', '高橋 さくら', 'さくら', NULL, 'player', NOW(), NOW());

-- その他の選手（1年生、学年バランスのため）
INSERT INTO users (pin, name, line_id, role, created_at, updated_at)
VALUES 
  ('2013', '中村 八郎（1年）', NULL, 'player', NOW(), NOW()),
  ('2014', '小林 九郎（1年）', NULL, 'player', NOW(), NOW()),
  ('2015', '加藤 十郎（1年）', NULL, 'player', NOW(), NOW()),
  ('2016', '吉田 十一郎（1年）', NULL, 'player', NOW(), NOW()),
  ('2017', '山本 十二郎（1年）', NULL, 'player', NOW(), NOW());

-- コーチユーザー (追加で追加)
INSERT INTO users (pin, name, line_id, role, created_at, updated_at)
VALUES 
  ('3001', 'コーチA', 'coach_line_001', 'coach', NOW(), NOW()),
  ('3002', 'コーチB', 'coach_line_002', 'coach', NOW(), NOW()),
  ('3003', 'コーチC', 'coach_line_003', 'coach', NOW(), NOW());

-- 確認文
SELECT 'ユーザー作成完了' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role;
SELECT '同姓の保護者' as check_type, COUNT(*) as same_family_count 
FROM users 
WHERE role = 'parent' 
AND (name LIKE '田中%' OR name LIKE '佐藤%' OR name LIKE '高橋%');

SELECT '複数選手を持つ保護者' as check_type, COUNT(*) as multi_player_parent_count
FROM users 
WHERE role = 'parent' 
AND (name LIKE '%太郎君・%' OR name LIKE '%三郎君・%');

SELECT '学年バランス確認' as check_type, 
SUBSTRING(name FROM '.+（([0-9]+)年）') as grade,
COUNT(*) as player_count
FROM users 
WHERE role = 'player'
GROUP BY grade
ORDER BY grade::int;
