import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';
import { getAuthData, saveAuthData, clearAuthData } from '../utils/storage';
import { SAMPLE_USERS, SAMPLE_ADMIN } from '../data/sampleData';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';
import { userService } from '../services/userService';

interface AuthContextType {
  authState: AuthState;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    // ローカルストレージから認証情報を復元
    handleAsyncError(async () => {
      const savedAuth = getAuthData();
      if (savedAuth) {
        setAuthState(savedAuth);
      }
    }, '認証情報の復元に失敗しました');
  }, []);

  const login = async (pin: string): Promise<boolean> => {
    const result = await handleAsyncError(async () => {
      // PINの形式チェック
      if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        throw new Error('PINは4桁の数字で入力してください');
      }

      // Supabaseからユーザーを取得
      const user = await userService.getUserByPin(pin);
      
      if (user) {
        const newAuthState: AuthState = {
          user: {
            id: user.id,
            pin: user.pin,
            name: user.name,
            role: user.role,
            players: user.players || []
          },
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        };
        setAuthState(newAuthState);
        saveAuthData(newAuthState);
        showSuccess(`${user.name}さんとしてログインしました`);
        return true;
      }

      // フォールバック: サンプルデータでチェック
      if (pin === SAMPLE_ADMIN.pin) {
        const newAuthState: AuthState = {
          user: SAMPLE_ADMIN,
          isAuthenticated: true,
          isAdmin: true,
        };
        setAuthState(newAuthState);
        saveAuthData(newAuthState);
        showSuccess('管理者としてログインしました');
        return true;
      }

      const sampleUser = SAMPLE_USERS.find(u => u.pin === pin);
      if (sampleUser) {
        const newAuthState: AuthState = {
          user: sampleUser,
          isAuthenticated: true,
          isAdmin: false,
        };
        setAuthState(newAuthState);
        saveAuthData(newAuthState);
        showSuccess(`${sampleUser.name}さんとしてログインしました`);
        return true;
      }

      throw new Error('PINが正しくありません');
    }, 'ログインに失敗しました');

    return result !== null;
  };

  const logout = () => {
    handleAsyncError(async () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      });
      clearAuthData();
      showSuccess('ログアウトしました');
    }, 'ログアウトに失敗しました');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
