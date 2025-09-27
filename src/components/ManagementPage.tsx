import React, { useState } from 'react';
import { Calendar, Trophy, Settings } from 'lucide-react';
import EventManagementPage from './EventManagementPage';
import GameRecordManagementPage from './GameRecordManagementPage';

const ManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'records'>('events');

  const tabs = [
    { id: 'events', label: 'イベント管理', icon: Calendar },
    { id: 'records', label: '試合記録管理', icon: Trophy },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventManagementPage />;
      case 'records':
        return <GameRecordManagementPage />;
      default:
        return <EventManagementPage />;
    }
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center space-x-2">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-md font-semibold text-gray-900">管理</h2>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border border-gray-200 rounded-lg p-1">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'events' | 'records')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* コンテンツ */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ManagementPage;
