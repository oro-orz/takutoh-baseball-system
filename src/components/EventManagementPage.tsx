import React, { useState, useEffect } from 'react';
import { Event, EventType, ParticipantGroup, ClothingType, LunchType } from '../types';
import { getEvents, saveEvents } from '../utils/storage';
import { uploadFile, deleteFile } from '../utils/fileUpload';
import { eventService } from '../services/eventService';
import { fileService } from '../services/fileService';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';
import { Calendar, Plus, Edit, Trash2, Save, X, Upload, FileText } from 'lucide-react';

const EventManagementPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    type: 'practice',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    opponent: '',
    description: '',
    items: [],
    parking: '',
    eventName: '',
    participants: [],
    meetingTime: '',
    schedule: '',
    clothing: [],
    preparation: '',
    lunch: 'not_required',
    teaGarbageDuty: '',
    equipmentBenchSupport: '',
    reference: '',
    cancellationReason: '',
    files: []
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const loadedEvents = await eventService.getEvents();
      // 各イベントに関連するファイルを取得
      const eventsWithFiles = await Promise.all(loadedEvents.map(async (event) => {
        const files = await fileService.getFilesByEvent(event.id);
        return {
          ...event,
          files: files.map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url,
            uploadedAt: f.created_at || new Date().toISOString()
          }))
        };
      }));
      setEvents(eventsWithFiles);
    } catch (error) {
      console.error('Failed to load events:', error);
      // フォールバック: LocalStorageから読み込み
      const localEvents = getEvents();
      setEvents(localEvents);
    }
  };

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case 'practice': return '練習';
      case 'practice_game': return '練習試合';
      case 'official_game': return '公式戦';
      case 'other': return 'その他';
      case 'cancelled': return '中止';
      case 'postponed': return '延期';
      default: return type;
    }
  };

  const getEventTypeClass = (type: EventType): string => {
    switch (type) {
      case 'practice': return 'event-type-practice';
      case 'practice_game': return 'event-type-practice_game';
      case 'official_game': return 'event-type-official_game';
      case 'other': return 'event-type-other';
      case 'cancelled': return 'event-type-cancelled';
      case 'postponed': return 'event-type-postponed';
      default: return 'event-type-other';
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

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    // HH:MM:SS または HH:MM の形式を HH:MM に統一
    return timeString.substring(0, 5);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'practice',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      opponent: '',
      description: '',
      items: [],
      parking: '',
      eventName: '',
      participants: [],
      meetingTime: '',
      schedule: '',
      clothing: [],
      preparation: '',
      lunch: 'not_required',
      teaGarbageDuty: '',
      equipmentBenchSupport: '',
      reference: '',
      cancellationReason: '',
      files: []
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await handleAsyncError(async () => {
      if (!formData.date || !formData.eventName || !formData.location) {
        throw new Error('必須項目（日付、大会名、会場）を入力してください');
      }

      // 中止・延期の場合は理由が必須
      if ((formData.type === 'cancelled' || formData.type === 'postponed') && !formData.cancellationReason) {
        throw new Error(`${formData.type === 'cancelled' ? '中止' : '延期'}理由を入力してください`);
      }

      const newEvent: Event = {
        id: editingEvent?.id || `event_${Date.now()}`,
        title: formData.eventName || '', // 大会名をタイトルとして使用
        type: formData.type as EventType,
        date: formData.date,
        startTime: formData.startTime || '',
        endTime: formData.endTime || '',
        location: formData.location,
        opponent: formData.opponent || undefined,
        description: formData.description || undefined,
        items: formData.items || [],
        parking: formData.parking || undefined,
        files: formData.files || [],
        // 新しい項目
        eventName: formData.eventName,
        participants: formData.participants || [],
        meetingTime: formData.meetingTime || undefined,
        schedule: formData.schedule || undefined,
        clothing: formData.clothing || [],
        preparation: formData.preparation || undefined,
        lunch: formData.lunch || 'not_required',
        teaGarbageDuty: formData.teaGarbageDuty || undefined,
        equipmentBenchSupport: formData.equipmentBenchSupport || undefined,
        reference: formData.reference || undefined,
        cancellationReason: formData.cancellationReason || undefined
      };

      let savedEvent;
      if (editingEvent) {
        savedEvent = await eventService.updateEvent(editingEvent.id, newEvent);
      } else {
        savedEvent = await eventService.createEvent(newEvent);
      }

      // ファイル情報をSupabaseに保存
      if (formData.files && formData.files.length > 0) {
        for (const file of formData.files) {
          await fileService.createFile({
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.url,
            event_id: savedEvent.id,
            uploaded_by: 'admin' // 管理者がアップロード
          });
        }
      }

      // ローカル状態を更新
      const updatedEvents = editingEvent 
        ? events.map(e => e.id === editingEvent.id ? savedEvent : e)
        : [...events, savedEvent];
      
      setEvents(updatedEvents);
      
      // フォールバック: LocalStorageにも保存
      saveEvents(updatedEvents);
      return true;
    }, 'イベントの保存に失敗しました');

    if (result) {
      showSuccess(editingEvent ? 'イベントを更新しました' : 'イベントを追加しました');
      resetForm();
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      opponent: event.opponent || '',
      description: event.description || '',
      items: event.items || [],
      parking: event.parking || '',
      eventName: event.eventName || '',
      participants: event.participants || [],
      meetingTime: event.meetingTime || '',
      schedule: event.schedule || '',
      clothing: event.clothing || [],
      preparation: event.preparation || '',
      lunch: event.lunch || 'not_required',
      teaGarbageDuty: event.teaGarbageDuty || '',
      equipmentBenchSupport: event.equipmentBenchSupport || '',
      reference: event.reference || '',
      cancellationReason: event.cancellationReason || '',
      files: event.files || []
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？')) return;

    const result = await handleAsyncError(async () => {
      await eventService.deleteEvent(eventId);
      
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      
      // フォールバック: LocalStorageにも保存
      saveEvents(updatedEvents);
      return true;
    }, 'イベントの削除に失敗しました');

    if (result) {
      showSuccess('イベントを削除しました');
    }
  };


  // ファイルアップロード処理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        return await uploadFile(file, editingEvent?.id);
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      
      setFormData({
        ...formData,
        files: [...(formData.files || []), ...uploadedFiles]
      });
    } catch (error) {
      console.error('Failed to upload files:', error);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      const newFiles = (formData.files || []).filter(file => file.id !== fileId);
      setFormData({ ...formData, files: newFiles });
    } catch (error) {
      console.error('Failed to delete file:', error);
      // フォールバック: ローカル状態から削除
      const newFiles = (formData.files || []).filter(file => file.id !== fileId);
      setFormData({ ...formData, files: newFiles });
    }
  };

  // 参加部員の選択肢
  const participantOptions = [
    { value: 'all', label: '全部員' },
    { value: '6th', label: '6年' },
    { value: '5th', label: '5年' },
    { value: '4th', label: '4年' },
    { value: '4th_below', label: '4年以下' },
    { value: '3rd', label: '3年' },
    { value: '3rd_below', label: '3年以下' }
  ];

  // 服装の選択肢
  const clothingOptions = [
    { value: 'official_uniform', label: '公式ユニフォーム' },
    { value: 'second_uniform', label: 'セカンドユニフォーム' },
    { value: 'practice_clothes', label: '練習着' },
    { value: 'takutoh_t', label: '託東T' },
    { value: 'free', label: '自由' }
  ];

  // 参加部員の選択処理
  const toggleParticipant = (value: ParticipantGroup) => {
    const currentParticipants = formData.participants || [];
    const newParticipants = currentParticipants.includes(value)
      ? currentParticipants.filter(p => p !== value)
      : [...currentParticipants, value];
    setFormData({ ...formData, participants: newParticipants });
  };

  // 服装の選択処理
  const toggleClothing = (value: ClothingType) => {
    const currentClothing = formData.clothing || [];
    const newClothing = currentClothing.includes(value)
      ? currentClothing.filter(c => c !== value)
      : [...currentClothing, value];
    setFormData({ ...formData, clothing: newClothing });
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-900">イベント管理</h2>
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
              {editingEvent ? 'イベント編集' : '新規イベント追加'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 1. 日付 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                日付 *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                required
              />
            </div>

            {/* 2. イベントタイプ */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                イベントタイプ *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as EventType;
                  setFormData({ 
                    ...formData, 
                    type: newType,
                    // 中止・延期以外に変更した場合は理由をクリア
                    cancellationReason: (newType === 'cancelled' || newType === 'postponed') ? formData.cancellationReason : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                required
              >
                <option value="practice">練習</option>
                <option value="practice_game">練習試合</option>
                <option value="official_game">公式戦</option>
                <option value="other">その他</option>
                <option value="cancelled">中止</option>
                <option value="postponed">延期</option>
              </select>
            </div>

            {/* 中止・延期理由（イベントタイプの直下に表示） */}
            {(formData.type === 'cancelled' || formData.type === 'postponed') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {formData.type === 'cancelled' ? '中止理由' : '延期理由'} *
                </label>
                <textarea
                  value={formData.cancellationReason}
                  onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows={3}
                  placeholder={`例: ${formData.type === 'cancelled' ? '雨天のため中止' : '雨天のため延期'}`}
                  required
                />
              </div>
            )}

            {/* 3. 大会名 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                大会名 *
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="例: 春季大会"
                required
              />
            </div>

            {/* 4. 参加部員 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                参加部員
              </label>
              <div className="grid grid-cols-2 gap-2">
                {participantOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.participants || []).includes(option.value as ParticipantGroup)}
                      onChange={() => toggleParticipant(option.value as ParticipantGroup)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. 会場 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                会場 *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="例: 託麻東小学校グラウンド"
                required
              />
            </div>

            {/* 6. 集合時間 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                集合時間
              </label>
              <input
                type="text"
                value={formData.meetingTime}
                onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="例: 8:00"
              />
            </div>

            {/* 7. 当日予定 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                当日予定
              </label>
              <textarea
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows={3}
                placeholder="例: 8:00集合 → 8:30準備 → 9:00試合開始"
              />
            </div>

            {/* 8. 服装 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                服装
              </label>
              <div className="grid grid-cols-2 gap-2">
                {clothingOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.clothing || []).includes(option.value as ClothingType)}
                      onChange={() => toggleClothing(option.value as ClothingType)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 9. 準備物 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                準備物
              </label>
              <textarea
                value={formData.preparation}
                onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows={2}
                placeholder="例: 水筒、着替え、熱中症対策"
              />
            </div>

            {/* 10. 昼食 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                昼食
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="lunch"
                    value="required"
                    checked={formData.lunch === 'required'}
                    onChange={(e) => setFormData({ ...formData, lunch: e.target.value as LunchType })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">必要</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="lunch"
                    value="not_required"
                    checked={formData.lunch === 'not_required'}
                    onChange={(e) => setFormData({ ...formData, lunch: e.target.value as LunchType })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">不要</span>
                </label>
              </div>
            </div>

            {/* 11. お茶・ゴミ当番 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                お茶・ゴミ当番
              </label>
              <input
                type="text"
                value={formData.teaGarbageDuty}
                onChange={(e) => setFormData({ ...formData, teaGarbageDuty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="例: 田中さん、佐藤さん"
              />
            </div>

            {/* 12. 道具車・ベンチサポート */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                道具車・ベンチサポート
              </label>
              <input
                type="text"
                value={formData.equipmentBenchSupport}
                onChange={(e) => setFormData({ ...formData, equipmentBenchSupport: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="例: 1班"
              />
            </div>

            {/* 13. 参考事項 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                参考事項
              </label>
              <textarea
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows={3}
                placeholder="例: 参加、不参加の連絡をお願いします"
              />
            </div>


            {/* 15. 添付ファイル */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                添付ファイル
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>ファイルを選択</span>
                  </label>
                </div>
                
                {/* アップロード済みファイル一覧 */}
                {formData.files && formData.files.length > 0 && (
                  <div className="space-y-2">
                    {formData.files.map((file) => (
                      <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                <span>{editingEvent ? '更新' : '追加'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* イベント一覧 */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">イベントがありません</p>
            <p className="text-xs text-gray-400 mt-1">「新規追加」ボタンからイベントを作成してください</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeClass(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900">{event.eventName || event.title}</h3>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div>📍 {event.location}</div>
                    {event.meetingTime && <div>⏰ 集合: {formatTime(event.meetingTime)}</div>}
                    {event.participants && event.participants.length > 0 && (
                      <div>👥 参加: {event.participants.map(p => {
                        const option = participantOptions.find(opt => opt.value === p);
                        return option?.label;
                      }).join(', ')}</div>
                    )}
                    {event.lunch && (
                      <div>🍱 昼食: {event.lunch === 'required' ? '必要' : '不要'}</div>
                    )}
                    {event.cancellationReason && (
                      <div className="text-red-600">
                        {event.type === 'cancelled' ? '❌ 中止理由' : '⏰ 延期理由'}: {event.cancellationReason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <button
                    onClick={() => handleEdit(event)}
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventManagementPage;
