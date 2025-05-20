import React, { useState, useEffect } from 'react';
import MatchingList from './MatchingList';
import { MatchingItem, MatchingUpdateProps } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const MatchingPage: React.FC = () => {
  const [matchings, setMatchings] = useState<MatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchMatchings();
  }, []);

  const fetchMatchings = async () => {
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

      setMatchings(formattedMatchings);
    } catch (err) {
      setError('マッチング情報の取得に失敗しました。');
      console.error('Error fetching matchings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (update: MatchingUpdateProps) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('matchings')
        .update({ status: update.status })
        .eq('id', update.matchingId);

      if (updateError) throw updateError;

      // マッチングリストを更新
      setMatchings(prevMatchings => 
        prevMatchings.map(matching => 
          matching.id === update.matchingId
            ? { ...matching, status: update.status }
            : matching
        )
      );

      // 成功通知
      // TODO: トースト通知の実装
    } catch (err) {
      setError('ステータスの更新に失敗しました。');
      console.error('Error updating matching status:', err);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">マッチング管理</h1>
        <p className="text-gray-600 mt-1">
          広告主とのマッチング情報を確認・管理できます
        </p>
      </div>
      
      {matchings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">現在、マッチングはありません。</p>
        </div>
      ) : (
        <MatchingList 
          matchings={matchings}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default MatchingPage;