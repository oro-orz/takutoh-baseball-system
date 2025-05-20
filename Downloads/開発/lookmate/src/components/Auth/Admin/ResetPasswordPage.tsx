import React, { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const AdminResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 管理者アカウントの確認
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('email', email)
        .single();

      if (adminError || !adminData?.is_admin) {
        setError('管理者アカウントが見つかりません。');
        return;
      }

      // パスワードリセットメールの送信
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password/confirm`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      setError('パスワードリセットメールの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">メールを送信しました</h2>
              <p className="mt-2 text-sm text-gray-600">
                パスワードリセット用のリンクをメールで送信しました。
                メールをご確認ください。
              </p>
              <div className="mt-6">
                <a
                  href="/admin/login"
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  管理者ログインページに戻る
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Lock size={48} className="text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          管理者パスワードリセット
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          管理者アカウントのメールアドレスを入力してください
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? '処理中...' : 'リセットメールを送信'}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/admin/login"
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                管理者ログインページに戻る
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPasswordPage; 