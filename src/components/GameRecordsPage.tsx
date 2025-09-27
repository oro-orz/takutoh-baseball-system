import React, { useState, useEffect } from 'react';
import { Event, GameRecord } from '../types';
import { getEvents, getGameRecords, saveGameRecords } from '../utils/storage';
import { getStoredFiles, deleteFile, UploadedFile } from '../utils/fileUpload';
// import { FileUploadArea, FileList } from './FileUpload';
import { Trophy, Upload, Eye, Edit, Save, X, FileText, ChevronDown, Paperclip, Check, Minus, Clock } from 'lucide-react';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';

interface GameRecordsPageProps {
  isAdmin: boolean;
}

const GameRecordsPage: React.FC<GameRecordsPageProps> = ({ isAdmin }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<GameRecord>>({
    result: 'win',
    score: { our: 0, opponent: 0 },
    files: [],
    opponent: ''
  });

  useEffect(() => {
    const loadedEvents = getEvents();
    const loadedRecords = getGameRecords();
    const loadedFiles = getStoredFiles();
    
    setEvents(loadedEvents);
    setGameRecords(loadedRecords);
    setUploadedFiles(loadedFiles);

    if (loadedEvents.length > 0) {
      const gameEvents = loadedEvents.filter(event => event.type !== 'practice');
      // 初期表示は最近の試合（30日以内）を表示
      const recentGameEvents = gameEvents.filter(event => {
        const eventDate = new Date(event.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return eventDate >= thirtyDaysAgo;
      });
      const sortedEvents = [...recentGameEvents].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      if (sortedEvents.length > 0) {
        setSelectedEventId(sortedEvents[0].id);
      }
    }
  }, []);

  // 試合記録対象のイベントをフィルタリング（練習以外）
  const gameEvents = events.filter(event => event.type !== 'practice');
  
  // 日付フィルタリング（アーカイブ表示の制御）
  const filteredGameEvents = gameEvents.filter(event => {
    if (showArchived) {
      // アーカイブ表示時：過去の試合のみ（30日前まで）
      const eventDate = new Date(event.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return eventDate < thirtyDaysAgo;
    } else {
      // 通常表示時：最近の試合（30日以内）
      const eventDate = new Date(event.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return eventDate >= thirtyDaysAgo;
    }
  });
  
  // const selectedEvent = filteredGameEvents.find(e => e.id === selectedEventId);
  // const eventRecord = gameRecords.find(r => r.eventId === selectedEventId);

  const handleSaveRecord = async () => {
    if (!selectedEventId) return;

    const result = await handleAsyncError(async () => {
      const existingRecordIndex = gameRecords.findIndex(r => r.eventId === selectedEventId);

      const recordToSave: GameRecord = {
        eventId: selectedEventId,
        result: currentRecord.result || 'win',
        score: currentRecord.score || { our: 0, opponent: 0 },
        files: currentRecord.files || [],
        opponent: currentRecord.opponent || ''
      };

      let updatedRecords;
      if (existingRecordIndex >= 0) {
        updatedRecords = [...gameRecords];
        updatedRecords[existingRecordIndex] = recordToSave;
      } else {
        updatedRecords = [...gameRecords, recordToSave];
      }

      setGameRecords(updatedRecords);
      saveGameRecords(updatedRecords);
      return true;
    }, '記録の保存に失敗しました');

    if (result) {
      showSuccess('記録を保存しました');
      setIsEditing(false);
    }
  };

  // const handleFileUploaded = (file: UploadedFile) => {
  //   setUploadedFiles(prev => [...prev, file]);
  //   
  //   // アップロードされたファイルを現在の記録に追加
  //   if (selectedEventId) {
  //     setCurrentRecord(prev => ({
  //       ...prev,
  //       files: [...(prev.files || []), file.id]
  //     }));
  //   }
  // };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // アップロードされたファイルを現在の記録に追加
    if (selectedEventId) {
      setCurrentRecord(prev => ({
        ...prev,
        files: [...(prev.files || []), ...files.map(f => f.id)]
      }));
    }
  };

  const handleFileDeleted = async (fileId: string) => {
    const result = await handleAsyncError(async () => {
      await deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      
      // 現在の記録からも削除
      setCurrentRecord(prev => ({
        ...prev,
        files: (prev.files || []).filter(id => id !== fileId)
      }));
      
      return true;
    }, 'ファイルの削除に失敗しました');

    if (result) {
      showSuccess('ファイルを削除しました');
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

  const sortedEvents = [...filteredGameEvents].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">試合記録</h2>
        <div className="flex items-center space-x-2">
          {/* アーカイブ表示切り替え */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              showArchived 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showArchived ? 'アーカイブ表示中' : '過去の試合'}
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                if (!isEditing) {
                  // 編集モード開始時、既存の記録があれば読み込む
                  const existingRecord = gameRecords.find(r => r.eventId === selectedEventId);
                  if (existingRecord) {
                    setCurrentRecord({
                      result: existingRecord.result,
                      score: existingRecord.score,
                      files: existingRecord.files,
                      opponent: existingRecord.opponent || ''
                    });
                  } else {
                    // 新規作成の場合、デフォルト値を設定
                    setCurrentRecord({
                      result: 'win',
                      score: { our: 0, opponent: 0 },
                      files: [],
                      opponent: ''
                    });
                  }
                }
                setIsEditing(!isEditing);
              }}
              className="btn-primary flex items-center space-x-1"
            >
              <Edit className="w-3 h-3" />
              <span>{isEditing ? 'キャンセル' : '編集'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 試合記録一覧（アコーディオン） */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {showArchived ? '過去の試合記録はありません' : '最近の試合記録はありません'}
            </p>
            {!showArchived && (
              <button
                onClick={() => setShowArchived(true)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                過去の試合を表示
              </button>
            )}
          </div>
        ) : (
          sortedEvents.map((event) => {
            const record = gameRecords.find(r => r.eventId === event.id);
            const currentRecordFiles = selectedEventId === event.id ? currentRecord.files || [] : [];
            const recordFiles = record?.files || [];
            const allFiles = [...new Set([...recordFiles, ...currentRecordFiles])];
            const eventFiles = uploadedFiles.filter(f => 
              allFiles.includes(f.id)
            );
            const isSelected = selectedEventId === event.id;

            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setSelectedEventId(isSelected ? '' : event.id)}
                className={`w-full p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="space-y-3">
                  {/* ヘッダー部分 */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {event.title}
                        </h3>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(event.date)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {eventFiles.length > 0 && (
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                          <Paperclip className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{eventFiles.length}</span>
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                        isSelected ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>

                  {/* 試合結果部分 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-600">対戦相手</div>
                      <div className="text-xs text-gray-600">スコア</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {record?.opponent || event.opponent || '対戦相手'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-lg font-bold text-gray-900">
                          {record ? (
                            <span className={record.result === 'win' ? 'text-green-600' : record.result === 'lose' ? 'text-red-600' : 'text-gray-600'}>
                              {record.score.our} - {record.score.opponent}
                            </span>
                          ) : (
                            <span className="text-gray-400">⚪ - ⚪</span>
                          )}
                        </div>
                        {record && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            record.result === 'win' 
                              ? 'bg-green-100' 
                              : record.result === 'lose'
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                          }`}>
                            {record.result === 'win' ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : record.result === 'lose' ? (
                              <X className="w-3 h-3 text-red-600" />
                            ) : (
                              <Minus className="w-3 h-3 text-gray-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ステータス表示 */}
                  <div className="flex items-center justify-between">
                    <div>
                      {record ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          record.result === 'win' 
                            ? 'bg-green-100 text-green-800'
                            : record.result === 'lose'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.result === 'win' ? '勝利' : record.result === 'lose' ? '敗北' : '引き分け'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          未記録
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="text-xs text-gray-400">
                        {record ? '記録済み' : '新規作成可能'}
                      </div>
                    )}
                  </div>
                </div>
              </button>
              
              {/* アコーディオンコンテンツ */}
              {isSelected && (
                <div className="border-t border-gray-200 p-3 bg-white">
                  
                  {record ? (
                    <div className="space-y-4">

                      {/* 試合結果編集（管理者のみ） */}
                      {isAdmin && isEditing && (
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
                      )}

                      {/* 対戦相手編集（管理者のみ） */}
                      {isAdmin && isEditing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            対戦相手
                          </label>
                          <input
                            type="text"
                            value={currentRecord.opponent || ''}
                            onChange={(e) => setCurrentRecord({
                              ...currentRecord,
                              opponent: e.target.value
                            })}
                            placeholder="対戦相手を入力"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      )}

                      {/* スコア編集（管理者のみ） */}
                      {isAdmin && isEditing && (
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
                      )}

                      {/* スコアブック・写真アップロード */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          スコアブック・試合写真
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                const newFiles = Array.from(files).map(file => ({
                                  id: `file_${Date.now()}_${Math.random()}`,
                                  name: file.name,
                                  size: file.size,
                                  type: file.type,
                                  url: URL.createObjectURL(file),
                                  uploadedAt: new Date().toISOString()
                                }));
                                handleFilesUploaded(newFiles);
                              }
                            }}
                            className="hidden"
                            id="scorebook-upload"
                          />
                          <label
                            htmlFor="scorebook-upload"
                            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50"
                          >
                            <Upload className="w-4 h-4" />
                            <span>ファイルを選択</span>
                          </label>
                        </div>

                        {/* アップロード済みファイル */}
                        {eventFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {eventFiles.map((file) => (
                              <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      const modal = document.createElement('div');
                                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60';
                                      
                                      const isPdf = file.name.toLowerCase().endsWith('.pdf');
                                      const isImage = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name);
                                      
                                      let content = '';
                                      if (isPdf) {
                                        content = `<iframe src="${file.url}" class="w-full h-full border-0" title="PDF Viewer"></iframe>`;
                                      } else if (isImage) {
                                        content = `<img src="${file.url}" class="max-w-full max-h-full object-contain" alt="${file.name}" />`;
                                      } else {
                                        content = `<div class="flex items-center justify-center h-full text-gray-500">このファイルはプレビューできません</div>`;
                                      }
                                      
                                      modal.innerHTML = `
                                        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                                          <div class="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                                            <h3 class="text-sm font-medium text-gray-900">${file.name.replace(/\.[^/.]+$/, "")}</h3>
                                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                              </svg>
                                            </button>
                                          </div>
                                          <div class="flex-1 overflow-hidden flex items-center justify-center p-4">
                                            ${content}
                                          </div>
                                        </div>
                                      `;
                                      document.body.appendChild(modal);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 transition-colors"
                                    title="ファイルを表示"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleFileDeleted(file.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-4 text-gray-500">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">試合記録がありません</p>
                        {isAdmin && (
                          <p className="text-xs mt-1">「編集」ボタンから記録を追加してください</p>
                        )}
                      </div>

                      {/* 新規記録作成（管理者のみ） */}
                      {isAdmin && isEditing && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              対戦相手
                            </label>
                            <input
                              type="text"
                              value={currentRecord.opponent || ''}
                              onChange={(e) => setCurrentRecord({
                                ...currentRecord,
                                opponent: e.target.value
                              })}
                              placeholder="対戦相手を入力"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>

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
                                <span className="text-sm text-gray-600">私たち</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={currentRecord.score?.our || 0}
                                  onChange={(e) => setCurrentRecord({
                                    ...currentRecord,
                                    score: { ...currentRecord.score!, our: parseInt(e.target.value) || 0 }
                                  })}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
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
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                />
                                <span className="text-sm text-gray-600">相手</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ファイルアップロード
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files) {
                                    const newFiles = Array.from(files).map(file => ({
                                      id: `file_${Date.now()}_${Math.random()}`,
                                      name: file.name,
                                      size: file.size,
                                      type: file.type,
                                      url: URL.createObjectURL(file),
                                      uploadedAt: new Date().toISOString()
                                    }));
                                    handleFilesUploaded(newFiles);
                                  }
                                }}
                                className="hidden"
                                id="new-record-upload"
                              />
                              <label
                                htmlFor="new-record-upload"
                                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50"
                              >
                                <Upload className="w-4 h-4" />
                                <span>ファイルを選択</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              </div>
            );
          })
        )}
      </div>


      {/* 保存ボタン（管理者のみ） */}
      {isAdmin && isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveRecord}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>記録を保存</span>
          </button>
        </div>
      )}
    </div>
  );
};


export default GameRecordsPage;
