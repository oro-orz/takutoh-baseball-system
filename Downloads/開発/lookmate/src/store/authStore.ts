import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  // その他のユーザー情報
}

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  setUser: (user: User | null) => set({ user }),

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('認証エラー:', error);
        return { error: 'メールアドレスまたはパスワードが正しくありません。' };
      }

      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('ユーザー情報取得エラー:', userError);
        return { error: 'ユーザー情報の取得に失敗しました。' };
      }

      if (!userData) {
        return { error: 'ユーザー情報が見つかりません。' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        isAdmin: userData.is_admin || false,
      };

      set({ user, session: data.session, error: null });
      return { error: null, user };
    } catch (error: any) {
      console.error('予期せぬエラー:', error);
      set({ error: error.message });
      return { error: 'ログイン処理中にエラーが発生しました。' };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'influencer',
          },
        },
      });

      if (error) throw error;

      set({ user: data.user, session: data.session, error: null });
      return { error: null };
    } catch (error: any) {
      set({ error: error.message });
      return { error: error.message };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // ユーザー情報を取得して設定
    supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data: userData }) => {
        if (userData) {
          useAuthStore.getState().setUser({
            id: session.user.id,
            email: session.user.email!,
            isAdmin: userData.is_admin || false,
          });
        }
      })
      .catch(console.error);
  } else {
    useAuthStore.getState().setUser(null);
  }
});