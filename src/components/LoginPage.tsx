import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(pin);
    } catch (error) {
      // エラーはAuthContextで処理される
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <img 
              src="/takuto_logo.png" 
              alt="託麻東少年野球クラブロゴ" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            託麻東少年野球クラブ
          </h1>
          <p className="text-gray-600">
            スケジュール管理システム
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              PINコード
            </label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="0000"
              maxLength={4}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={pin.length !== 4 || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>ログイン中...</span>
              </div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>PINコードをお忘れの場合は管理者にお問い合わせください</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
