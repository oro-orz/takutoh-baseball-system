-- 30人分のサンプルユーザーデータ追加クエリ

-- 1. 必要なカラムを追加（まだ存在しない場合）
ALTER TABLE users ADD COLUMN IF NOT EXISTS hiragana_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 2. 管理者ユーザー（PIN: 0000）
INSERT INTO users (pin, name, email, hiragana_name, line_id, role, is_admin, created_at, updated_at)
VALUES (
  '0000',
  '管理者',
  'admin@example.com',
  NULL,
  'admin_line_001',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  hiragana_name = EXCLUDED.hiragana_name,
  line_id = EXCLUDED.line_id,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 3. 保護者ユーザー (15名) - 適度に同じ苗字があるように配置
INSERT INTO users (pin, name, email, hiragana_name, line_id, role, is_admin, created_at, updated_at)
VALUES 
  -- 田中家（複数世帯）
  ('1001', '田中健一', 'tanaka.ken@example.com', NULL, 'tanaka_line_001', 'parent', false, NOW(), NOW()),
  ('1002', '田中大輔', 'tanaka.daisuke@example.com', NULL, 'tanaka_line_002', 'parent', false, NOW(), NOW()),
  
  -- 佐藤家（複数世帯）
  ('1003', '佐藤太郎', 'sato.taro@example.com', NULL, 'sato_line_001', 'parent', false, NOW(), NOW()),
  ('1004', '佐藤次郎', 'sato.jiro@example.com', NULL, 'sato_line_002', 'parent', false, NOW(), NOW()),
  
  -- 鈴木家（単独）
  ('1005', '鈴木一郎', 'suzuki.ichiro@example.com', NULL, 'suzuki_line_001', 'parent', false, NOW(), NOW()),
  
  -- 高橋家（複数世帯）
  ('1006', '高橋三郎', 'takahashi.saburo@example.com', NULL, 'takahashi_line_001', 'parent', false, NOW(), NOW()),
  ('1007', '高橋四郎', 'takahashi.shiro@example.com', NULL, 'takahashi_line_002', 'parent', false, NOW(), NOW()),
  
  -- その他の保護者（各単独世帯）
  ('1008', '伊藤五郎', 'ito.goro@example.com', NULL, 'ito_line_001', 'parent', false, NOW(), NOW()),
  ('1009', '山田六郎', 'yamada.rokuro@example.com', NULL, 'yamada_line_001', 'parent', false, NOW(), NOW()),
  ('1010', '渡辺七郎', 'watanabe.shichiro@example.com', NULL, 'watanabe_line_001', 'parent', false, NOW(), NOW()),
  ('1011', '中村八郎', 'nakamura.hachiro@example.com', NULL, 'nakamura_line_001', 'parent', false, NOW(), NOW()),
  ('1012', '小林九郎', 'kobayashi.kuroro@example.com', NULL, 'kobayashi_line_001', 'parent', false, NOW(), NOW()),
  ('1013', '加藤十郎', 'kato.juro@example.com', NULL, 'kato_line_001', 'parent', false, NOW(), NOW()),
  ('1014', '吉田十一', 'yoshida.juichiro@example.com', NULL, 'yoshida_line_001', 'parent', false, NOW(), NOW()),
  ('1015', '山本十二', 'yamamoto.juni@example.com', NULL, 'yamamoto_line_001', 'parent', false, NOW(), NOW())
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  hiragana_name = EXCLUDED.hiragana_name,
  line_id = EXCLUDED.line_id,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 4. 選手ユーザー (13名) - ひらがな名を含む（学年バランス調整済み）
INSERT INTO users (pin, name, email, hiragana_name, line_id, role, is_admin, created_at, updated_at)
VALUES 
  -- 6年生（中学校）
  ('2001', '田中次郎', 'player.tanaka.jiro@example.com', 'じろう', NULL, 'player', false, NOW(), NOW()),
  ('2002', '佐藤三郎', 'player.sato.saburo@example.com', 'さぶろう', NULL, 'player', false, NOW(), NOW()),
  ('2003', '高橋四郎', 'player.takahashi.shiro@example.com', 'しろう', NULL, 'player', false, NOW(), NOW()),
  
  -- 5年生
  ('2004', '田中太郎', 'player.tanaka.taro@example.com', 'たろう', NULL, 'player', false, NOW(), NOW()),
  ('2005', '鈴木一郎', 'player.suzuki.ichiro@example.com', 'いちろう', NULL, 'player', false, NOW(), NOW()),
  ('2006', '伊藤五郎', 'player.ito.goro@example.com', 'ごろう', NULL, 'player', false, NOW(), NOW()),
  
  -- 4年生
  ('2007', '田中花子', 'player.tanaka.hanako@example.com', 'はなこ', NULL,'player', false, NOW(), NOW()),
  ('2008', '佐藤二郎', '__player.sato__,jiro@example.com__', '__じろう（さ）__', NULL, 'player', false, NOW(), NOW()),
  ('2009', '山田六郎', 'player.yamada.rokuro@example.com', 'ろくろう', NULL, 'player', false, NOW(), NOW()),
  
  -- 3年生
  ('2010', '高橋三郎', '__player.takahashi.saburo@example.com__', '__さぶろう（た）__', NULL, 'player', false, NOW(), NOW()),
  ('2011', '渡辺七郎', '__player.watanabe.shichiro@example.com__', '__しちろう__', NULL, 'player', false, NOW(), NOW()),
  
  -- 2年生
  ('2012', '高橋さくら', '__player.takahashi.sakura@example.com__', '__さくら__', NULL, 'player', false, NOW(), NOW()),
  
  -- 1年生（学年バランスのため）
  ('2013', '中村八郎', '__player.nakamura.hachiro@example.com__', '__はちろう__', NULL, 'player', false, NOW(), NOW())
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  hiragana_name = EXCLUDED.hiragana_name,
  line_id = EXCLUDED.line_id,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 5. コーチユーザー (3名)
INSERT INTO users (pin, name, hiragana_name, line_id, role, is_admin, created_at, updated_at)
VALUES 
  ('3001', 'コーチA', NULL, 'coach_line_001', 'coach', false, NOW(), NOW()),
  ('3002', 'コーチB', NULL, 'coach_line_002', 'coach', false, NOW(), NOW()),
  ('3003', 'コーチC', NULL, 'coach_line_003', 'coach', false, NOW(), NOW())
ON CONFLICT (pin) DO UPDATE SET
  name = EXCLUDED.name,
  hiragana_name = EXCLUDED.hiragana_name,
  line_id = EXCLUDED.line_id,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 6. 確認クエリ
SELECT 'サンプルユーザー追加完了' as status;

-- ロール別ユーザー数
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY role;

-- 保護者の同姓コメント
SELECT 
    '保護者の同姓チェック' as check_type,
    CASE 
        WHEN name LIKE '田中%' THEN '田中'
        WHEN name LIKE '佐藤%' THEN '佐藤'
        WHEN name LIKE '高橋%' THEN '高橋'
        WHEN name LIKE '山田%' THEN '山田'
        ELSE 'その他'
    END as family_name,
    COUNT(*) as count
FROM users 
WHERE role = 'parent'
GROUP BY family_name
ORDER BY count DESC;

-- 選手の学年分布
SELECT 
    '選手学年分布' as check_type,
    CASE 
        WHEN pin LIKE '2%' THEN '選手'
     -- 学年はひらがな名から推測できないため、pinで判定
        ELSE 'その他'
    END as category,
    COUNT(*) as count
FROM users 
WHERE role = 'player'
GROUP BY category;

-- 複数選手を持つ保護者の確認
SELECT 
    name as parent_name,
    COUNT(*) as expected_multiple_children
FROM users 
WHERE role = 'parent'
AND name IN ('田中健一', '田中大輔', '佐藤太郎', '佐藤次郎', '高橋三郎', '高橋四郎')
GROUP BY name;
