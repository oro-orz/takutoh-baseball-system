import React, { useState } from 'react';
import { MonthlyEarnings } from '../../types';
import { X } from 'lucide-react';

interface InvoiceModalProps {
  earnings: MonthlyEarnings & { total: number };
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ earnings, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInvoice = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: earnings.month,
          matchings: earnings.matchings,
          total: earnings.total,
        }),
      });

      if (!response.ok) {
        throw new Error('請求書の生成に失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `請求書_${earnings.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onClose();
    } catch (err) {
      setError('請求書の生成に失敗しました');
      console.error('Error generating invoice:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              請求書の生成
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">請求期間</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(earnings.month).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">請求金額</h4>
              <p className="mt-1 text-lg font-bold text-gray-900">
                ¥{earnings.total.toLocaleString()}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">マッチング件数</h4>
              <p className="mt-1 text-sm text-gray-900">
                {earnings.matchings.length}件
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            キャンセル
          </button>
          <button
            onClick={handleGenerateInvoice}
            disabled={isGenerating}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isGenerating ? '生成中...' : '請求書を生成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;