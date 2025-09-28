-- 会計管理機能のテーブル追加
-- 既存のdatabase-schema.sqlに追加する内容

-- 費目カテゴリーテーブル
CREATE TABLE expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 費目サブカテゴリーテーブル
CREATE TABLE expense_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支出テーブル
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES expense_categories(id),
  subcategory_id UUID REFERENCES expense_subcategories(id),
  description TEXT,
  receipt_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'paid')) DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- よく使われる費目テーブル
CREATE TABLE quick_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES expense_subcategories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 立替金集計ビュー（リアルタイム集計用）
CREATE VIEW reimbursement_summary AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  COALESCE(SUM(e.amount), 0) as total_amount,
  COUNT(e.id) as expense_count,
  MAX(e.created_at) as last_expense_date
FROM users u
LEFT JOIN expenses e ON u.id = e.user_id AND e.status IN ('pending', 'approved')
WHERE u.role = 'parent'
GROUP BY u.id, u.name
ORDER BY total_amount DESC;

-- 月別支出集計ビュー
CREATE VIEW monthly_expense_summary AS
SELECT 
  DATE_TRUNC('month', expense_date) as month,
  category_id,
  ec.name as category_name,
  subcategory_id,
  esc.name as subcategory_name,
  COUNT(*) as expense_count,
  SUM(amount) as total_amount
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id
LEFT JOIN expense_subcategories esc ON e.subcategory_id = esc.id
WHERE status IN ('approved', 'paid')
GROUP BY DATE_TRUNC('month', expense_date), category_id, ec.name, subcategory_id, esc.name
ORDER BY month DESC, total_amount DESC;

-- インデックス作成
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_subcategory ON expenses(subcategory_id);
CREATE INDEX idx_expense_subcategories_category ON expense_subcategories(category_id);

-- 初期データの挿入
INSERT INTO expense_categories (name, display_order) VALUES
('部員・補食関連', 1),
('備品・消耗品', 2),
('遠征・交通費', 3),
('試合・大会関連', 4),
('ユニフォーム関連', 5),
('事務・運営費', 6),
('イベント関連', 7),
('謝礼・その他', 8);

-- サブカテゴリーの初期データ
INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('コーチお茶代', 1),
  ('飲料費', 2),
  ('氷代', 3),
  ('弁当代', 4),
  ('補食費', 5),
  ('保護者提供品費用', 6)
) AS subcat(name, display_order)
WHERE ec.name = '部員・補食関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('ボール代', 1),
  ('バット代', 2),
  ('グローブ代', 3),
  ('ヘルメット代', 4),
  ('練習用具（ティー、ネットなど）', 5),
  ('道具修理費', 6),
  ('消耗品', 7)
) AS subcat(name, display_order)
WHERE ec.name = '備品・消耗品';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('バス代', 1),
  ('レンタカー代', 2),
  ('ガソリン代', 3),
  ('高速道路代', 4),
  ('駐車場代', 5),
  ('宿泊費', 6),
  ('遠征食費', 7)
) AS subcat(name, display_order)
WHERE ec.name = '遠征・交通費';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('大会参加費', 1),
  ('球場使用料', 2),
  ('審判関連費用', 3),
  ('トロフィー・賞状代', 4),
  ('スコアブック代', 5),
  ('用具搬送費', 6)
) AS subcat(name, display_order)
WHERE ec.name = '試合・大会関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('ユニフォーム購入費', 1),
  ('帽子代', 2),
  ('背番号・名入れ加工費', 3),
  ('スパイク・ソックス補助費', 4)
) AS subcat(name, display_order)
WHERE ec.name = 'ユニフォーム関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('場所代', 1),
  ('年会費（連盟・リーグ登録）', 2),
  ('スポーツ保険料', 3),
  ('印刷費（名簿・案内）', 4),
  ('文具代', 5),
  ('ドメイン管理費', 6),
  ('Web運営費', 7)
) AS subcat(name, display_order)
WHERE ec.name = '事務・運営費';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('懇親会費用', 1),
  ('体験会費用', 2),
  ('卒団式費用', 3),
  ('記念品購入', 4),
  ('のぼり代', 5),
  ('写真・ムービー制作費', 6)
) AS subcat(name, display_order)
WHERE ec.name = 'イベント関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  subcat.name,
  subcat.display_order
FROM expense_categories ec,
(VALUES 
  ('コーチ謝礼', 1),
  ('指導者交通費補助', 2),
  ('寄付金支出', 3),
  ('募金関連支出', 4)
) AS subcat(name, display_order)
WHERE ec.name = '謝礼・その他';

-- よく使われる費目の初期データ
INSERT INTO quick_expenses (category_id, subcategory_id, label, display_order)
SELECT 
  ec.id,
  esc.id,
  'コーチお茶代',
  1
FROM expense_categories ec
JOIN expense_subcategories esc ON ec.id = esc.category_id
WHERE ec.name = '部員・補食関連' AND esc.name = 'コーチお茶代';

INSERT INTO quick_expenses (category_id, subcategory_id, label, display_order)
SELECT 
  ec.id,
  esc.id,
  '消耗品',
  2
FROM expense_categories ec
JOIN expense_subcategories esc ON ec.id = esc.category_id
WHERE ec.name = '備品・消耗品' AND esc.name = '消耗品';

INSERT INTO quick_expenses (category_id, subcategory_id, label, display_order)
SELECT 
  ec.id,
  esc.id,
  '大会参加費',
  3
FROM expense_categories ec
JOIN expense_subcategories esc ON ec.id = esc.category_id
WHERE ec.name = '試合・大会関連' AND esc.name = '大会参加費';

INSERT INTO quick_expenses (category_id, subcategory_id, label, display_order)
SELECT 
  ec.id,
  esc.id,
  '懇親会費用',
  4
FROM expense_categories ec
JOIN expense_subcategories esc ON ec.id = esc.category_id
WHERE ec.name = 'イベント関連' AND esc.name = '懇親会費用';
