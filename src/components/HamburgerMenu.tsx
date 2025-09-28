import React, { useState } from 'react';
import { Menu, X, Users, Banknote, User, LogOut, Settings } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

interface HamburgerMenuProps {
  isAdmin: boolean;
  onNavigate: (tabId: string) => void;
  onLogout: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isAdmin, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = isAdmin 
    ? [
        { id: 'profile', label: '選手管理', icon: Users, onClick: () => onNavigate('profile') },
        { id: 'management', label: 'イベント管理', icon: Settings, onClick: () => onNavigate('management') },
        { id: 'expense-management', label: '会計管理', icon: Banknote, onClick: () => onNavigate('expense-management') },
        { id: 'reimbursement-management', label: '立替金管理', icon: Banknote, onClick: () => onNavigate('reimbursement-management') },
        { id: 'logout', label: 'ログアウト', icon: LogOut, onClick: onLogout },
      ]
    : [
        { id: 'roster', label: '選手名簿', icon: Users, onClick: () => onNavigate('roster') },
        { id: 'expense-report', label: '会計報告', icon: Banknote, onClick: () => onNavigate('expense-report') },
        { id: 'reimbursement-status', label: '立替金状況', icon: Banknote, onClick: () => onNavigate('reimbursement-status') },
        { id: 'profile', label: 'マイページ', icon: User, onClick: () => onNavigate('profile') },
        { id: 'logout', label: 'ログアウト', icon: LogOut, onClick: onLogout },
      ];

  const handleMenuClick = (item: MenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* メニューパネル */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* メニュー */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {isAdmin ? '管理者メニュー' : 'メニュー'}
              </h3>
              
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        item.id === 'logout'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HamburgerMenu;
