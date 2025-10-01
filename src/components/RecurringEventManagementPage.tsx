import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Play, Settings } from 'lucide-react';
import { recurringEventService, RecurringPattern } from '../services/recurringEventService';
import { showSuccess, showError, handleAsyncError } from '../utils/errorHandler';

const RecurringEventManagementPage: React.FC = () => {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [editingPattern, setEditingPattern] = useState<RecurringPattern | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setIsLoading(true);
    try {
      // TODO: Supabaseからパターンを取得
      const loadedPatterns = await recurringEventService.getActivePatterns();
      setPatterns(loadedPatterns);
    } catch (error) {
      console.error('パターン読み込みエラー:', error);
      showError('パターンの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEvents = async () => {
    const result = await handleAsyncError(async () => {
      setIsGenerating(true);
      
      // 現在の月のイベントを生成
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const generatedCount = await recurringEventService.generateAndSaveEventsForMonth(year, month);
      
      return generatedCount;
    }, '定期イベントの生成に失敗しました');

    if (result !== undefined) {
      showSuccess(`${result}件の定期イベントを生成しました`);
    }
    setIsGenerating(false);
  };

  const handleGenerateEventsForMonth = async (year: number, month: number) => {
    const result = await handleAsyncError(async () => {
      setIsGenerating(true);
      
      const generatedCount = await recurringEventService.generateAndSaveEventsForMonth(year, month);
      
      return generatedCount;
    }, '定期イベントの生成に失敗しました');

    if (result !== undefined) {
      showSuccess(`${year}年${month}月に${result}件の定期イベントを生成しました`);
    }
    setIsGenerating(false);
  };

  const getPatternDescription = (pattern: RecurringPattern): string => {
    if (pattern.patternType === 'weekly') {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      return `毎週${days[pattern.dayOfWeek!]}曜日`;
    } else {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const weeks = ['', '第1', '第2', '第3', '第4'];
      return `${weeks[pattern.weekOfMonth!]}${days[pattern.dayOfWeek!]}曜日`;
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'practice': '練習',
      'game': '試合',
      'other': 'その他'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">定期イベント設定</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateEvents}
            disabled={isGenerating}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{isGenerating ? '生成中...' : '今月のイベント生成'}</span>
          </button>
          <button
            onClick={() => setShowAddPattern(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>パターン追加</span>
          </button>
        </div>
      </div>

      {/* 今月のイベント生成 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">今月のイベント生成</h3>
        <p className="text-xs text-blue-700 mb-3">
          現在の月（{new Date().getFullYear()}年{new Date().getMonth() + 1}月）の定期イベントを生成します
        </p>
        <button
          onClick={handleGenerateEvents}
          disabled={isGenerating}
          className="btn-primary text-sm"
        >
          {isGenerating ? '生成中...' : '今月のイベントを生成'}
        </button>
      </div>

      {/* パターン一覧 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">定期パターン一覧</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : patterns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">定期パターンが登録されていません</p>
            <p className="text-xs text-gray-400 mt-1">「パターン追加」ボタンから追加してください</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{pattern.title}</h4>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getEventTypeLabel(pattern.eventType)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{getPatternDescription(pattern)}</span>
                        {pattern.skipHolidays && (
                          <span className="text-orange-600">（祝日スキップ）</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📍 {pattern.location}</span>
                        <span>🕐 {pattern.startTime}〜{pattern.endTime}</span>
                      </div>
                      {pattern.description && (
                        <div className="text-gray-500">{pattern.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-4">
                    <button
                      onClick={() => setEditingPattern(pattern)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('このパターンを削除しますか？')) {
                          // TODO: 削除処理
                          showSuccess('パターンを削除しました');
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* パターン追加・編集モーダル */}
      {(showAddPattern || editingPattern) && (
        <PatternFormModal
          pattern={editingPattern}
          onClose={() => {
            setShowAddPattern(false);
            setEditingPattern(null);
          }}
          onSave={(pattern) => {
            // TODO: パターン保存処理
            showSuccess(editingPattern ? 'パターンを更新しました' : 'パターンを追加しました');
            setShowAddPattern(false);
            setEditingPattern(null);
            loadPatterns();
          }}
        />
      )}
    </div>
  );
};

// パターンフォームモーダル（簡易版）
interface PatternFormModalProps {
  pattern?: RecurringPattern | null;
  onClose: () => void;
  onSave: (pattern: RecurringPattern) => void;
}

const PatternFormModal: React.FC<PatternFormModalProps> = ({ pattern, onClose, onSave }) => {
  // TODO: パターンフォームの実装
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {pattern ? 'パターン編集' : 'パターン追加'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          パターンフォームの実装は次のステップで行います
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringEventManagementPage;
