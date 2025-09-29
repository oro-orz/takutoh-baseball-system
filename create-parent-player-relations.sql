-- 保護者と選手の紐付けテーブル作成

-- 1. 保護者-選手関係テーブルの作成
CREATE TABLE IF NOT EXISTS parent_player_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 同じ関係の重複登録を防ぐ
  UNIQUE(parent_id, player_id)
);

-- 2. インデックス作成
CREATE INDEX IF NOT EXISTS idx_parent_player_parent ON parent_player_relations(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_player_player ON parent_player_relations(player_id);

-- 3. 現在のテストユーザーの関係を作成
-- 田中家の保護者と選手の関係
INSERT INTO parent_player_relations (parent_id, player_id)
SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1001' AND p.name = '田中健一'  -- 田中健一
  AND pl.pin IN ('2001', '2007') AND pl.name IN ('田中次郎', '田中花子')

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1002' AND p.name = '田中大輔'  -- 田中大輔
  AND pl.pin IN ('2004') AND pl.name IN ('田中太郎')

UNION ALL

-- 佐藤家の関係
SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1003' AND p.name = '佐藤太郎'  -- 佐藤太郎
  AND pl.pin IN ('2002') AND pl.name IN ('佐藤三郎')

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1004' AND p.name = '佐藤次郎'  -- 佐藤次郎
  AND pl.pin IN ('2008') AND pl.name IN ('佐藤二郎')

UNION ALL

-- 他の保護者と選手の関係（1:1関係）
SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1005' AND p.name = '鈴木一郎'  -- 鈴木一郎
  AND pl.pin = '2005' AND pl.name = '鈴木一郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1006' AND p.name = '高橋三郎'  -- 高橋三郎
  AND pl.pin = '2010' AND pl.name = '高橋三郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1007' AND p.name = '高橋四郎'  -- 高橋四郎
  AND pl.pin = '2003' AND pl.name = '高橋四郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1008' AND p.name = '伊藤五郎'  -- 伊藤五郎
  AND pl.pin = '2006' AND pl.name = '伊藤五郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1009' AND p.name = '山田六郎'  -- 山田六郎
  AND pl.pin = '2009' AND pl.name = '山田六郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1010' AND p.name = '渡辺七郎'  -- 渡辺七郎
  AND pl.pin = '2011' AND pl.name = '渡辺七郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1011' AND p.name = '中村八郎'  -- 中村八郎
  AND pl.pin = '2013' AND pl.name = '中村八郎'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1012' AND p.name = '小林九郎'  -- 小林九郎
  AND pl.pin = '2012' AND pl.name = '高橋さくら'

UNION ALL

SELECT 
  p.id as parent_id,
  pl.id as player_id
FROM users p, users pl
WHERE p.pin = '1013' AND p.name = '加藤十郎'  -- 加藤十郎
  AND pl.pin = '2008' AND pl.name = '佐藤二郎'

-- 重複回避のためのON CONFLICT
ON CONFLICT (parent_id, player_id) DO NOTHING;

-- 4. 関係の確認クエリ
SELECT '保護者-選手関係作成完了' as status;

SELECT 
  pp.parent_name,
  pp.player_name,
  pp.parent_pin,
  pp.player_pin
FROM (
  SELECT 
    p.name as parent_name,
    pl.name as player_name,
    p.pin as parent_pin,
    pl.pin as player_pin,
    COUNT(*) as count_row
  FROM parent_player_relations rpr
  JOIN users p ON rpr.parent_id = p.id
  JOIN users pl ON rpr.player_id = pl.id
  GROUP BY p.name, pl.name, p.pin, pl.pin
) pp
ORDER BY pp.parent_name, pp.player_name;

-- 5. 保護者ごとの選手数
SELECT 
  p.name as parent_name,
  p.pin as parent_pin,
  COUNT(pl.id) as player_count
FROM parent_player_relations rpr
JOIN users p ON rpr.parent_id = p.id
JOIN users pl ON rpr.player_id = pl.id
GROUP BY p.name, p.pin
ORDER BY player_count DESC, p.name;

-- 6. 複数選手を持つ保護者の確認
SELECT 
  p.name as parent_name,
  COUNT(pl.id) as player_count,
  STRING_AGG(pl.name, ', ') as players
FROM parent_player_relations rpr
JOIN users p ON rpr.parent_id = p.id
JOIN users pl ON rpr.player_id = pl.id
GROUP BY p.name, p.pin
HAVING COUNT(pl.id) > 1
ORDER BY player_count DESC;
