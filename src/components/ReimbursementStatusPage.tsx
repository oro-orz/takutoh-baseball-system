import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, Eye, Calendar, CheckCircle } from 'lucide-react';
import { Expense } from '../types';
import { expenseService } from '../services/expenseService';
import { handleAsyncError } from '../utils/errorHandler';

const ReimbursementStatusPage: React.FC = () => {
  const [unpaidExpenses, setUnpaidExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUnpaidExpenses();
  }, []);

  const loadUnpaidExpenses = async () => {
    setIsLoading(true);
    
    await handleAsyncError(async () => {
      // 未払いの立替金のみを取得（全ユーザー分）
      const expenses = await expenseService.getExpenses({ 
        status: 'approved',
        paidAt: null // 未払いのみ
      });
      
      setUnpaidExpenses(expenses);
    }, '未払い立替金の読み込みに失敗しました');
    
    setIsLoading(false);
  };

  // ユーザー別にグループ化
  const expensesByUser = unpaidExpenses.reduce((acc, expense) => {
    const userId = expense.user?.id || 'unknown';
    const userName = expense.user?.name || '不明なユーザー';
    
    if (!acc[userId]) {
      acc[userId] = {
        userName,
        expenses: [],
        totalAmount: 0
      };
    }
    
    acc[userId].expenses.push(expense);
    acc[userId].totalAmount += expense.amount;
    
    return acc;
  }, {} as Record<string, { userName: string; expenses: Expense[]; totalAmount: number }>);

  // 全体の合計金額
  const totalUnpaidAmount = unpaidExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '円';
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
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">未払い立替金一覧</h2>
        </div>
      </div>

      {/* 全体サマリー */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div>
          <p className="text-sm font-medium text-gray-700">未払い立替金合計</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatAmount(totalUnpaidAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {Object.keys(expensesByUser).length}名の立替金
          </p>
        </div>
      </div>

      {/* 未払い立替金がない場合 */}
      {unpaidExpenses.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未払い立替金なし</h3>
          <p className="text-gray-600">
            現在、未払いの立替金はありません
          </p>
        </div>
      ) : (
        /* ユーザー別立替金一覧 */
        <div className="space-y-4">
          {Object.entries(expensesByUser).map(([userId, userData]) => (
            <div key={userId} className="bg-white rounded-lg shadow-sm">
              {/* ユーザーヘッダー */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">{userData.userName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatAmount(userData.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userData.expenses.length}件
                    </p>
                  </div>
                </div>
              </div>

              {/* 支出一覧 */}
              <div className="divide-y divide-gray-200">
                {userData.expenses.map((expense) => (
                  <div key={expense.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                            未払い
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {expense.category?.name} - {expense.subcategory?.name}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(expense.expenseDate)}</span>
                          </div>
                          {expense.description && (
                            <p className="text-xs text-gray-500">
                              {expense.description}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">未払い立替金について</p>
            <ul className="space-y-1 text-xs">
              <li>• 承認済みの未払いの立替金を表示しています</li>
              <li>• 支払済みの立替金は表示されません</li>
              <li>• 透明性のため、全員の未払い立替金を確認できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReimbursementStatusPage;