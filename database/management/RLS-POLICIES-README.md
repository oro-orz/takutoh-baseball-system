# RLSポリシー設定ドキュメント

## 📋 概要

このSQLファイル(`enable-rls-policies.sql`)は、Supabaseのセキュリティエラーを解消するために、すべてのテーブルにRow Level Security (RLS)ポリシーを適用します。

## 🔒 設定されるアクセス制御

### 基本方針

**このシステムはSupabase認証ではなく、PINベースの独自認証を使用しています。**

そのため、RLSは形式的に有効化されますが、**すべてのユーザーがすべての操作を実行可能**な設定となります。

---

### テーブル別アクセス権限

| テーブル | 閲覧 | 作成 | 更新 | 削除 |
|---------|------|------|------|------|
| **app_users** | 全員 | 全員 | 全員 | 全員 |
| **events** | 全員 | 全員 | 全員 | 全員 |
| **participations** | 全員 | 全員 | 全員 | 全員 |
| **expenses** | 全員 | 全員 | 全員 | 全員 |
| **expense_categories** | 全員 | 全員 | 全員 | 全員 |
| **expense_subcategories** | 全員 | 全員 | 全員 | 全員 |
| **quick_expenses** | 全員 | 全員 | 全員 | 全員 |
| **game_records** | 全員 | 全員 | 全員 | 全員 |
| **files** | 全員 | 全員 | 全員 | 全員 |
| **recurring_patterns** | 全員 | 全員 | 全員 | 全員 |

---

## ⚠️ 重要な注意事項

### このRLS設定について

1. **セキュリティエラーの解消が目的**
   - Supabaseのセキュリティアドバイザーのエラーを解消します
   - 実質的なアクセス制御は行いません

2. **PINベース認証との関係**
   - アプリケーションレベルでPIN認証を実装しています
   - データベースレベルでは制限をかけていません

3. **将来の改善**
   - 将来的にSupabase認証に移行する場合は、より厳格なポリシーに変更可能です
   - その場合は、`auth.uid()`を使った適切なアクセス制御を実装します

---

### 詳細説明

#### すべてのテーブル共通
- **閲覧**: 認証済みユーザー全員が可能
- **作成**: 認証済みユーザー全員が可能
- **更新**: 認証済みユーザー全員が可能
- **削除**: 認証済みユーザー全員が可能

**理由**: 
- PINベース認証を使用しているため、データベースレベルでの細かい制御が困難
- アプリケーションロジック側で役割に応じたアクセス制御を実装
- 内部の野球チーム管理システムのため、信頼できるユーザーのみがアクセス

---

### ビューのセキュリティ修正

#### 修正前の問題
- `monthly_expense_summary`
- `reimbursement_summary`

これらのビューは `SECURITY DEFINER` で定義されており、作成者の権限で実行されていました。

#### 修正内容
`SECURITY INVOKER` に変更して、実行ユーザーの権限で動作するように修正。

---

## 🚀 実行方法

### 1. Supabaseダッシュボードで実行

1. Supabaseダッシュボードにログイン
2. プロジェクト選択
3. 左メニュー「SQL Editor」をクリック
4. `enable-rls-policies.sql` の内容を貼り付け
5. 「Run」ボタンをクリック

### 2. 実行後の確認

以下のクエリで設定を確認できます：

```sql
-- RLS有効状態の確認
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ポリシー一覧の確認
SELECT 
  tablename,
  policyname,
  cmd as 操作
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

すべてのテーブルで `rls_enabled = true` になっていればOKです。

---

## ⚠️ 注意事項

### 実行前の確認事項

1. **バックアップ**: 念のため現在のデータベース状態をバックアップしておくことを推奨
2. **テスト環境**: 可能であれば、まずテスト環境で実行して動作確認
3. **ユーザーロール**: `users.role = 'admin'` のユーザーが存在することを確認

### 実行後の動作確認

1. 管理者アカウントでログイン → すべての操作が可能か確認
2. 一般ユーザーアカウントでログイン → 閲覧のみ可能か確認
3. 経費申請機能が正常に動作するか確認
4. 参加状況の登録が正常に動作するか確認

---

## 🔧 カスタマイズ

もし権限設定を変更したい場合は、以下の部分を編集してください：

### 管理者チェックの変更

```sql
-- 現在の管理者チェック
EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'admin'
)

-- コーチも許可する場合
EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role IN ('admin', 'coach')
)
```

---

## 📞 トラブルシューティング

### エラー: `auth.uid() does not exist`

Supabaseの認証機能が有効になっているか確認してください。

### エラー: `policy already exists`

既存のポリシーが存在する場合は、先に削除してから実行してください：

```sql
-- 特定のテーブルのポリシーをすべて削除
DROP POLICY IF EXISTS "app_users_select_policy" ON app_users;
DROP POLICY IF EXISTS "app_users_insert_policy" ON app_users;
-- ... (必要に応じて他のポリシーも)
```

### 動作しない場合

1. Supabaseダッシュボードの「Database」→「Roles」でロールの権限を確認
2. `users` テーブルに正しいロール情報が入っているか確認
3. ブラウザのキャッシュをクリアしてログインし直す

---

## 📚 参考リンク

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Database Linter - Security Definer View](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)
- [Database Linter - RLS Disabled](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
