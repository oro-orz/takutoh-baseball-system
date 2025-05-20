import React from 'react';
import { Activity, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 fixed w-full h-16 z-10 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 mr-2 text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <Activity size={32} className="text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">LookMate</h1>
          <span className="text-xs font-medium text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-md hidden sm:inline-block">
            インフルエンサーダッシュボード
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;