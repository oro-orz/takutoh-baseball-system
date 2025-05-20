import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { MatchingItem } from '../../types';
import { FileText, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import InvoiceModal from './InvoiceModal';

interface MonthlyEarnings {
  month: string;
  total: number;
  matchings: MatchingItem[];
}

const EarningsPage: React.FC = () => {
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const user = useAuthStore(state => state.user);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('matchings')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('influencer_id', user?.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedMatchings = data.map(matching => ({
        id: matching.id,
        companyName: matching.companies.name,
        companyLogo: matching.companies.logo_url,
        status: matching.status,
        date: matching.created_at,
        amount: matching.amount,
        description: matching.description,
        requirements: matching.requirements,
        deadline: matching.deadline
      }));

      // 月ごとにグループ化
      const groupedByMonth = formattedMatchings.reduce((acc: { [key: string]: MonthlyEarnings }, matching) => {
        const date = new Date(matching.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            total: 0,
            matchings: []
          };
        }
        
        acc[monthKey].total += matching.amount;
        acc[monthKey].matchings.push(matching);
        
        return acc;
      }, {});

      const sortedEarnings = Object.values(groupedByMonth)
        .sort((a, b) => b.month.localeCompare(a.month));

      setMonthlyEarnings(sortedEarnings);
      if (sortedEarnings.length > 0) {
        setSelectedMonth(sortedEarnings[0].month);
      }
    } catch (err) {
      setError('報酬情報の取得に失敗しました。');
      console.error('Error fetching earnings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setError(null);
      // TODO: 請求書生成APIの実装
      setShowInvoice(true);
    } catch (err) {
      setError('請求書の生成に失敗しました。');
      console.error('Error generating invoice:', err);
    }
  };

  const formatMonth = (year: number, month: number) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(year, month));
  };

  const handleShowInvoice = (earnings: MonthlyEarnings) => {
    setSelectedMonth(earnings.month);
    setShowInvoice(true);
  };

  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  const yearlyEarnings = monthlyEarnings.reduce((acc, curr) => {
    if (!acc[curr.month]) {
      acc[curr.month] = {
        total: 0,
        matchings: []
      };
    }
    acc[curr.month].total += curr.total;
    acc[curr.month].matchings.push(curr);
    return acc;
  }, {} as Record<string, MonthlyEarnings>);

  const availableYears = Object.keys(yearlyEarnings)
    .map(key => Number(key.split('-')[0]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">報酬管理</h1>
        <p className="text-gray-600 mt-1">
          承認済みのマッチング報酬を確認できます
        </p>
      </div>

      <div className="mb-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedYear}年の報酬
            </h2>
            <div className="text-xl font-bold text-gray-900">
              ¥{Object.values(yearlyEarnings).reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.values(yearlyEarnings).map((earnings) => {
            const monthKey = earnings.month;
            const isExpanded = expandedMonths.includes(monthKey);

            return (
              <div key={monthKey} className="border-b border-gray-200">
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleMonthExpansion(monthKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar size={20} className="text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-800">
                        {formatMonth(Number(monthKey.split('-')[0]), Number(monthKey.split('-')[1]))}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-gray-900">
                        ¥{earnings.total.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowInvoice(earnings);
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                      >
                        <FileText size={16} className="mr-2" />
                        請求書
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <table className="w-full">
                      <thead className="text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-2 text-left">企業名</th>
                          <th className="px-4 py-2 text-left">日付</th>
                          <th className="px-4 py-2 text-right">金額</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {earnings.matchings.map((matching) => (
                          <tr key={matching.id} className="text-sm">
                            <td className="px-4 py-3 text-gray-900">
                              {matching.companyName}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(matching.date).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              ¥{matching.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showInvoice && selectedMonth && (
        <InvoiceModal
          earnings={monthlyEarnings.find(e => e.month === selectedMonth) || { month: '', total: 0, matchings: [] }}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

export default EarningsPage;