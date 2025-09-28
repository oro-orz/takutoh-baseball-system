import React, { useState, useEffect } from 'react';
import { Receipt, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { ExpenseFormData, ExpenseCategory, ExpenseSubcategory, QuickExpense } from '../types';
import { expenseService } from '../services/expenseService';
import { useAuth } from '../contexts/AuthContext';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';

const ExpenseReportPage: React.FC = () => {
  const { authState } = useAuth();
  const [formData, setFormData] = useState<ExpenseFormData>({
    expenseDate: new Date().toISOString().split('T')[0],
    amount: 0,
    categoryId: '',
    subcategoryId: '',
    description: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([]);
  const [quickExpenses, setQuickExpenses] = useState<QuickExpense[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 初期データ読み込み
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await handleAsyncError(async () => {
      const [categoriesData, quickExpensesData] = await Promise.all([
        expenseService.getCategories(),
        expenseService.getQuickExpenses()
      ]);
      
      setCategories(categoriesData);
      setQuickExpenses(quickExpensesData);
    }, 'データの読み込みに失敗しました');
  };

  // カテゴリー変更時の処理
  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId, subcategoryId: '' }));
    
    if (categoryId) {
      await handleAsyncError(async () => {
        const subcategoriesData = await expenseService.getSubcategories(categoryId);
        setSubcategories(subcategoriesData);
      }, 'サブカテゴリーの読み込みに失敗しました');
    } else {
      setSubcategories([]);
    }
  };

  // よく使われる費目のクイック選択
  const handleQuickExpenseSelect = async (quickExpense: QuickExpense) => {
    // まず費目を設定
    setFormData(prev => ({
      ...prev,
      categoryId: quickExpense.category_id,
      subcategoryId: quickExpense.subcategory_id
    }));
    
    // サブカテゴリーを読み込み
    if (quickExpense.category_id) {
      await handleAsyncError(async () => {
        const subcategoriesData = await expenseService.getSubcategories(quickExpense.category_id);
        setSubcategories(subcategoriesData);
      }, 'サブカテゴリーの読み込みに失敗しました');
    }
  };

  // レシートファイル選択
  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      
      // プレビュー作成
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // フォーム送信
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!authState.user?.id) {
      alert('ユーザー情報が取得できません');
      return;
    }

    // バリデーション
    if (!formData.amount || formData.amount <= 0) {
      alert('金額を正しく入力してください');
      return;
    }

    if (!formData.categoryId || !formData.subcategoryId) {
      alert('費目を選択してください');
      return;
    }

    if (!receiptFile) {
      alert('レシート画像を選択してください');
      return;
    }

    setIsSubmitting(true);

    await handleAsyncError(async () => {
      await expenseService.createExpense(authState.user!.id, formData, receiptFile);
      
      setSubmitSuccess(true);
      showSuccess('支出報告を受け付けました');
      
      // フォームリセット
      setTimeout(() => {
        setFormData({
          expenseDate: new Date().toISOString().split('T')[0],
          amount: 0,
          categoryId: '',
          subcategoryId: '',
          description: ''
        });
        setReceiptFile(null);
        setReceiptPreview('');
        setSubmitSuccess(false);
      }, 3000);
    }, '支出報告の送信に失敗しました');

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">支出報告</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          立て替えた費用を報告してください。レシート画像の添付が必要です。
        </p>
      </div>


      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        {/* 支出日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            支出日
          </label>
          <input
            type="date"
            value={formData.expenseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* 金額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            金額
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0"
              min="1"
              required
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">円</span>
          </div>
        </div>

        {/* よく使われる費目 */}
        {quickExpenses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              よく使われる費目
            </label>
            <div className="flex flex-wrap gap-2">
              {quickExpenses.map((quickExpense) => (
                <button
                  key={quickExpense.id}
                  type="button"
                  onClick={() => handleQuickExpenseSelect(quickExpense)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    formData.categoryId === quickExpense.category_id && 
                    formData.subcategoryId === quickExpense.subcategory_id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {quickExpense.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 費目カテゴリー */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            費目カテゴリー
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 費目サブカテゴリー */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            費目サブカテゴリー
          </label>
          <select
            value={formData.subcategoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            disabled={!formData.categoryId}
          >
            <option value="">選択してください</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        {/* 備考 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="詳細な用途や内容を記入してください"
          />
        </div>

        {/* レシート画像 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            レシート画像
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  {receiptFile ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      ✓ {receiptFile.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                      + ファイルを追加
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            レシートや領収書の画像をアップロードしてください
          </p>
          
          {/* プレビュー */}
          {receiptPreview && (
            <div className="mt-2">
              <img
                src={receiptPreview}
                alt="レシートプレビュー"
                className="max-w-full h-32 object-contain border border-gray-300 rounded"
              />
            </div>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting || submitSuccess}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            submitSuccess
              ? 'bg-green-600 text-white'
              : isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {submitSuccess ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>送信完了！</span>
            </div>
          ) : isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>送信中...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>支出を報告</span>
            </div>
          )}
        </button>
      </form>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">報告後の流れ</p>
            <ul className="space-y-1 text-xs">
              <li>• 報告後、管理者による承認が必要です</li>
              <li>• 承認後、部費から立替金を返金します</li>
              <li>• 承認・支払い状況は「立替金状況」で確認できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportPage;
