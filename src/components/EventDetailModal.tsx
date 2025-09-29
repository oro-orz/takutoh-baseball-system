import React, { useState, useRef } from 'react';
import { X, Calendar, Clock, MapPin, FileText, Download, Eye, Users } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ParticipationForm, { ParticipationFormRef } from './ParticipationForm';
import ParticipationProgressModal from './ParticipationProgressModal';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose }) => {
  const { authState } = useAuth();
  const [viewingFile, setViewingFile] = useState<{url: string, name: string} | null>(null);
  const [showParticipationProgress, setShowParticipationProgress] = useState(false);
  const participationFormRef = useRef<ParticipationFormRef>(null);
  
  if (!isOpen || !event) return null;

  const handleParticipationSave = () => {
    // 参加状況保存後の処理（必要に応じて追加）
    console.log('参加状況が保存されました');
  };

  const handleParticipationProgressClose = () => {
    setShowParticipationProgress(false);
    // 参加進捗モーダルを閉じる際に、参加入力フォームを再読み込み
    if (participationFormRef.current) {
      participationFormRef.current.reloadParticipations();
    }
  };

  const isPdfFile = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const getFileNameWithoutExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleFileView = (fileUrl: string, fileName: string) => {
    setViewingFile({url: fileUrl, name: fileName});
  };

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const user = authState.user;
  const isAdmin = authState.isAdmin;
  const canParticipate = !isAdmin && user && 'pin' in user;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    // HH:MM:SS または HH:MM の形式を HH:MM に統一
    return timeString.substring(0, 5);
  };

  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case 'practice':
        return '練習';
      case 'practice_game':
        return '練習試合';
      case 'official_game':
        return '公式戦';
      case 'other':
        return 'その他';
      default:
        return 'その他';
    }
  };

  const getEventTypeClass = (type: string): string => {
    switch (type) {
      case 'practice':
        return 'event-type-practice';
      case 'practice_game':
        return 'event-type-practice_game';
      case 'official_game':
        return 'event-type-official_game';
      case 'other':
        return 'event-type-other';
      default:
        return 'event-type-other';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* 固定ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-gray-900">{event.eventName || event.title}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeClass(event.type)}`}>
              {getEventTypeLabel(event.type)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* スクロール可能なコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
          {/* 基本情報 */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">基本情報</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{formatDate(event.date)}</span>
              </div>
              {event.meetingTime && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">集合: {formatTime(event.meetingTime)}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{event.location}</span>
              </div>
            </div>
          </div>

          {/* 参加部員 */}
          {event.participants && event.participants.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">参加部員</h3>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((participant) => {
                  const labels = {
                    'all': '全部員',
                    '6th': '6年',
                    '5th': '5年',
                    '4th': '4年',
                    '4th_below': '4年以下',
                    '3rd': '3年',
                    '3rd_below': '3年以下'
                  };
                  return (
                    <span key={participant} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {labels[participant]}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 当日予定 */}
          {event.schedule && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">当日予定</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{event.schedule}</p>
              </div>
            </div>
          )}

          {/* 服装 */}
          {event.clothing && event.clothing.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">服装</h3>
              <div className="flex flex-wrap gap-2">
                {event.clothing.map((clothing) => {
                  const labels = {
                    'official_uniform': '公式ユニフォーム',
                    'second_uniform': 'セカンドユニフォーム',
                    'practice_clothes': '練習着',
                    'takutoh_t': '託東T',
                    'free': '自由'
                  };
                  return (
                    <span key={clothing} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {labels[clothing]}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 準備物 */}
          {event.preparation && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">準備物</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{event.preparation}</p>
              </div>
            </div>
          )}

          {/* 昼食 */}
          {event.lunch && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">昼食</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.lunch === 'required' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {event.lunch === 'required' ? '必要' : '不要'}
              </span>
            </div>
          )}

          {/* お茶・ゴミ当番 */}
          {event.teaGarbageDuty && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">お茶・ゴミ当番</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{event.teaGarbageDuty}</p>
              </div>
            </div>
          )}

          {/* 道具車・ベンチサポート */}
          {event.equipmentBenchSupport && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">道具車・ベンチサポート</h3>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{event.equipmentBenchSupport}</p>
              </div>
            </div>
          )}

          {/* 参考事項 */}
          {event.reference && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">参考事項</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{event.reference}</p>
              </div>
            </div>
          )}

          {/* 詳細 */}
          {event.description && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">詳細</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* 持ち物 */}
          {event.items && event.items.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">持ち物</h3>
              <ul className="space-y-2">
                {event.items.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 駐車場 */}
          {event.parking && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">駐車場</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{event.parking}</p>
              </div>
            </div>
          )}

          {/* 添付ファイル */}
          {event.files && event.files.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">添付ファイル</h3>
              <div className="space-y-2">
                {event.files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    {getFileIcon(file.name)}
                    <span className="text-sm text-gray-700 flex-1 font-medium">{file.name}</span>
                    <div className="flex items-center space-x-2">
                      {isPdfFile(file.name) && (
                        <button 
                          onClick={() => handleFileView(file.url, file.name)}
                          className="text-blue-600 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-50"
                          title="PDFを表示"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleFileDownload(file.url, file.name)}
                        className="text-primary-600 hover:text-primary-700 transition-colors p-1 rounded hover:bg-primary-50"
                        title="ダウンロード"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 参加進捗 */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">参加進捗</h3>
            <button
              onClick={() => setShowParticipationProgress(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>参加進捗を見る</span>
            </button>
          </div>
          </div>

          {/* 参加入力フォーム（保護者のみ） */}
          {canParticipate && user && (
            <div className="border-t border-gray-200 p-4">
              <ParticipationForm
                ref={participationFormRef}
                event={event}
                players={'players' in user ? user.players : []}
                allPlayers={[]} // TODO: 全選手データを取得して渡す
                onSave={handleParticipationSave}
              />
            </div>
          )}

          {/* フッター */}
          {!canParticipate && (
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF表示モーダル */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <div className="flex flex-col">
                <h3 className="text-sm font-medium text-gray-900">{getFileNameWithoutExtension(viewingFile.name)}</h3>
              </div>
              <button
                onClick={() => setViewingFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={viewingFile.url}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 参加進捗モーダル */}
      {event && (
        <ParticipationProgressModal
          event={event}
          isOpen={showParticipationProgress}
          onClose={handleParticipationProgressClose}
        />
      )}
    </div>
  );
};

export default EventDetailModal;
