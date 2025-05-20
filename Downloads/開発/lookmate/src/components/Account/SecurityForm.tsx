import React, { useState } from 'react';
import { AlertCircle, Mail, Check } from 'lucide-react';

const SecurityForm: React.FC = () => {
  const [email, setEmail] = useState('suzuki@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setError('現在のパスワードを入力してください');
      return;
    }

    try {
      // In a real app, this would call an API
      console.log('Password reset requested');
      setEmailSent(true);
      setError('');
      
      setTimeout(() => {
        setEmailSent(false);
      }, 3000);
    } catch (err) {
      setError('パスワードの変更に失敗しました');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">セキュリティ設定</h2>
        <p className="text-sm text-gray-500 mt-1">
          ログインIDとパスワードの設定を変更できます
        </p>
      </div>
      
      <form onSubmit={handlePasswordReset} className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ログインID（メールアドレス）
            </label>
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              現在のパスワード
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError('');
              }}
              className={`w-full px-3 py-2 border ${
                error ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            パスワード変更用URLを送信
          </button>
          {emailSent && (
            <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
              <Check size={16} className="mr-1" />
              パスワード変更用のURLを送信しました
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500 text-center">
            ※ パスワード変更用のURLをメールで送信します
          </p>
        </div>
      </form>
    </div>
  );
};

export default SecurityForm;