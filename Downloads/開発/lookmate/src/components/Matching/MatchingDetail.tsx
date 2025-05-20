import React, { useState } from 'react';
import { MatchingItem, MatchingUpdateProps } from '../../types';
import { X, Calendar, DollarSign, CheckCircle, XCircle, Clock, Check, Ban } from 'lucide-react';

interface MatchingDetailProps {
  matching: MatchingItem;
  onClose: () => void;
  onUpdateStatus?: (update: MatchingUpdateProps) => void;
}

const MatchingDetail: React.FC<MatchingDetailProps> = ({ matching, onClose, onUpdateStatus }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={24} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認済み';
      case 'pending':
        return '審査中';
      case 'rejected':
        return '却下';
      default:
        return '';
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!onUpdateStatus) return;
    
    setIsSubmitting(true);
    try {
      await onUpdateStatus({
        matchingId: matching.id,
        status,
        message: message.trim() || undefined
      });
      onClose();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">マッチング詳細</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">{matching.companyName}</h2>
            <div className="flex items-center mt-2">
              {getStatusIcon(matching.status)}
              <span className={`ml-2 font-medium ${
                matching.status === 'approved' ? 'text-green-700' :
                matching.status === 'pending' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {getStatusText(matching.status)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-2">
                <Calendar size={18} className="mr-2" />
                <span className="text-sm">マッチング日</span>
              </div>
              <p className="text-gray-900 font-medium">{formatDate(matching.date)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-2">
                <DollarSign size={18} className="mr-2" />
                <span className="text-sm">査定金額</span>
              </div>
              <p className="text-gray-900 font-bold">¥{matching.amount.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">詳細情報</h4>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
              {matching.description || '詳細情報はありません。'}
            </p>
          </div>

          {matching.status === 'pending' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">レビューメッセージ（任意）</h4>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="承認/却下の理由や条件などがあれば入力してください"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-8">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              disabled={isSubmitting}
            >
              閉じる
            </button>
            
            {matching.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <Ban size={18} className="mr-2" />
                  却下する
                </button>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <Check size={18} className="mr-2" />
                  承認する
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingDetail;