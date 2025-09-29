-- ========================================
-- 現在のSupabaseテストデータ確認クエリ
-- ========================================

-- 1. usersテーブルの内容確認
SELECT 
  id, 
  name, 
  pin, 
  is_admin, 
  email, 
  role, 
  created_at,
  updated_at
FROM users 
ORDER BY created_at;

-- 2. expensesテーブルの内容確認（支出データ）
SELECT 
  e.id,
  e.user_id,
  e.expense_date,
  e.amount,
  e.status,
  e.created_at,
  u.name as user_name,
  ec.name as category_name,
  esc.name as subcategory_name
FROM expenses e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN expense_categories ec ON e.category_id = ec.id
LEFT JOIN expense_subcategories esc ON e.subcategory_id = esc.id
ORDER BY e.created_at DESC;

-- 3. expense_categoriesテーブル（費目カテゴリ）
SELECT id, name, display_order 
FROM expense_categories 
ORDER BY display_order;

-- 4. expense_subcategoriesテーブル（費目サブカテゴリ）
SELECT id, category_id, name, display_order 
FROM expense_subcategories 
ORDER BY display_order;

-- 5. 統計確認
SELECT 
  COUNT(*) as total_expenses,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
  SUM(amount) as total_amount
FROM expenses;
