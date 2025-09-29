-- 既存データの削除
DELETE FROM quick_expenses;
DELETE FROM expense_subcategories;
DELETE FROM expense_categories;

-- 新しい費目カテゴリーの投入
INSERT INTO expense_categories (name, display_order) VALUES
('部員・補食関連', 1),
('備品・消耗品', 2),
('遠征・交通費', 3),
('試合・大会関連', 4),
('ユニフォーム関連', 5),
('事務・運営費', 6),
('イベント関連', 7),
('謝礼・その他', 8);

-- サブカテゴリーの投入
INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('コーチお茶代', 1),
    ('飲料費', 2),
    ('氷代', 3),
    ('弁当代', 4),
    ('補食費', 5),
    ('保護者提供品費用', 6)
) AS sub(name, display_order)
WHERE ec.name = '部員・補食関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('ボール代', 1),
    ('バット代', 2),
    ('グローブ代', 3),
    ('ヘルメット代', 4),
    ('練習用具（ティー、ネットなど）', 5),
    ('道具修理費', 6),
    ('消耗品', 7)
) AS sub(name, display_order)
WHERE ec.name = '備品・消耗品';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('バス代', 1),
    ('レンタカー代', 2),
    ('ガソリン代', 3),
    ('高速道路代', 4),
    ('駐車場代', 5),
    ('宿泊費', 6),
    ('遠征食費', 7)
) AS sub(name, display_order)
WHERE ec.name = '遠征・交通費';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('大会参加費', 1),
    ('球場使用料', 2),
    ('審判関連費用', 3),
    ('トロフィー・賞状代', 4),
    ('スコアブック代', 5),
    ('用具搬送費', 6)
) AS sub(name, display_order)
WHERE ec.name = '試合・大会関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('ユニフォーム購入費', 1),
    ('帽子代', 2),
    ('背番号・名入れ加工費', 3),
    ('スパイク・ソックス補助費', 4)
) AS sub(name, display_order)
WHERE ec.name = 'ユニフォーム関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('場所代', 1),
    ('年会費（連盟・リーグ登録）', 2),
    ('スポーツ保険料', 3),
    ('印刷費（名簿・案内）', 4),
    ('文具代', 5),
    ('ドメイン管理費', 6),
    ('Web運営費', 7)
) AS sub(name, display_order)
WHERE ec.name = '事務・運営費';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('懇親会費用', 1),
    ('体験会費用', 2),
    ('卒団式費用', 3),
    ('記念品購入', 4),
    ('のぼり代', 5),
    ('写真・ムービー制作費', 6)
) AS sub(name, display_order)
WHERE ec.name = 'イベント関連';

INSERT INTO expense_subcategories (category_id, name, display_order)
SELECT 
  ec.id,
  sub.name,
  sub.display_order
FROM expense_categories ec
CROSS JOIN (
  VALUES 
    ('コーチ謝礼', 1),
    ('指導者交通費補助', 2),
    ('寄付金支出', 3),
    ('募金関連支出', 4)
) AS sub(name, display_order)
WHERE ec.name = '謝礼・その他';

-- よく使われる費目の設定
INSERT INTO quick_expenses (category_id, subcategory_id, label, display_order)
SELECT 
  ec.id,
  esc.id,
  qe.label,
  qe.display_order
FROM expense_categories ec
JOIN expense_subcategories esc ON ec.id = esc.category_id
CROSS JOIN (
  VALUES 
    ('コーチお茶代', 'コーチお茶代', 1),
    ('消耗品', '消耗品', 2),
    ('大会参加費', '大会参加費', 3),
    ('懇親会費用', '懇親会費用', 4)
) AS qe(subcategory_name, label, display_order)
WHERE ec.name = '部員・補食関連' AND esc.name = qe.subcategory_name
   OR ec.name = '備品・消耗品' AND esc.name = qe.subcategory_name
   OR ec.name = '試合・大会関連' AND esc.name = qe.subcategory_name
   OR ec.name = 'イベント関連' AND esc.name = qe.subcategory_name;
