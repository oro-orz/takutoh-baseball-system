-- ===================================
-- Row Level Security (RLS) ポリシー設定
-- PINベース認証用のシンプルなアクセス制御
-- 
-- 注意: このシステムはSupabase認証ではなく、
-- 独自のPINベース認証を使用しているため、
-- 全ユーザーに読み書き権限を付与します。
-- ===================================

-- ===================================
-- 1. app_users テーブル
-- ===================================
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "app_users_select_policy" ON app_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "app_users_insert_policy" ON app_users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "app_users_update_policy" ON app_users
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "app_users_delete_policy" ON app_users
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 2. events テーブル
-- ===================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "events_select_policy" ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "events_insert_policy" ON events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "events_update_policy" ON events
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "events_delete_policy" ON events
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 3. participations テーブル
-- ===================================
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "participations_select_policy" ON participations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "participations_insert_policy" ON participations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "participations_update_policy" ON participations
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "participations_delete_policy" ON participations
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 4. expenses テーブル
-- ===================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "expenses_select_policy" ON expenses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "expenses_insert_policy" ON expenses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 5. expense_categories テーブル
-- ===================================
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "expense_categories_select_policy" ON expense_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "expense_categories_insert_policy" ON expense_categories
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "expense_categories_update_policy" ON expense_categories
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "expense_categories_delete_policy" ON expense_categories
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 6. expense_subcategories テーブル
-- ===================================
ALTER TABLE expense_subcategories ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "expense_subcategories_select_policy" ON expense_subcategories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "expense_subcategories_insert_policy" ON expense_subcategories
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "expense_subcategories_update_policy" ON expense_subcategories
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "expense_subcategories_delete_policy" ON expense_subcategories
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 7. quick_expenses テーブル
-- ===================================
ALTER TABLE quick_expenses ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "quick_expenses_select_policy" ON quick_expenses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "quick_expenses_insert_policy" ON quick_expenses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "quick_expenses_update_policy" ON quick_expenses
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "quick_expenses_delete_policy" ON quick_expenses
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 8. game_records テーブル
-- ===================================
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "game_records_select_policy" ON game_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "game_records_insert_policy" ON game_records
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "game_records_update_policy" ON game_records
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "game_records_delete_policy" ON game_records
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 9. files テーブル
-- ===================================
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "files_select_policy" ON files
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "files_insert_policy" ON files
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "files_update_policy" ON files
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "files_delete_policy" ON files
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- 10. recurring_patterns テーブル
-- ===================================
ALTER TABLE recurring_patterns ENABLE ROW LEVEL SECURITY;

-- 全員がすべての操作を実行可能
CREATE POLICY "recurring_patterns_select_policy" ON recurring_patterns
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "recurring_patterns_insert_policy" ON recurring_patterns
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "recurring_patterns_update_policy" ON recurring_patterns
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "recurring_patterns_delete_policy" ON recurring_patterns
  FOR DELETE
  TO public
  USING (true);

-- ===================================
-- ビューのSECURITY DEFINER問題の解決
-- ===================================

-- 既存のビューを削除して再作成（SECURITY INVOKERに変更）
DROP VIEW IF EXISTS monthly_expense_summary;
DROP VIEW IF EXISTS reimbursement_summary;

-- 月別支出集計ビュー（SECURITY INVOKER）
CREATE VIEW monthly_expense_summary 
WITH (security_invoker=true)
AS
SELECT 
  DATE_TRUNC('month', e.expense_date) as month,
  e.category_id,
  ec.name as category_name,
  e.subcategory_id,
  esc.name as subcategory_name,
  COUNT(*) as expense_count,
  SUM(e.amount) as total_amount
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id
LEFT JOIN expense_subcategories esc ON e.subcategory_id = esc.id
WHERE e.status IN ('approved', 'paid')
GROUP BY DATE_TRUNC('month', e.expense_date), e.category_id, ec.name, e.subcategory_id, esc.name
ORDER BY month DESC, total_amount DESC;

-- 立替金集計ビュー（SECURITY INVOKER）
CREATE VIEW reimbursement_summary
WITH (security_invoker=true)
AS
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

-- ===================================
-- 完了メッセージ
-- ===================================
SELECT '✅ RLSポリシーの設定が完了しました！' as message;
SELECT 'すべてのテーブルでRLSが有効化され、Supabaseのセキュリティエラーが解消されます。' as status;
SELECT 'PINベース認証のため、全ユーザーにフルアクセス権限が付与されています。' as note;
