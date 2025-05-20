import React, { useState } from 'react';
import { Save } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [termsContent, setTermsContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save logic with Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">利用規約</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <textarea
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="利用規約の内容を入力してください"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">プライバシーポリシー</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <textarea
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="プライバシーポリシーの内容を入力してください"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;