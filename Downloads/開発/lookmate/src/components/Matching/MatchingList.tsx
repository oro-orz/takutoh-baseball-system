import React, { useState } from 'react';
import { MatchingItem, MatchingUpdateProps } from '../../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import MatchingDetail from './MatchingDetail';

interface MatchingListProps {
  matchings: MatchingItem[];
  onUpdateStatus?: (update: MatchingUpdateProps) => void;
}

const MatchingList: React.FC<MatchingListProps> = ({ matchings, onUpdateStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatching, setSelectedMatching] = useState<MatchingItem | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            承認済み
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            審査中
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            却下
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleSort = (key: 'date' | 'amount') => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const filteredMatchings = matchings
    .filter(matching => 
      matching.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDirection === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">マッチング一覧</h2>
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="企業名で検索"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">企業名</th>
              <th className="px-6 py-3 text-left">ステータス</th>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  金額
                  <ArrowUpDown size={16} className="ml-1" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  日付
                  <ArrowUpDown size={16} className="ml-1" />
                </div>
              </th>
              <th className="px-6 py-3 text-right">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMatchings.length > 0 ? (
              filteredMatchings.map((matching) => (
                <tr 
                  key={matching.id} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{matching.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(matching.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">
                      ¥{matching.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {formatDate(matching.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      onClick={() => setSelectedMatching(matching)}
                    >
                      詳細を見る
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  該当するマッチングがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedMatching && (
        <MatchingDetail 
          matching={selectedMatching} 
          onClose={() => setSelectedMatching(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </div>
  );
};

export default MatchingList;