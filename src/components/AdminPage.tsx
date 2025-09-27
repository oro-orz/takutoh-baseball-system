import React, { useState, useEffect } from 'react';
import { Event, GameRecord } from '../types';
import { getEvents, getGameRecords, saveGameRecords } from '../utils/storage';
import { eventService } from '../services/eventService';
import { gameRecordService } from '../services/gameRecordService';
import { Trophy } from 'lucide-react';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';

const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <RecordsTab />
    </div>
  );
};

// 試合記録タブコンポーネント
const RecordsTab: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string>('');
  const [editingEventId, setEditingEventId] = useState<string>('');
  const [currentRecord, setCurrentRecord] = useState<Partial<GameRecord>>({
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

  const handleSaveRecord = async (eventId: string) => {
    const result = await handleAsyncError(async () => {
      const existingRecordIndex = gameRecords.findIndex(r => r.eventId === eventId);
    
      const recordToSave = {
        event_id: eventId,
        opponent: '対戦相手',
        our_score: currentRecord.score?.our || 0,
        opponent_score: currentRecord.score?.opponent || 0,
        details: `結果: ${currentRecord.result || 'win'}`
      };

      let savedRecord;
      if (existingRecordIndex >= 0) {
        const existingRecord = gameRecords[existingRecordIndex];
        savedRecord = await gameRecordService.updateGameRecord(existingRecord.id, recordToSave);
      } else {
        savedRecord = await gameRecordService.createGameRecord(recordToSave);
      }

      // ローカル状態を更新
      let updatedRecords;
      if (existingRecordIndex >= 0) {
        updatedRecords = [...gameRecords];
        updatedRecords[existingRecordIndex] = {
          id: savedRecord.id,
          eventId: savedRecord.event_id,
          result: (savedRecord.our_score > savedRecord.opponent_score ? 'win' : savedRecord.our_score < savedRecord.opponent_score ? 'lose' : 'draw') as 'win' | 'lose' | 'draw',
          score: { our: savedRecord.our_score, opponent: savedRecord.opponent_score },
          opponent: savedRecord.opponent || '',
          details: savedRecord.details || '',
          files: []
        };
      } else {
        updatedRecords = [...gameRecords, {
          id: savedRecord.id,
          eventId: savedRecord.event_id,
          result: (savedRecord.our_score > savedRecord.opponent_score ? 'win' : savedRecord.our_score < savedRecord.opponent_score ? 'lose' : 'draw') as 'win' | 'lose' | 'draw',
          score: { our: savedRecord.our_score, opponent: savedRecord.opponent_score },
          opponent: savedRecord.opponent || '',
          details: savedRecord.details || '',
          files: []
        }];
      }

      setGameRecords(updatedRecords);
      saveGameRecords(updatedRecords);
      return true;
    }, '記録の保存に失敗しました');

    if (result) {
      showSuccess('記録を保存しました');
      setEditingEventId('');
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

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sortedEvents.map((event) => {
          const eventRecord = gameRecords.find(r => r.eventId === event.id);
          const isExpanded = expandedEventId === event.id;
          const isEditing = editingEventId === event.id;

          return (
            <div key={event.id} className="border border-gray-200 rounded-lg">
              {/* イベントヘッダー */}
            <button
                onClick={() => setExpandedEventId(isExpanded ? '' : event.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
              <div className="font-medium text-gray-900">{event.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDate(event.date)} {event.startTime}
              </div>
              <div className="text-sm text-gray-500">{event.location}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {eventRecord && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        eventRecord.result === 'win' ? 'bg-green-100 text-green-800' :
                        eventRecord.result === 'lose' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {eventRecord.result === 'win' ? '勝利' : 
                         eventRecord.result === 'lose' ? '敗北' : '引き分け'}
                      </span>
                    )}
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
        </div>
      </div>
            </div>
              </button>

              {/* アコーディオンコンテンツ */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    試合結果
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'win', label: '勝利', color: 'bg-green-100 text-green-800' },
                      { value: 'lose', label: '敗北', color: 'bg-red-100 text-red-800' },
                      { value: 'draw', label: '引き分け', color: 'bg-gray-100 text-gray-800' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCurrentRecord({ ...currentRecord, result: option.value as any })}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                currentRecord.result === option.value
                            ? option.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    スコア
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">託麻東</span>
                      <input
                        type="number"
                        min="0"
                              value={currentRecord.score?.our || 0}
                        onChange={(e) => setCurrentRecord({
                          ...currentRecord,
                          score: { ...currentRecord.score!, our: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                              value={currentRecord.score?.opponent || 0}
                        onChange={(e) => setCurrentRecord({
                          ...currentRecord,
                          score: { ...currentRecord.score!, opponent: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">対戦相手</span>
                    </div>
                  </div>
                </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingEventId('')}
                          className="btn-secondary"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleSaveRecord(event.id)}
                          className="btn-primary"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventRecord ? (
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">試合結果: </span>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              eventRecord.result === 'win' ? 'bg-green-100 text-green-800' :
                              eventRecord.result === 'lose' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {eventRecord.result === 'win' ? '勝利' : 
                               eventRecord.result === 'lose' ? '敗北' : '引き分け'}
                            </span>
                          </div>
                  <div>
                            <span className="text-sm font-medium text-gray-700">スコア: </span>
                            <span className="text-sm text-gray-900">
                              託麻東 {eventRecord.score.our} - {eventRecord.score.opponent} 対戦相手
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">試合記録がありません</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setEditingEventId(event.id);
                            setCurrentRecord({
                              result: eventRecord?.result || 'win',
                              score: eventRecord?.score || { our: 0, opponent: 0 },
                              files: []
                            });
                          }}
                          className="btn-primary"
                        >
                          {eventRecord ? '編集' : '記録追加'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 進捗確認タブコンポーネント（削除済み - ParticipationProgressPageに移動）

// 選手管理タブコンポーネント（削除済み - PlayerManagementPageに移動）

// ファイル管理タブコンポーネント（削除済み）

// 選手フォームコンポーネント（削除済み - PlayerManagementPageに移動）

export default AdminPage;
