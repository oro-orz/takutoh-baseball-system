import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// 認証ページ
import UserLoginPage from './components/Auth/User/LoginPage';
import AdminLoginPage from './components/Auth/Admin/LoginPage';
import SignupPage from './components/Auth/User/SignupPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';
import ResetPasswordConfirmPage from './components/Auth/ResetPasswordConfirmPage';
import AdminResetPasswordPage from './components/Auth/Admin/ResetPasswordPage';
import AdminResetPasswordConfirmPage from './components/Auth/Admin/ResetPasswordConfirmPage';

// ダッシュボード
import UserDashboard from './components/User/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';

// その他のページ
import TermsPage from './components/Legal/TermsPage';
import PrivacyPage from './components/Legal/PrivacyPage';

// 認証済みユーザー用のルート
const PrivateRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 認証ページ */}
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/confirm" element={<ResetPasswordConfirmPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
        <Route path="/admin/reset-password/confirm" element={<AdminResetPasswordConfirmPage />} />

        {/* ユーザーダッシュボード */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* 管理者ダッシュボード */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requireAdmin>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 法的文書 */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* デフォルトルート */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;