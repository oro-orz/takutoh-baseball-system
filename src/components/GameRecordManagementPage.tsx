import React, { useState, useEffect } from 'react';
import { Event, GameRecord } from '../types';
import { getEvents, getGameRecords, saveGameRecords } from '../utils/storage';
import { eventService } from '../services/eventService';
import { gameRecordService } from '../services/gameRecordService';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';
import { Trophy, Plus, Edit, Trash2, Save, X, Upload, Calendar } from 'lucide-react';

const GameRecordManagementPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GameRecord | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<GameRecord>>({
    result: 'win',
    score: { our: 0, opponent: 0 },
    files: []
  });

  useEffect(() => {
    loadEvents();
    loadGameRecords();
  }, []);

  const loadEvents = async () => {
    try {
      const loadedEvents = await eventService.getEvents();
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedEvents = getEvents();
      setEvents(loadedEvents);
    }
  };

  const loadGameRecords = async () => {
    try {
      const loadedRecords = await gameRecordService.getGameRecords();
      // Supabaseのデータをアプリケーションの型に変換
      const convertedRecords: GameRecord[] = loadedRecords.map(r => ({
        id: r.id,
        eventId: r.event_id,
        result: r.our_score > r.opponent_score ? 'win' : r.our_score < r.opponent_score ? 'lose' : 'draw',
        score: { our: r.our_score, opponent: r.opponent_score },
        opponent: r.opponent || '',
        details: r.details || '',
        files: [] // ファイルは別途管理
      }));
      setGameRecords(convertedRecords);
    } catch (error) {
      console.error('Failed to load game records:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedRecords = getGameRecords();
      setGameRecords(loadedRecords);
    }
  };

  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case 'practice': return '練習';
      case 'practice_game': return '練習試合';
      case 'official_game': return '公式戦';
      case 'other': return 'その他';
      default: return type;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const resetForm = () => {
    setFormData({
      result: 'win',
      score: { our: 0, opponent: 0 },
      files: []
    });
    setSelectedEventId('');
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await handleAsyncError(async () => {
      if (!selectedEventId) {
        throw new Error('イベントを選択してください');
      }

      const newRecord = {
        event_id: selectedEventId,
        opponent: '対戦相手',
        our_score: formData.score?.our || 0,
        opponent_score: formData.score?.opponent || 0,
        details: `結果: ${formData.result || 'win'}`
      };

      let savedRecord;
      if (editingRecord) {
        savedRecord = await gameRecordService.updateGameRecord(editingRecord.id, newRecord);
      } else {
        savedRecord = await gameRecordService.createGameRecord(newRecord);
      }

      // ローカル状態を更新
      const updatedRecords = editingRecord 
        ? gameRecords.map(r => r.id === editingRecord.id ? {
            id: savedRecord.id,
            eventId: savedRecord.event_id,
            result: (savedRecord.our_score > savedRecord.opponent_score ? 'win' : savedRecord.our_score < savedRecord.opponent_score ? 'lose' : 'draw') as 'win' | 'lose' | 'draw',
            score: { our: savedRecord.our_score, opponent: savedRecord.opponent_score },
            opponent: savedRecord.opponent || '',
            details: savedRecord.details || '',
            files: []
          } : r)
        : [...gameRecords, {
            id: savedRecord.id,
            eventId: savedRecord.event_id,
            result: (savedRecord.our_score > savedRecord.opponent_score ? 'win' : savedRecord.our_score < savedRecord.opponent_score ? 'lose' : 'draw') as 'win' | 'lose' | 'draw',
            score: { our: savedRecord.our_score, opponent: savedRecord.opponent_score },
            opponent: savedRecord.opponent || '',
            details: savedRecord.details || '',
            files: []
          }];
      
      setGameRecords(updatedRecords);
      
      // フォールバック: LocalStorageにも保存
      saveGameRecords(updatedRecords);
      return true;
    }, '試合記録の保存に失敗しました');

    if (result) {
      showSuccess(editingRecord ? '試合記録を更新しました' : '試合記録を追加しました');
      resetForm();
    }
  };

  const handleEdit = (record: GameRecord) => {
    setEditingRecord(record);
    setSelectedEventId(record.eventId);
    setFormData({
      result: record.result,
      score: record.score,
      files: record.files
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('この試合記録を削除しますか？')) return;

    const result = await handleAsyncError(async () => {
      const recordToDelete = gameRecords.find(r => r.eventId === eventId);
      if (recordToDelete) {
        await gameRecordService.deleteGameRecord(recordToDelete.id);
      }

      const updatedRecords = gameRecords.filter(r => r.eventId !== eventId);
      setGameRecords(updatedRecords);
      saveGameRecords(updatedRecords);
      return true;
    }, '試合記録の削除に失敗しました');

    if (result) {
      showSuccess('試合記録を削除しました');
    }
  };

  // 試合記録があるイベントのみを取得
  const gameEvents = events.filter(event => 
    event.type === 'practice_game' || event.type === 'official_game'
  );

  const sortedGameEvents = [...gameEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-900">試合記録管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新規追加</span>
        </button>
      </div>

      {/* フォーム */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              {editingRecord ? '試合記録編集' : '新規試合記録追加'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* イベント選択 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                イベント選択 *
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                required
              >
                <option value="">イベントを選択してください</option>
                {sortedGameEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {formatDate(event.date)} - {event.title} {event.opponent && `vs ${event.opponent}`}
                  </option>
                ))}
              </select>
            </div>

            {/* 試合結果 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                試合結果 *
              </label>
              <div className="flex space-x-2">
                {[
                  { value: 'win', label: '勝利', color: 'bg-green-100 text-green-800' },
                  { value: 'lose', label: '敗北', color: 'bg-red-100 text-red-800' },
                  { value: 'draw', label: '引き分け', color: 'bg-gray-100 text-gray-800' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, result: option.value as any })}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.result === option.value
                        ? option.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* スコア */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                スコア *
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">託麻東</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.score?.our || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      score: { ...formData.score!, our: parseInt(e.target.value) || 0 }
                    })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    required
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.score?.opponent || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      score: { ...formData.score!, opponent: parseInt(e.target.value) || 0 }
                    })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    required
                  />
                  <span className="text-sm text-gray-600">対戦相手</span>
                </div>
              </div>
            </div>

            {/* ファイルアップロード（将来の拡張用） */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                添付ファイル
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">ファイルアップロード機能は今後実装予定</p>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingRecord ? '更新' : '追加'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 試合記録一覧 */}
      <div className="space-y-3">
        {sortedGameEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">試合イベントがありません</p>
            <p className="text-xs text-gray-400 mt-1">まずイベント管理で試合イベントを作成してください</p>
          </div>
        ) : (
          sortedGameEvents.map((event) => {
            const record = gameRecords.find(r => r.eventId === event.id);
            
            return (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getEventTypeLabel(event.type)}
                      </span>
                      <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(event.date)} {event.startTime}〜{event.endTime}</span>
                      </div>
                      <div>📍 {event.location}</div>
                      {event.opponent && <div>vs {event.opponent}</div>}
                    </div>
                    
                    {record && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="font-medium text-gray-700">結果: </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.result === 'win' ? 'bg-green-100 text-green-800' :
                              record.result === 'lose' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.result === 'win' ? '勝利' : 
                               record.result === 'lose' ? '敗北' : '引き分け'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">スコア: </span>
                            <span className="text-gray-900">
                              託麻東 {record.score.our} - {record.score.opponent} 対戦相手
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    {record ? (
                      <>
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setFormData({
                            result: 'win',
                            score: { our: 0, opponent: 0 },
                            files: []
                          });
                          setShowForm(true);
                        }}
                        className="btn-primary text-xs"
                      >
                        記録追加
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameRecordManagementPage;
