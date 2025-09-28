import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Calendar, UserCheck, Trophy, LogOut } from 'lucide-react';
import LoginPage from './components/LoginPage';
import SchedulePage from './components/SchedulePage';
import ParticipationPage from './components/ParticipationPage';
import ParticipationProgressPage from './components/ParticipationProgressPage';
import MyPage from './components/MyPage';
// import AdminPage from './components/AdminPage';
import GameRecordsPage from './components/GameRecordsPage';
import PlayerManagementPage from './components/PlayerManagementPage';
import EventManagementPage from './components/EventManagementPage';
import PlayerRosterPage from './components/PlayerRosterPage';
import ExpenseReportPage from './components/ExpenseReportPage';
import ReimbursementStatusPage from './components/ReimbursementStatusPage';
import ExpenseManagementPage from './components/ExpenseManagementPage';
import ReimbursementManagementPage from './components/ReimbursementManagementPage';
import HamburgerMenu from './components/HamburgerMenu';
import { initializeSampleData } from './data/sampleData';

const AppContent: React.FC = () => {
  const { authState, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState(() => {
    // LocalStorageから保存されたタブを取得、なければ'schedule'をデフォルトに
    return localStorage.getItem('activeTab') || 'schedule';
  });
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  // サンプルデータの初期化
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  // 認証されていない場合はログインページを表示
  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  const isAdmin = authState.isAdmin;

  // 下部ナビゲーション用のタブ（よく使うメニューのみ）
  const bottomTabs = isAdmin 
    ? [
        { id: 'schedule', label: '予定', icon: Calendar },
        { id: 'progress', label: '進捗確認', icon: UserCheck },
        { id: 'admin', label: '試合記録', icon: Trophy },
      ]
    : [
        { id: 'schedule', label: '予定', icon: Calendar },
        { id: 'participation', label: '参加入力', icon: UserCheck },
        { id: 'game-records', label: '試合記録', icon: Trophy },
      ];

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('activeTab', tabId);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <SchedulePage />;
      case 'participation':
        return <ParticipationPage />;
      case 'roster':
        return <PlayerRosterPage />;
      case 'progress':
        return isAdmin ? <ParticipationProgressPage /> : <ParticipationProgressPage />;
      case 'admin':
        return <GameRecordsPage isAdmin={isAdmin} />;
      case 'game-records':
        return <GameRecordsPage isAdmin={isAdmin} />;
      case 'expense-report':
        return <ExpenseReportPage />;
      case 'reimbursement-status':
        return <ReimbursementStatusPage />;
      case 'expense-management':
        return <ExpenseManagementPage />;
      case 'reimbursement-management':
        return <ReimbursementManagementPage />;
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
                託麻東少年野球クラブ
              </h1>
              <p className="text-xs text-gray-600">
                {authState.user?.name}さん
              </p>
            </div>
            <HamburgerMenu 
              isAdmin={isAdmin}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-4 pb-20">
        {renderContent()}
      </main>

      {/* 下部ナビゲーション（よく使うメニューのみ） */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg z-20">
        <div className="flex justify-around">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
                className={`flex flex-col items-center justify-center py-3 px-1 min-w-0 flex-1 ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-xs font-medium truncate leading-tight">{tab.label}</span>
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
                  onClick={() => {
                    setShowLogoutDialog(false);
                    logout();
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;