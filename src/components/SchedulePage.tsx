import React, { useState, useEffect } from 'react';
import { Event, EventType } from '../types';
import { getEvents } from '../utils/storage';
import { eventService } from '../services/eventService';
import { fileService } from '../services/fileService';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import EventDetailModal from './EventDetailModal';

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case 'practice':
        return '練習';
      case 'practice_game':
        return '練習試合';
      case 'official_game':
        return '公式戦';
      case 'other':
        return 'その他';
      case 'cancelled':
        return '中止';
      case 'postponed':
        return '延期';
      default:
        return 'その他';
    }
  };

  const getEventTypeClass = (type: EventType): string => {
    switch (type) {
      case 'practice':
        return 'event-type-practice';
      case 'practice_game':
        return 'event-type-practice_game';
      case 'official_game':
        return 'event-type-official_game';
      case 'other':
        return 'event-type-other';
      case 'cancelled':
        return 'event-type-cancelled';
      case 'postponed':
        return 'event-type-postponed';
      default:
        return 'event-type-other';
    }
  };

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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // 日付フィルタリング（アーカイブ表示の制御）
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 当日の開始時刻に設定
  
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0); // イベント日の開始時刻に設定
    
    if (showArchived) {
      // アーカイブ表示時：過去のイベントのみ
      return eventDate < today;
    } else {
      // 通常表示時：当日以降のイベント
      return eventDate >= today;
    }
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold text-gray-900">予定一覧</h2>
          <div className="text-xs text-gray-600">
            {filteredEvents.length}件
          </div>
        </div>
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
            {showArchived ? '最新のイベント' : '過去のイベント'}
          </button>
        </div>
      </div>

      {/* イベントリスト */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
            <p className="text-sm">イベントを読み込み中...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {showArchived ? '過去の予定はありません' : '今後の予定はありません'}
            </p>
            {!showArchived && (
              <button
                onClick={() => setShowArchived(true)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                過去のイベントを表示
              </button>
            )}
          </div>
        ) : (
          sortedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer transition-all duration-200 active:bg-gray-50"
            onClick={() => handleEventClick(event)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 flex-1 pr-3">
                {event.eventName || event.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeClass(event.type)}`}>
                {getEventTypeLabel(event.type)}
              </span>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(event.date)}</span>
                {event.meetingTime && (
                  <>
                    <span className="mx-1">•</span>
                    <Clock className="w-3 h-3" />
                    <span>集合: {formatTime(event.meetingTime)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.location}</span>
              </div>
              {event.participants && event.participants.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-600">
                    参加: {event.participants.map(p => {
                      const labels = {
                        'all': '全部員', '6th': '6年', '5th': '5年', '4th': '4年',
                        '4th_below': '4年以下', '3rd': '3年', '3rd_below': '3年以下'
                      };
                      return labels[p];
                    }).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="mt-2 text-xs text-gray-700 line-clamp-1">
                {event.description}
              </p>
            )}
          </div>
          ))
        )}
      </div>

      {/* モーダル */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SchedulePage;
