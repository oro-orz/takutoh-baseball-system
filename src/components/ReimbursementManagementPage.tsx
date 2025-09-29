import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
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
    }, '月別集計の読み込みに失敗しました');
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null) {
      return '0円';
    }
    return amount.toLocaleString() + '円';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString);
      return '';
    }
  };

  // 立替金合計（承認済み + 承認待ち）
  const totalReimbursement = expenseStats.totalApproved + expenseStats.totalPending;
  
  // 今月の立替金合計
  const currentMonthTotal = monthlySummary.reduce((sum, m) => sum + (m.totalAmount || 0), 0);
  
  // 今月の立替金件数
  const currentMonthCount = monthlySummary.reduce((sum, m) => sum + (m.expenseCount || 0), 0);

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
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">会計管理ダッシュボード</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          立替金の状況と月別集計を確認できます
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">今月の立替金</p>
              <p className="text-2xl font-bold">{formatAmount(currentMonthTotal)}</p>
              <p className="text-xs opacity-75">{currentMonthCount}件</p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">未払い合計</p>
              <p className="text-2xl font-bold">{formatAmount(totalReimbursement)}</p>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
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
              <p className="text-sm opacity-90">承認待ち</p>
              <p className="text-2xl font-bold">{formatAmount(expenseStats.totalPending)}</p>
            </div>
            <AlertCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">承認済み</p>
              <p className="text-2xl font-bold">{formatAmount(expenseStats.totalApproved)}</p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
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

      {/* 立替金状況サマリー */}
      {(expenseStats.totalApproved > 0 || expenseStats.totalPending > 0) && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-3">立替金状況サマリー</h3>
          {reimbursementSummary.length > 0 ? (
            <div className="space-y-2">
              {reimbursementSummary.map((summary) => (
                <div key={summary.userId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{summary.userName}</p>
                    <p className="text-xs text-gray-500">{summary.expenseCount}件</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatAmount(summary.totalAmount)}
                    </p>
                    {summary.lastExpenseDate && (
                      <p className="text-xs text-gray-500">
                        最終: {formatDate(summary.lastExpenseDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              承認済みの未払い立替金はありません
            </p>
          )}
        </div>
      )}


      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">ダッシュボードについて</p>
            <ul className="space-y-1 text-xs">
              <li>• 今月の立替金は当月の支出を表示しています</li>
              <li>• 未払い合計は承認済みで支払い未完了の立替金です</li>
              <li>• 月別集計でカテゴリ別の支出状況を確認できます</li>
              <li>• 立替金状況サマリーでユーザー別の状況を確認できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReimbursementManagementPage;
