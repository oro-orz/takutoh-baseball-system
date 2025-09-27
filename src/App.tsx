import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { Calendar, Users, User, LogOut, Trophy, Settings } from 'lucide-react';
import LoginPage from './components/LoginPage';
import SchedulePage from './components/SchedulePage';
import ParticipationPage from './components/ParticipationPage';
import ParticipationProgressPage from './components/ParticipationProgressPage';
import MyPage from './components/MyPage';
// import AdminPage from './components/AdminPage';
import GameRecordsPage from './components/GameRecordsPage';
import PlayerManagementPage from './components/PlayerManagementPage';
import EventManagementPage from './components/EventManagementPage';
import { initializeSampleData } from './data/sampleData';

const AppContent: React.FC = () => {
  const { authState, logout } = useAuth();
  const { user, loading, signOut } = useSupabaseAuth();
  const [activeTab, setActiveTab] = React.useState('schedule');
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  // サンプルデータの初期化
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  // 認証されていない場合はログインページを表示
  if (!authState.isAuthenticated && !user) {
    return <LoginPage />;
  }

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ユーザーの役割を取得（Supabaseのuser_metadataから）
  const userRole = user?.user_metadata?.role || 'player';
  const isAdmin = authState.isAdmin || userRole === 'admin';

  const tabs = isAdmin 
    ? [
        { id: 'schedule', label: '予定', icon: Calendar },
        { id: 'progress', label: '進捗確認', icon: Users },
        { id: 'admin', label: '試合記録', icon: Trophy },
        { id: 'profile', label: '選手管理', icon: User },
        { id: 'management', label: 'イベント管理', icon: Settings },
      ]
    : [
        { id: 'schedule', label: '予定', icon: Calendar },
        { id: 'participation', label: '参加入力', icon: Users },
        { id: 'game-records', label: '試合記録', icon: Trophy },
        { id: 'profile', label: 'マイページ', icon: User },
      ];

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <SchedulePage />;
      case 'participation':
        return <ParticipationPage />;
      case 'progress':
        return isAdmin ? <ParticipationProgressPage /> : <ParticipationProgressPage />;
      case 'admin':
        return <GameRecordsPage isAdmin={isAdmin} />;
      case 'game-records':
        return <GameRecordsPage isAdmin={isAdmin} />;
      case 'profile':
        return isAdmin ? <PlayerManagementPage /> : <MyPage />;
      case 'management':
        return <EventManagementPage />;
      default:
        return <SchedulePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                託麻東少年野球
              </h1>
              <p className="text-xs text-gray-600">
                {user?.user_metadata?.name || authState.user?.name}さん
              </p>
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-4 pb-20">
        {renderContent()}
      </main>

      {/* 下部ナビゲーション */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg z-20">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ログアウト確認ダイアログ */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ログアウトしますか？
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                再度ログインするにはPINが必要です
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={async () => {
                    setShowLogoutDialog(false);
                    if (user) {
                      await signOut();
                    } else {
                      logout();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SupabaseAuthProvider>
  );
};

export default App;