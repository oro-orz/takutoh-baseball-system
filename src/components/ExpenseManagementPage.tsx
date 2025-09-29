import React, { useState, useEffect } from 'react';
import { Banknote, CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseSubcategory } from '../types';
import { expenseService } from '../services/expenseService';
import { handleAsyncError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

const ExpenseManagementPage: React.FC = () => {
  const { authState } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    categoryId: '',
    subcategoryId: '',
    month: ''
  });
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    await handleAsyncError(async () => {
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getExpenses(),
        expenseService.getCategories()
      ]);
      
      setExpenses(expensesData);
      setCategories(categoriesData);
    }, 'データの読み込みに失敗しました');
    
    setIsLoading(false);
  };

  // フィルタリングされた支出データ
  const filteredExpenses = expenses.filter(expense => {
    if (filters.status !== 'all' && expense.status !== filters.status) return false;
    if (filters.categoryId && expense.categoryId !== filters.categoryId) return false;
    if (filters.subcategoryId && expense.subcategoryId !== filters.subcategoryId) return false;
    if (filters.month) {
      const expenseMonth = expense.expenseDate.substring(0, 7);
      if (expenseMonth !== filters.month) return false;
    }
    return true;
  });

  // カテゴリー変更時の処理
  const handleCategoryChange = async (categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId, subcategoryId: '' }));
    
    if (categoryId) {
      await handleAsyncError(async () => {
        const subcategoriesData = await expenseService.getSubcategories(categoryId);
        setSubcategories(subcategoriesData);
      }, 'サブカテゴリーの読み込みに失敗しました');
    } else {
      setSubcategories([]);
    }
  };

  // 支出の承認/却下
  const handleExpenseApproval = async (expenseId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    await handleAsyncError(async () => {
      const approverId = authState.user?.id;
      
      if (!approverId) {
        throw new Error('承認者のIDが取得できません');
      }
      
      await expenseService.approveExpense(expenseId, { expenseId, status, rejectionReason }, approverId);
      await loadData(); // データを再読み込み
    }, '支出の承認処理に失敗しました');
  };

  // 一括承認
  const handleBatchApproval = async (status: 'approved' | 'rejected') => {
    if (selectedExpenses.length === 0) {
      alert('承認する支出を選択してください');
      return;
    }

    const rejectionReason = status === 'rejected' ? prompt('却下理由を入力してください:') : undefined;
    if (status === 'rejected' && !rejectionReason) return;

    await handleAsyncError(async () => {
      const approverId = authState.user?.id;
      if (!approverId) {
        throw new Error('承認者のIDが取得できません');
      }
      
      for (const expenseId of selectedExpenses) {
        await expenseService.approveExpense(expenseId, { expenseId, status, rejectionReason: rejectionReason || undefined }, approverId);
      }
      setSelectedExpenses([]);
      await loadData();
    }, '一括承認処理に失敗しました');
  };

  // 選択状態の切り替え
  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  // 全選択/全解除
  const toggleAllSelection = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(e => e.id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      case 'paid':
        return '支払済み';
      default:
        return '不明';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null) {
      return '0円';
    }
    return amount.toLocaleString() + '円';
  };

  // 統計情報
  const stats = {
    total: filteredExpenses.length,
    pending: filteredExpenses.filter(e => e.status === 'pending').length,
    approved: filteredExpenses.filter(e => e.status === 'approved').length,
    rejected: filteredExpenses.filter(e => e.status === 'rejected').length,
    paid: filteredExpenses.filter(e => e.status === 'paid').length,
    totalAmount: filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Banknote className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">支出管理</h2>
          </div>
          <div className="text-sm text-gray-600">
            {stats.total}件 / 合計 {formatAmount(stats.totalAmount)}
          </div>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">承認待ち</span>
          </div>
          <p className="text-lg font-bold text-yellow-600 mt-1">{stats.pending}件</p>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">承認済み</span>
          </div>
          <p className="text-lg font-bold text-blue-600 mt-1">{stats.approved}件</p>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">却下</span>
          </div>
          <p className="text-lg font-bold text-red-600 mt-1">{stats.rejected}件</p>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">支払済み</span>
          </div>
          <p className="text-lg font-bold text-green-600 mt-1">{stats.paid}件</p>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">フィルター</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* ステータス */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下</option>
              <option value="paid">支払済み</option>
            </select>
          </div>

          {/* 月 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">月</label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">カテゴリー</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">すべて</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* サブカテゴリー */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">サブカテゴリー</label>
            <select
              value={filters.subcategoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, subcategoryId: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              disabled={!filters.categoryId}
            >
              <option value="">すべて</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 一括操作 */}
      {stats.pending > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedExpenses.length === filteredExpenses.filter(e => e.status === 'pending').length && filteredExpenses.filter(e => e.status === 'pending').length > 0}
                onChange={toggleAllSelection}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                承認待ちを選択 ({selectedExpenses.length}件)
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBatchApproval('approved')}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                一括承認
              </button>
              <button
                onClick={() => handleBatchApproval('rejected')}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                一括却下
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 支出一覧 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            支出一覧 ({filteredExpenses.length}件)
          </h3>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Banknote className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>該当する支出がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-4">
                <div className="flex items-start space-x-3">
                  {/* チェックボックス */}
                  {expense.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense.id)}
                      onChange={() => toggleExpenseSelection(expense.id)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(expense.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(expense.status)}`}>
                        {getStatusText(expense.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {expense.category?.name} - {expense.subcategory?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {expense.user?.name} • {formatDate(expense.expenseDate)}
                      </p>
                      {expense.description && (
                        <p className="text-xs text-gray-500">
                          {expense.description}
                        </p>
                      )}
                      {expense.rejectionReason && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          却下理由: {expense.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatAmount(expense.amount)}
                    </p>
                    {expense.receiptUrl && (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 mt-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>レシート</span>
                      </a>
                    )}
                    
                    {/* 操作ボタン */}
                    {expense.status === 'pending' && (
                      <div className="flex space-x-1 mt-2">
                        <button
                          onClick={() => handleExpenseApproval(expense.id, 'approved')}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('却下理由を入力してください:');
                            if (reason) {
                              handleExpenseApproval(expense.id, 'rejected', reason);
                            }
                          }}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          却下
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseManagementPage;
