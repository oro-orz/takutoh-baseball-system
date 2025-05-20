import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  name: string;
  logo_url: string;
}

interface Influencer {
  id: string;
  full_name: string;
}

interface Matching {
  id: string;
  company_id: string;
  influencer_id: string;
  amount: number;
  status: string;
  created_at: string;
  companies: Company;
  profiles: Influencer;
}

const MatchingManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [matchings, setMatchings] = useState<Matching[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    fetchCompanies();
    fetchInfluencers();
    fetchMatchings();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('企業情報の取得に失敗しました');
    }
  };

  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'influencer')
        .order('full_name');

      if (error) throw error;
      setInfluencers(data);
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setError('インフルエンサー情報の取得に失敗しました');
    }
  };

  const fetchMatchings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('matchings')
        .select(`
          *,
          companies (*),
          profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatchings(data);
    } catch (err) {
      console.error('Error fetching matchings:', err);
      setError('マッチング情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // ライセンス作成
      const { data: matching, error: matchingError } = await supabase
        .from('matchings')
        .insert({
          company_id: selectedCompany,
          influencer_id: selectedInfluencer,
          amount: parseInt(amount),
          status: 'pending',
        })
        .select()
        .single();

      if (matchingError) throw matchingError;

      // 通知を作成
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'license_request',
          title: '新しいライセンスリクエスト',
          message: `${matching.companies.name}からライセンスリクエストが届きました。`,
          is_read: false,
          data: {
            matching_id: matching.id,
            company_name: matching.companies.name,
            amount: matching.amount
          }
        });

      if (notificationError) throw notificationError;

      // フォームをリセット
      setSelectedCompany('');
      setSelectedInfluencer('');
      setAmount('');
      setIsModalOpen(false);

      // マッチング一覧を更新
      fetchMatchings();
    } catch (err) {
      console.error('Error creating matching:', err);
      setError('マッチングの作成に失敗しました');
    }
  };

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

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-lg">
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
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">データライセンス管理</h1>
          <p className="text-gray-600 mt-1">
            フォロワーデータのライセンス提供を管理します
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          新規ライセンス作成
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  企業
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  インフルエンサー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ライセンス料
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : matchings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    ライセンス提供がありません
                  </td>
                </tr>
              ) : (
                matchings.map((matching) => (
                  <tr key={matching.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {matching.companies.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {matching.profiles.full_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ¥{matching.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(matching.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(matching.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新規ライセンス作成モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">新規ライセンス作成</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateMatching} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">企業</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">企業を選択</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">インフルエンサー</label>
                  <select
                    value={selectedInfluencer}
                    onChange={(e) => setSelectedInfluencer(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">インフルエンサーを選択</option>
                    {influencers.map((influencer) => (
                      <option key={influencer.id} value={influencer.id}>
                        {influencer.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ライセンス料</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">¥</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingManagement; 