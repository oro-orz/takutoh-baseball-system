-- 現在のSupabase usersテーブル構造に合わせたクリーンナップ＋データ追加
-- まず既存のusersテーブル構造を確認するクエリ

-- 1. 現在のusersテーブルのカラム構造確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 既存データのクリーンナップ（管理者以外を削除）
DELETE FROM users 
WHERE role IN ('parent', 'player', 'coach')
OR email LIKE '%example.com%'
OR email LIKE '%@system.local';

-- 3. 管理者のみ残すか確認
SELECT 'クリーンナップ後のユーザー数' as status, COUNT(*) as count FROM users;

-- 4. 保護者データの追加（実際のカラムに合わせて）
-- 田中健一（PIN: 1001）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1001', '田中健一', 'tanaka.ken@example.com', 'parent', false, NOW(), NOW()
);

-- 田中大輔（PIN: 1002）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1002', '田中大輔', 'tanaka.daisuke@example.com', 'parent', false, NOW(), NOW()
);

-- 佐藤太郎（PIN: 1003）  
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1003', '佐藤太郎', 'sato.taro@example.com', 'parent', false, NOW(), NOW()
);

-- 佐藤次郎（PIN: 1004）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1004', '佐藤次郎', 'sato.jiro@example.com', 'parent', false, NOW(), NOW()
);

-- 鈴木一郎（PIN: 1005）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1005', '鈴木一郎', 'suzuki.ichiro@example.com', 'parent', false, NOW(), NOW()
);

-- 高橋三郎（PIN: 1006）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1006', '高橋三郎', 'takahashi.saburo@example.com', 'parent', false, NOW(), NOW()
);

-- 高橋四郎（PIN: 1007）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES (
  '1007', '高橋四郎', 'takahashi.shiro@example.com', 'parent', false, NOW(), NOW()
);

-- 5. 残りの保護者（一括INSERT）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES 
  ('1008', '伊藤五郎', 'ito.goro@example.com', 'parent', false, NOW(), NOW()),
  ('1009', '山田六郎', 'yamada.rokuro@example.com', 'parent', false, NOW(), NOW()),
  ('1010', '渡辺七郎', 'watanabe.shichiro@example.com', 'parent', false, NOW(), NOW()),
  ('1011', '中村八郎', 'nakamura.hachiro@example.com', 'parent', false, NOW(), NOW()),
  ('1012', '小林九郎', 'kobayashi.kuroro@example.com', 'parent', false, NOW(), NOW()),
  ('1013', '加藤十郎', 'kato.juro@example.com', 'parent', false, NOW(), NOW()),
  ('1014', '吉田十一', 'yoshida.juichiro@example.com', 'parent', false, NOW(), NOW()),
  ('1015', '山本十二', 'yamamoto.juni@example.com', 'parent', false, NOW(), NOW());

-- 6. 生徒（選手）の追加（各保護者の子どもたち）
-- 田中の子どもたち
INSERT INTO users (
  pin, name, email, role, is_admin,
  created_at, updated_at
) VALUES 
  ('2001', '田中次郎', 'player.tanaka.jiro@example.com', 'player', false, NOW(), NOW()),
  ('2002', '田中花子', 'player.tanaka.hanako@example.com', 'player', false, NOW(), NOW()),
  ('2003', '田中太郎', 'player.tanaka.taro@example.com', 'player', false, NOW(), NOW());

-- 佐藤の子どもたち
INSERT INTO users (
  pin, name, email, role, is_admin,
  created_at, updated_at
) VALUES 
  ('2004', '佐藤三郎', 'player.sato.saburo@example.com', 'player', false, NOW(), NOW()),
  ('2005', '佐藤二郎', 'player.sato.jiro@example.com', 'player', false, NOW(), NOW());

-- 高橋の子どもたち
INSERT INTO users (
  pin, name, email, role, is_admin,
  created_at, updated_at
) VALUES 
  ('2006', '高橋三郎', 'player.takahashi.saburo@example.com', 'player', false, NOW(), NOW()),
  ('2007', '高橋さくら', 'player.takahashi.sakura@example.com', 'player', false, NOW(), NOW());

-- その他の選手
INSERT INTO users (
  pin, name, email, role, is_admin,
  created_at, updated_at
) VALUES 
  ('2008', '鈴木一郎', 'player.suzuki.ichiro@example.com', 'player', false, NOW(), NOW()),
  ('2009', '伊藤五郎', 'player.ito.goro@example.com', 'player', false, NOW(), NOW()),
  ('2010', '山田六郎', 'player.yamada.rokuro@example.com', 'player', false, NOW(), NOW()),
  ('2011', '渡辺七郎', 'player.watanabe.shichiro@example.com', 'player', false, NOW(), NOW()),
  ('2012', '中村八郎', 'player.nakamura.hachiro@example.com', 'player', false, NOW(), NOW()),
  ('2013', '小林九郎', 'player.kobayashi.kuroro@example.com', 'player', false, NOW(), NOW()),
  ('2014', '加藤十郎', 'player.kato.juro@example.com', 'player', false, NOW(), NOW()),
  ('2015', '吉田十一郎', 'player.yoshida.juichiro@example.com', 'player', false, NOW(), NOW()),
  ('2016', '山本十二郎', 'player.yamamoto.juni@example.com', 'player', false, NOW(), NOW());

-- 7. コーチの追加（3名）
INSERT INTO users (
  pin, name, email, role, is_admin, 
  created_at, updated_at
) VALUES 
  ('3001', 'コーチA', 'coach.a@example.com', 'coach', false, NOW(), NOW()),
  ('3002', 'コーチB', 'coach.b@example.com', 'coach', false, NOW(), NOW()),
  ('3003', 'コーチC', 'coach.c@example.com', 'coach', false, NOW(), NOW());

-- 7. 確認クエリ
SELECT 'データ追加完了' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;

-- 保護者のリスト（確認用）
SELECT name, pin, email, role FROM users WHERE role = 'parent' ORDER BY pin;
