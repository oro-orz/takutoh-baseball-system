import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Event, Participation } from '../types';
import { getEvents, getParticipations } from '../utils/storage';
import { eventService } from '../services/eventService';
import { participationService } from '../services/participationService';
import { Users, CheckCircle, Clock, Eye } from 'lucide-react';
import EventDetailModal from './EventDetailModal';
import ParticipationForm from './ParticipationForm';

const ParticipationPage: React.FC = () => {
  const { authState } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    loadEvents();
    loadParticipations();
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

  const loadParticipations = async () => {
    try {
      const loadedParticipations = await participationService.getParticipations();
      // Supabaseのデータをアプリケーションの型に変換
      const convertedParticipations: Participation[] = loadedParticipations.map(p => ({
        eventId: p.event_id,
        playerId: p.player_id,
        status: p.status as 'attending' | 'not_attending' | 'undecided',
        parentParticipation: p.parent_participation as 'attending' | 'not_attending' | 'undecided',
        carCapacity: p.car_capacity || 0,
        equipmentCar: p.equipment_car,
        umpire: p.umpire,
        transport: p.transport as 'can_transport' | 'cannot_transport' | undefined,
        comment: p.comment || ''
      }));
      setParticipations(convertedParticipations);
    } catch (error) {
      console.error('Failed to load participations:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedParticipations = getParticipations();
      setParticipations(loadedParticipations);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const user = authState.user;
  
  if (!user || !('players' in user)) {
    return (
      <div className="card text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          管理者の方は参加入力できません
        </h3>
        <p className="text-gray-600">
          参加状況の確認は「進捗確認」タブをご利用ください
        </p>
      </div>
    );
  }

  const userPlayers = user.players;

  // 参加状況の完了判定
  const isParticipationCompleted = (event: Event): boolean => {
    const eventParticipations = participations.filter(p => p.eventId === event.id);
    
    // 全選手の参加状況が入力されているかチェック
    return userPlayers.every(player => {
      const participation = eventParticipations.find(p => p.playerId === player.id);
      if (event.type === 'practice' || event.type === 'other') {
        // 練習・その他イベント: 参加状況が設定されていれば完了
        return participation && participation.status !== 'undecided';
      } else {
        // 試合イベント: 参加状況が設定されていれば完了
        return participation && participation.status !== 'undecided';
      }
    });
  };

  // フィルタリングされたイベント
  const filteredEvents = events.filter(event => {
    const isCompleted = isParticipationCompleted(event);
    switch (filterStatus) {
      case 'completed':
        return isCompleted;
      case 'pending':
        return !isCompleted;
      default:
        return true;
    }
  });

  // イベントを日付順でソート
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleEventClick = (event: Event) => {
    setSelectedEventId(event.id);
    setShowEventModal(true);
  };

  const handleModalClose = () => {
    setShowEventModal(false);
    // 参加状況を再読み込み
    const loadedParticipations = getParticipations();
    setParticipations(loadedParticipations);
  };

  const handleParticipationSave = () => {
    // 参加状況を再読み込み
    loadParticipations();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">参加状況入力</h2>
        <div className="flex space-x-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              filterStatus === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              filterStatus === 'pending'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            未完了
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              filterStatus === 'completed'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            完了済み
          </button>
        </div>
      </div>

      {/* イベント選択（アコーディオン） */}
      <div className="space-y-2">
        {sortedEvents.map((event) => {
          const isCompleted = isParticipationCompleted(event);
          const isSelected = selectedEventId === event.id;
          
          return (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setSelectedEventId(isSelected ? '' : event.id)}
                className={`w-full p-3 text-left transition-colors active:bg-gray-50 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-900 flex-1">
                    {event.title}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>詳細</span>
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {formatDate(event.date)} {event.startTime}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {event.location}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {event.type === 'practice' ? (
                    isCompleted ? '連絡完了' : '不参加連絡待ち'
                  ) : (
                    isCompleted ? '入力完了' : '入力待ち'
                  )}
                </div>
              </button>
              
              {/* アコーディオンコンテンツ */}
              {isSelected && (
                <div className="border-t border-gray-200 p-3 bg-white">
                  <ParticipationForm
                    event={event}
                    players={userPlayers}
                    onSave={handleParticipationSave}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

             {showEventModal && selectedEvent && (
               <EventDetailModal
                 event={selectedEvent}
                 isOpen={showEventModal}
                 onClose={handleModalClose}
               />
             )}
    </div>
  );
};

export default ParticipationPage;
