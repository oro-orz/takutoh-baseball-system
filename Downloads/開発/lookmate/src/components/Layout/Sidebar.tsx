import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  DollarSign,
  Mail,
  ChevronDown,
  UserCircle,
  AlertCircle,
  X,
  Activity,
  Home
} from 'lucide-react';
import { NavigationItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import NotificationList from '../Notification/NotificationList';

const navigationItems: NavigationItem[] = [
  {
    id: 'matchings',
    label: 'マッチング一覧',
    path: '/',
    icon: 'Users'
  },
  {
    id: 'earnings',
    label: '報酬管理',
    path: '/earnings',
    icon: 'DollarSign'
  },
  {
    id: 'account',
    label: 'アカウント設定',
    path: '/account',
    icon: 'Settings'
  }
];

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, onClose }) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, signOut } = useAuthStore();

  // Close sidebar on navigation for mobile
  const handleNavigation = (pageId: string) => {
    setActivePage(pageId);
    onClose();
  };

  useEffect(() => {
    // Prevent body scroll when sidebar is open on mobile
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard size={20} />;
      case 'Users':
        return <Users size={20} />;
      case 'Settings':
        return <Settings size={20} />;
      case 'DollarSign':
        return <DollarSign size={20} />;
      default:
        return <LayoutDashboard size={20} />;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setShowLogoutConfirm(false);
    setIsAccountMenuOpen(false);
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Activity size={24} className="text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">LookMate</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActivePage('dashboard')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activePage === 'dashboard'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home size={20} className="mr-3" />
                ダッシュボード
              </button>

              <button
                onClick={() => setActivePage('matchings')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activePage === 'matchings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users size={20} className="mr-3" />
                マッチング
              </button>

              <button
                onClick={() => setActivePage('earnings')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activePage === 'earnings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign size={20} className="mr-3" />
                報酬
              </button>

              <button
                onClick={() => setActivePage('settings')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activePage === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings size={20} className="mr-3" />
                設定
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <NotificationList />
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <LogOut size={20} className="mr-3" />
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-semibold">ログアウトの確認</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ログアウトしますか？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;