# データベース管理ファイル

このディレクトリには、託麻東少年野球クラブ管理システムのデータベース関連ファイルが整理されています。

## 📁 ディレクトリ構造

### `/schema/` - データベーススキーマ
- `database-schema.sql` - メインのテーブル定義（ユーザー、イベント、参加状況など）
- `add-accounting-tables.sql` - 会計管理機能のテーブル定義
- `supabase-storage-setup.sql` - Supabaseストレージバケットの設定

### `/sample-data/` - サンプルデータ
- `add-sample-users-30.sql` - 30人分のテストユーザーデータ
- `clean-sample-data.sql` - クリーンなサンプルデータ
- `simple-sample-data.sql` - シンプルなサンプルデータ
- その他多数のサンプルデータファイル

### `/debug/` - デバッグ・確認用
- `debug_expenses.sql` - 支出データのデバッグクエリ
- `check-current-data.sql` - 現在のデータ確認クエリ
- `debug-comment-save.sql` - コメント保存のデバッグ
- その他多数のデバッグ・確認ファイル

### `/management/` - データベース管理用
- `fix-users-rls-policy.sql` - RLSポリシー修正
- `remove-email-column.sql` - カラム削除
- `update-baseball-categories.sql` - 野球カテゴリ更新
- `cleanup-and-add-parents.sql` - 保護者データのクリーンアップ
- その他多数の管理用ファイル

## 🚀 使用方法

### データベース初期化
1. Supabaseプロジェクトで`/schema/database-schema.sql`を実行
2. `/schema/add-accounting-tables.sql`を実行（会計機能が必要な場合）
3. `/schema/supabase-storage-setup.sql`を実行（ファイルアップロード機能が必要な場合）

### サンプルデータ投入
- `/sample-data/clean-sample-data.sql`を実行してクリーンなサンプルデータを投入

### デバッグ・確認
- `/debug/check-current-data.sql`で現在のデータ状況を確認
- `/debug/debug_expenses.sql`で支出データをデバッグ

### データベース管理
- 必要に応じて`/management/`内のファイルを実行してデータベース構造を更新

## ⚠️ 注意事項

- 本番環境で実行する前に、必ずバックアップを取ってください
- サンプルデータは開発・テスト環境でのみ使用してください
- データベース構造の変更は慎重に行ってください
