import React, { useState } from 'react';
import { Users, DollarSign, Settings } from 'lucide-react';
import InfluencerList from './InfluencerList';
import PaymentManagement from './PaymentManagement';
import SystemSettings from './SystemSettings';

type TabType = 'influencers' | 'payments' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('influencers');

  const tabs = [
    {
      id: 'influencers',
      label: 'インフルエンサー管理',
      icon: <Users size={20} />,
    },
    {
      id: 'payments',
      label: '支払い管理',
      icon: <DollarSign size={20} />,
    },
    {
      id: 'settings',
      label: 'システム設定',
      icon: <Settings size={20} />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'influencers':
        return <InfluencerList />;
      case 'payments':
        return <PaymentManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            インフルエンサー、支払い、システム設定を管理できます
          </p>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-4 py-2 rounded-md flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;