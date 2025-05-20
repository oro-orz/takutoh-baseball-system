import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import BankAccountForm from './BankAccountForm';
import SecurityForm from './SecurityForm';
import { mockBankAccount } from '../../data/mockData';
import { BankAccount } from '../../types';
import { KeyRound, Wallet } from 'lucide-react';

interface BankAccount {
  id: string;
  bank_name: string;
  branch_name: string;
  account_type: string;
  account_number: string;
  account_holder: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
}

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'bank'>('security');
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchProfile();
    fetchBankAccount();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchBankAccount = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setBankAccount(data);
    } catch (err) {
      console.error('Error fetching bank account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData(e.currentTarget);
      const updates = {
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        bio: formData.get('bio'),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSuccessMessage('プロフィールを更新しました');
      fetchProfile();
    } catch (err) {
      setError('プロフィールの更新に失敗しました');
      console.error('Error updating profile:', err);
    }
  };

  const handleBankAccountUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData(e.currentTarget);
      const updates = {
        bank_name: formData.get('bank_name'),
        branch_name: formData.get('branch_name'),
        account_type: formData.get('account_type'),
        account_number: formData.get('account_number'),
        account_holder: formData.get('account_holder'),
      };

      if (bankAccount) {
        const { error: updateError } = await supabase
          .from('bank_accounts')
          .update(updates)
          .eq('id', bankAccount.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('bank_accounts')
          .insert([{ ...updates, user_id: user?.id }]);

        if (insertError) throw insertError;
      }

      setSuccessMessage('銀行口座情報を更新しました');
      fetchBankAccount();
    } catch (err) {
      setError('銀行口座情報の更新に失敗しました');
      console.error('Error updating bank account:', err);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData(e.currentTarget);
      const currentPassword = formData.get('current_password');
      const newPassword = formData.get('new_password');
      const confirmPassword = formData.get('confirm_password');

      if (newPassword !== confirmPassword) {
        throw new Error('新しいパスワードが一致しません');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword as string
      });

      if (updateError) throw updateError;

      setSuccessMessage('パスワードを更新しました');
      e.currentTarget.reset();
    } catch (err) {
      setError('パスワードの更新に失敗しました');
      console.error('Error updating password:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">アカウント設定</h1>
        <p className="text-gray-600 mt-1">
          プロフィール情報とセキュリティ設定を管理できます
        </p>
      </div>

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

      {successMessage && (
        <div className="mb-4 bg-green-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'security'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              セキュリティ設定
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'bank'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              銀行口座情報
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {activeTab === 'security' ? (
            <div className="space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    氏名
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    defaultValue={profile?.full_name}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    defaultValue={profile?.phone}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    自己紹介
                  </label>
                  <textarea
                    name="bio"
                    id="bio"
                    rows={3}
                    defaultValue={profile?.bio}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    プロフィールを更新
                  </button>
                </div>
              </form>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">パスワード変更</h3>
                <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                      現在のパスワード
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      新しいパスワード（確認）
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      パスワードを変更
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBankAccountUpdate} className="space-y-4">
              <div>
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
                  銀行名
                </label>
                <input
                  type="text"
                  name="bank_name"
                  id="bank_name"
                  defaultValue={bankAccount?.bank_name}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700">
                  支店名
                </label>
                <input
                  type="text"
                  name="branch_name"
                  id="branch_name"
                  defaultValue={bankAccount?.branch_name}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="account_type" className="block text-sm font-medium text-gray-700">
                  口座種別
                </label>
                <select
                  name="account_type"
                  id="account_type"
                  defaultValue={bankAccount?.account_type}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                </select>
              </div>

              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
                  口座番号
                </label>
                <input
                  type="text"
                  name="account_number"
                  id="account_number"
                  defaultValue={bankAccount?.account_number}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="account_holder" className="block text-sm font-medium text-gray-700">
                  口座名義
                </label>
                <input
                  type="text"
                  name="account_holder"
                  id="account_holder"
                  defaultValue={bankAccount?.account_holder}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  銀行口座情報を更新
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;