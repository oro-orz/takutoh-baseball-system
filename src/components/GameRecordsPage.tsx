import React, { useState, useEffect } from 'react';
import { Event, GameRecord } from '../types';
import { getEvents, getGameRecords, saveGameRecords } from '../utils/storage';
import { getFiles, deleteFile, UploadedFile } from '../utils/fileUpload';
import { eventService } from '../services/eventService';
import { gameRecordService } from '../services/gameRecordService';
import { fileService } from '../services/fileService';
import { supabase } from '../services/supabase';
// import { FileUploadArea, FileList } from './FileUpload';
import { Trophy, Upload, Eye, Edit, Save, X, FileText, ChevronDown, Paperclip, Clock, Loader2, Trash2 } from 'lucide-react';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

interface GameRecordsPageProps {
  isAdmin: boolean;
}

const GameRecordsPage: React.FC<GameRecordsPageProps> = ({ isAdmin }) => {
  const { authState } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [currentRecord, setCurrentRecord] = useState<Partial<GameRecord>>({
    result: 'win',
    score: { our: 0, opponent: 0 },
    files: [],
    opponent: ''
  });

  useEffect(() => {
    loadEvents();
    loadGameRecords();
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      // Supabaseからファイルを読み込み
      const loadedFiles = await fileService.getFiles();
      console.log('Supabaseから読み込んだファイル:', loadedFiles);
      // SupabaseのファイルデータをUploadedFile形式に変換
      const convertedFiles: UploadedFile[] = loadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url,
        uploadedAt: f.created_at || new Date().toISOString()
      }));
      console.log('変換後のファイル:', convertedFiles);
      setUploadedFiles(convertedFiles);
    } catch (error) {
      console.error('ファイル読み込みに失敗しました:', error);
      // フォールバック: LocalStorageから読み込み
      try {
        const localFiles = await getFiles();
        setUploadedFiles(localFiles);
      } catch (localError) {
        console.error('LocalStorageからのファイル読み込みに失敗しました:', localError);
        setUploadedFiles([]);
      }
    }
  };

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const loadedEvents = await eventService.getEvents();
      setEvents(loadedEvents);

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
    } catch (error) {
      console.error('イベント読み込みに失敗しました:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedEvents = getEvents();
      setEvents(loadedEvents);

      if (loadedEvents.length > 0) {
        const gameEvents = loadedEvents.filter(event => event.type !== 'practice');
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
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameRecords = async () => {
    try {
      const loadedRecords = await gameRecordService.getGameRecords();
      // Supabaseのデータをアプリケーションの型に変換
      const convertedRecords: GameRecord[] = await Promise.all(loadedRecords.map(async r => {
        // 各記録に関連するファイルを取得
        console.log('記録IDのファイルを取得中:', r.id);
        const files = await fileService.getFilesByGameRecord(r.id);
        console.log('取得されたファイル:', files);
        return {
          id: r.id,
          eventId: r.event_id,
          result: r.our_score > r.opponent_score ? 'win' : r.our_score < r.opponent_score ? 'lose' : 'draw',
          score: { our: r.our_score, opponent: r.opponent_score },
          opponent: r.opponent || '',
          details: r.details || '',
          files: files.map(f => f.id) // ファイルIDの配列
        };
      }));
      setGameRecords(convertedRecords);
    } catch (error) {
      console.error('試合記録読み込みに失敗しました:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedRecords = getGameRecords();
      setGameRecords(loadedRecords);
    }
  };

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

  const handleSaveRecord = async (additionalFiles?: string[]) => {
    if (!selectedEventId) return;

    const result = await handleAsyncError(async () => {
      const existingRecordIndex = gameRecords.findIndex(r => r.eventId === selectedEventId);

      const recordToSave = {
        event_id: selectedEventId,
        opponent: currentRecord.opponent || '',
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

      // ファイル情報を試合記録に関連付け
      const filesToAssociate = additionalFiles || currentRecord.files || [];
      if (filesToAssociate.length > 0) {
        console.log('ファイル関連付け開始:', filesToAssociate);
        console.log('保存された記録ID:', savedRecord.id);
        for (const fileId of filesToAssociate) {
          console.log('ファイルID更新中:', fileId);
          // 既存のファイルのgame_record_idを更新
          const updatedFile = await fileService.updateFile(fileId, {
            game_record_id: savedRecord.id
          });
          console.log('ファイル更新完了:', updatedFile);
        }
        console.log('ファイル関連付け完了');
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
          files: currentRecord.files || []
        };
      } else {
        updatedRecords = [...gameRecords, {
          id: savedRecord.id,
          eventId: savedRecord.event_id,
          result: (savedRecord.our_score > savedRecord.opponent_score ? 'win' : savedRecord.our_score < savedRecord.opponent_score ? 'lose' : 'draw') as 'win' | 'lose' | 'draw',
          score: { our: savedRecord.our_score, opponent: savedRecord.opponent_score },
          opponent: savedRecord.opponent || '',
          details: savedRecord.details || '',
          files: currentRecord.files || []
        }];
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

  const handleFilesUploaded = async (files: UploadedFile[]) => {
    try {
      console.log('ファイルアップロード開始:', files);
      
      // 各ファイルをSupabaseストレージにアップロードしてからデータベースに保存
      const savedFiles: UploadedFile[] = [];
      for (const file of files) {
        console.log('ファイル処理中:', file.name);
        
        // ファイルをSupabaseストレージにアップロード
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `game-records/${fileName}`;
        
        console.log('アップロードパス:', filePath);
        
        // File オブジェクトを取得（URL.createObjectURLから）
        const response = await fetch(file.url);
        const blob = await response.blob();
        
        console.log('Blob作成完了:', blob.size, 'bytes');
        
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, blob);
          
        if (uploadError) {
          console.error('ファイルアップロードに失敗しました:', uploadError);
          continue;
        }
        
        console.log('ストレージアップロード成功');
        
        // 公開URLを取得
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);
        
        console.log('公開URL取得:', urlData.publicUrl);
        
        // データベースにファイル情報を保存
        // ユーザーIDが有効なUUID形式かチェック
        const userId = authState.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authState.user.id) 
          ? authState.user.id 
          : undefined;
        
        const savedFile = await fileService.createFile({
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          uploaded_by: userId
        });
        
        console.log('データベース保存成功:', savedFile);
        
        savedFiles.push({
          id: savedFile.id,
          name: savedFile.name,
          size: savedFile.size,
          type: savedFile.type,
          url: savedFile.url,
          uploadedAt: savedFile.created_at || new Date().toISOString()
        });
      }
      
      console.log('保存されたファイル:', savedFiles);
      
      // ローカル状態を更新
      setUploadedFiles(prev => [...prev, ...savedFiles]);
      
      // アップロードされたファイルを現在の記録に追加
      if (selectedEventId) {
        setCurrentRecord(prev => ({
          ...prev,
          files: [...(prev.files || []), ...savedFiles.map(f => f.id)]
        }));
        
        // ファイルのみをデータベースに関連付け（試合記録は保存しない）
        const existingRecord = gameRecords.find(r => r.eventId === selectedEventId);
        if (existingRecord) {
          // 既存の試合記録がある場合のみファイルを関連付け
          for (const fileId of savedFiles.map(f => f.id)) {
            await fileService.updateFile(fileId, {
              game_record_id: existingRecord.id
            });
          }
        }
      } else {
        // イベントが選択されていない場合、最初の試合イベントを選択
        const gameEvents = events.filter(e => e.type !== 'practice');
        if (gameEvents.length > 0) {
          setSelectedEventId(gameEvents[0].id);
          setCurrentRecord(prev => ({
            ...prev,
            files: [...savedFiles.map(f => f.id)]
          }));
        }
      }
    } catch (error) {
      console.error('ファイル保存に失敗しました:', error);
    }
  };

  const handleFileDeleteClick = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
    setShowDeleteDialog(true);
  };

  const handleFileDeleted = async () => {
    if (!fileToDelete) return;

    const result = await handleAsyncError(async () => {
      await deleteFile(fileToDelete.id);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      
      // 現在の記録からも削除
      setCurrentRecord(prev => ({
        ...prev,
        files: (prev.files || []).filter(id => id !== fileToDelete.id)
      }));
      
      return true;
    }, 'ファイルの削除に失敗しました');

    setShowDeleteDialog(false);
    setFileToDelete(null);

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
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
            <p className="text-sm">試合記録を読み込み中...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
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

            // デバッグ用ログ
            console.log('イベント:', event.title);
            console.log('record:', record);
            console.log('currentRecordFiles:', currentRecordFiles);
            console.log('recordFiles:', recordFiles);
            console.log('allFiles:', allFiles);
            console.log('uploadedFiles:', uploadedFiles);
            console.log('eventFiles:', eventFiles);
            console.log('currentRecord.files:', currentRecord.files);

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
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {event.title}
                        </h3>
                        {record && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            record.result === 'win' 
                              ? 'bg-green-100 text-green-800'
                              : record.result === 'lose'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.result === 'win' ? '勝利' : record.result === 'lose' ? '敗北' : '引き分け'}
                          </span>
                        )}
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
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {record?.opponent || event.opponent || '対戦相手'}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {record ? (
                          <span className={record.result === 'win' ? 'text-green-600' : record.result === 'lose' ? 'text-red-600' : 'text-gray-600'}>
                            {record.score.our} - {record.score.opponent}
                          </span>
                        ) : (
                          <span className="text-gray-400">⚪ - ⚪</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 記録状況表示（未記録の場合のみ） */}
                  {!record && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          未記録
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="text-xs text-gray-400">
                          新規作成可能
                        </div>
                      )}
                    </div>
                  )}
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
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">
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
                              className="flex items-center space-x-1 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50"
                            >
                              <Upload className="w-3 h-3" />
                              <span>ファイルを選択</span>
                            </label>
                          </div>
                        </div>

                        {/* アップロード済みファイル */}
                        {eventFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {eventFiles.map((file) => (
                              <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                  {/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name) ? (
                                    <span>画像をみる</span>
                                  ) : file.name}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      console.log('ファイル閲覧ボタンクリック:', file);
                                      console.log('ファイルURL:', file.url);
                                      
                                      const modal = document.createElement('div');
                                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60';
                                      
                                      const isPdf = file.name.toLowerCase().endsWith('.pdf');
                                      const isImage = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name);
                                      
                                      console.log('ファイルタイプ判定:', { isPdf, isImage, fileName: file.name });
                                      
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
                                    className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded transition-colors"
                                    title="ファイルを表示"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleFileDeleteClick(file.id, file.name)}
                                      className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded transition-colors"
                                      title="ファイルを削除"
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
            onClick={() => handleSaveRecord()}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>記録を保存</span>
          </button>
        </div>
      )}

      {/* ファイル削除確認ダイアログ */}
      {showDeleteDialog && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ファイルを削除しますか？
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {fileToDelete.name}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                この操作は取り消せません
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setFileToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleFileDeleted}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default GameRecordsPage;
