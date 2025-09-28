import React, { useState, useEffect } from 'react';
import { Banknote, Users, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { ReimbursementSummary, MonthlyExpenseSummary } from '../types';
import { expenseService } from '../services/expenseService';
import { handleAsyncError } from '../utils/errorHandler';

const ReimbursementManagementPage: React.FC = () => {
  const [reimbursementSummary, setReimbursementSummary] = useState<ReimbursementSummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlyExpenseSummary[]>([]);
  const [expenseStats, setExpenseStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalPaid: 0,
    totalAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    await handleAsyncError(async () => {
      const [summaryData, statsData] = await Promise.all([
        expenseService.getReimbursementSummary(),
        expenseService.getExpenseStats()
      ]);
      
      setReimbursementSummary(summaryData);
      setExpenseStats(statsData);
      
      // 現在の月をデフォルトに設定
      const currentMonth = new Date().toISOString().substring(0, 7);
      setSelectedMonth(currentMonth);
      
      // 月別集計を取得
      const monthlyData = await expenseService.getMonthlyExpenseSummary(currentMonth);
      setMonthlySummary(monthlyData);
    }, 'データの読み込みに失敗しました');
    
    setIsLoading(false);
  };

  // 月別集計の更新
  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    
    await handleAsyncError(async () => {
      const monthlyData = await expenseService.getMonthlyExpenseSummary(month);
      setMonthlySummary(monthlyData);
    }, '月別データの読み込みに失敗しました');
  };

  // 一括支払い処理
  const handleBatchPayment = async () => {
    if (selectedUsers.length === 0) {
      alert('支払い対象のユーザーを選択してください');
      return;
    }

    const paymentDate = new Date().toISOString().split('T')[0];
    
    await handleAsyncError(async () => {
      // 各ユーザーの承認済み支出を取得
      for (const userId of selectedUsers) {
        const userExpenses = await expenseService.getExpenses({ 
          userId, 
          status: 'approved' 
        });
        
        if (userExpenses.length > 0) {
          const expenseIds = userExpenses.map(e => e.id);
          await expenseService.markAsPaid(expenseIds, paymentDate);
        }
      }
      
      setSelectedUsers([]);
      await loadData(); // データを再読み込み
    }, '一括支払い処理に失敗しました');
  };

  // ユーザー選択の切り替え
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 全選択/全解除
  const toggleAllSelection = () => {
    const usersWithPendingAmount = reimbursementSummary.filter(r => r.totalAmount > 0);
    if (selectedUsers.length === usersWithPendingAmount.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersWithPendingAmount.map(r => r.userId));
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '円';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 立替金合計
  const totalReimbursement = reimbursementSummary.reduce((sum, r) => sum + r.totalAmount, 0);

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
          <CreditCard className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">立替金管理</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          立替金の集計と支払い管理を行います
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">立替金合計</p>
              <p className="text-2xl font-bold">{formatAmount(totalReimbursement)}</p>
            </div>
            <Banknote className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">支払済み</p>
              <p className="text-2xl font-bold">{formatAmount(expenseStats.totalPaid)}</p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">承認済み</p>
              <p className="text-2xl font-bold">{formatAmount(expenseStats.totalApproved)}</p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">承認待ち</p>
              <p className="text-2xl font-bold">{formatAmount(expenseStats.totalPending)}</p>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* 月別集計 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">月別支出集計</h3>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        {monthlySummary.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">該当するデータがありません</p>
        ) : (
          <div className="space-y-2">
            {monthlySummary.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.categoryName} - {item.subcategoryName}
                  </p>
                  <p className="text-xs text-gray-500">{item.expenseCount}件</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {formatAmount(item.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 一括支払い操作 */}
      {reimbursementSummary.filter(r => r.totalAmount > 0).length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === reimbursementSummary.filter(r => r.totalAmount > 0).length}
                onChange={toggleAllSelection}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                立替金があるユーザーを選択 ({selectedUsers.length}人)
              </span>
            </div>
            <button
              onClick={handleBatchPayment}
              disabled={selectedUsers.length === 0}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              一括支払い
            </button>
          </div>
        </div>
      )}

      {/* 立替金一覧 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            立替金一覧 ({reimbursementSummary.length}人)
          </h3>
        </div>
        
        {reimbursementSummary.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>立替金データがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reimbursementSummary.map((summary) => (
              <div key={summary.userId} className="p-4">
                <div className="flex items-center space-x-3">
                  {/* チェックボックス */}
                  {summary.totalAmount > 0 && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(summary.userId)}
                      onChange={() => toggleUserSelection(summary.userId)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {summary.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {summary.expenseCount}件
                          {summary.lastExpenseDate && (
                            <span> • 最終: {formatDate(summary.lastExpenseDate)}</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          summary.totalAmount > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {formatAmount(summary.totalAmount)}
                        </p>
                        {summary.totalAmount > 0 && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            未払い
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">立替金支払いについて</p>
            <ul className="space-y-1 text-xs">
              <li>• 承認済みの立替金のみ支払い対象です</li>
              <li>• 一括支払い後、ステータスが「支払済み」に更新されます</li>
              <li>• 支払い日は自動的に記録されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReimbursementManagementPage;
