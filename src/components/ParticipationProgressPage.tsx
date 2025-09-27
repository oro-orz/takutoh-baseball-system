import React, { useState, useEffect } from 'react';
import { Event, Participation, User, ParticipationSummary } from '../types';
import { getEvents, getParticipations, getUsers } from '../utils/storage';
import { eventService } from '../services/eventService';
import { participationService } from '../services/participationService';
import { userService } from '../services/userService';
import { getPlayerDisplayName } from '../utils/playerName';
import { Users, CheckCircle, XCircle, Clock, Car, Package, Mic, BarChart, X, MessageCircle } from 'lucide-react';

const ParticipationProgressPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEvents();
    loadParticipations();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      const loadedUsers = await userService.getUsers();
      // Supabaseのデータをアプリケーションの型に変換
      const convertedUsers: User[] = loadedUsers.map(u => ({
        id: u.id,
        pin: u.pin,
        name: u.name,
        role: u.role as 'admin' | 'coach' | 'player' | 'parent',
        players: u.players || [],
        defaultCarCapacity: 0,
        defaultEquipmentCar: false,
        defaultUmpire: false
      }));
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedUsers = getUsers();
      setUsers(loadedUsers);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventParticipations = participations.filter(p => p.eventId === selectedEventId);

  // 参加状況の集計
  const calculateSummary = (): ParticipationSummary => {
    const allPlayers = users.flatMap(user => user.players);
    const totalPlayers = allPlayers.length;
    
    let attendingPlayers = 0;
    let notAttendingPlayers = 0;
    let undecidedPlayers = 0;
    let attendingParents = 0;
    let notAttendingParents = 0;
    let undecidedParents = 0;
    let carCount = 0;
    let equipmentCarCount = 0;
    let umpireCount = 0;

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const isPracticeEvent = selectedEvent?.type === 'practice';

    allPlayers.forEach(player => {
      const participation = eventParticipations.find(p => p.playerId === player.id);
      
      if (participation) {
        // 選手の参加状況
        let playerStatus = participation.status;
        
        // 練習イベントの場合、未定は参加として扱う
        if (isPracticeEvent && playerStatus === 'undecided') {
          playerStatus = 'attending';
        }
        
        switch (playerStatus) {
          case 'attending':
            attendingPlayers++;
            break;
          case 'not_attending':
            notAttendingPlayers++;
            break;
          case 'undecided':
            undecidedPlayers++;
            break;
        }
        
        // 保護者の参加状況（練習イベント以外のみ集計）
        if (!isPracticeEvent) {
          const parentParticipation = participation.parentParticipation;
          if (parentParticipation) {
            // 数値の場合は参加人数として加算
            if (!isNaN(Number(parentParticipation)) && Number(parentParticipation) > 0) {
              attendingParents += Number(parentParticipation);
            } else {
              // 文字列の場合は従来の処理
              switch (parentParticipation) {
                case 'attending':
                  attendingParents++;
                  break;
                case 'not_attending':
                  notAttendingParents++;
                  break;
                case 'undecided':
                  undecidedParents++;
                  break;
              }
            }
          }
        }
        
        // 車出し・道具車・審判（練習イベント以外のみ集計）
        if (!isPracticeEvent) {
          if (participation.carCapacity && participation.carCapacity > 0) {
            carCount += participation.carCapacity;
          }
          if (participation.equipmentCar) {
            equipmentCarCount++;
          }
          if (participation.umpire) {
            umpireCount++;
          }
        }
      } else {
        undecidedPlayers++;
        if (!isPracticeEvent) {
          undecidedParents++;
        }
      }
    });

    return {
      totalPlayers,
      attendingPlayers,
      notAttendingPlayers,
      undecidedPlayers,
      attendingParents,
      notAttendingParents,
      undecidedParents,
      carCount,
      equipmentCarCount,
      umpireCount
    };
  };

  const summary = calculateSummary();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'not_attending':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'undecided':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getParentParticipationIcon = (status: string) => {
    // 数値の場合は参加人数として表示（緑のチェック）
    if (!isNaN(Number(status)) && Number(status) > 0) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    
    // 文字列の場合は従来の処理
    switch (status) {
      case 'attending':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'not_attending':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'undecided':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getParentParticipationText = (status: string) => {
    // 数値の場合は参加人数として表示
    if (!isNaN(Number(status)) && Number(status) > 0) {
      return `${status}名`;
    }
    
    // 文字列の場合は従来の処理
    switch (status) {
      case 'attending':
        return '参加';
      case 'not_attending':
        return '不参加';
      case 'undecided':
        return '未定';
      default:
        return '未定';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attending':
        return '参加';
      case 'not_attending':
        return '不参加';
      case 'undecided':
        return '未定';
      default:
        return '未定';
    }
  };

  const sortedEvents = [...events]
    .filter(event => {
      // 未来のイベントのみを表示（今日以降）
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 今日の0時0分0秒
      return eventDate >= today;
    })
    .sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* イベント一覧 */}
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => handleEventClick(event.id)}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatDate(event.date)} {event.startTime}
                </div>
                <div className="text-xs text-gray-500">{event.location}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">参加状況確認</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 進捗確認モーダル */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <BarChart className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 集計情報 */}
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">集計情報</h3>
                <div className={`grid gap-3 ${selectedEvent?.type === 'practice' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">選手参加</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {summary.attendingPlayers}/{summary.totalPlayers}
                    </div>
                    <div className="text-xs text-blue-700">
                      参加率: {summary.totalPlayers > 0 ? Math.round((summary.attendingPlayers / summary.totalPlayers) * 100) : 0}%
                    </div>
                  </div>

                  {selectedEvent?.type !== 'practice' && (
                    <>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">保護者参加</span>
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {summary.attendingParents}名
                        </div>
                        <div className="text-xs text-green-700">
                          合計
                        </div>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Car className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">車出し</span>
                        </div>
                        <div className="text-lg font-bold text-purple-900">
                          {summary.carCount}人分
                        </div>
                        <div className="text-xs text-purple-700">
                          {summary.equipmentCarCount}台の道具車
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Mic className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">審判</span>
                        </div>
                        <div className="text-lg font-bold text-yellow-900">
                          {summary.umpireCount}名
                        </div>
                        <div className="text-xs text-yellow-700">
                          審判担当者
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 参加状況詳細 */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">参加状況詳細</h3>
                <div className="space-y-3">
                  {users
                    .map((user) => {
                      // 各保護者の選手を参加状況でソート
                      const sortedPlayers = user.players
                        .map((player) => {
                          const participation = eventParticipations.find(p => p.playerId === player.id);
                          const playerStatus = participation?.status || 'undecided';
                          const parentStatus = participation?.parentParticipation || 'undecided';
                          return { player, participation, playerStatus, parentStatus };
                        })
                        .sort((a, b) => {
                          // 参加状況でソート: 参加 → 不参加 → 未入力
                          const statusOrder = { 'attending': 0, 'not_attending': 1, 'undecided': 2 };
                          const aOrder = statusOrder[a.playerStatus as keyof typeof statusOrder];
                          const bOrder = statusOrder[b.playerStatus as keyof typeof statusOrder];
                          return aOrder - bOrder;
                        });
                      
                      return { user, sortedPlayers };
                    })
                    .sort((a, b) => {
                      // 保護者も参加状況でソート（最も参加している選手の状況で判定）
                      const getBestStatus = (players: any[]) => {
                        const statusOrder = { 'attending': 0, 'not_attending': 1, 'undecided': 2 };
                        return Math.min(...players.map(p => statusOrder[p.playerStatus as keyof typeof statusOrder]));
                      };
                      return getBestStatus(a.sortedPlayers) - getBestStatus(b.sortedPlayers);
                    })
                    .map(({ user, sortedPlayers }) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{user.name}</h4>
                      <div className="space-y-2">
                        {sortedPlayers.map(({ player, participation, playerStatus, parentStatus }) => {
                          // 練習イベントの場合、未定は参加として表示
                          const displayPlayerStatus = selectedEvent?.type === 'practice' && playerStatus === 'undecided' 
                            ? 'attending' 
                            : playerStatus;
                          
                          return (
                            <div key={player.id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-700">
                                  {getPlayerDisplayName(player)} ({player.grade}年生)
                                </span>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(displayPlayerStatus)}
                                  <span className="text-xs text-gray-600">
                                    選手: {getStatusText(displayPlayerStatus)}
                                  </span>
                                </div>
                                {selectedEvent?.type !== 'practice' && (
                                  <div className="flex items-center space-x-2">
                                    {getParentParticipationIcon(parentStatus)}
                                    <span className="text-xs text-gray-600">
                                      保護者: {getParentParticipationText(parentStatus)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {participation && (
                                <div className="text-xs text-gray-500 space-y-1">
                                  {selectedEvent?.type !== 'practice' && (
                                    <>
                                      {participation.carCapacity && participation.carCapacity > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Car className="w-3 h-3" />
                                          <span>車出し: {participation.carCapacity}人</span>
                                        </div>
                                      )}
                                      {participation.equipmentCar && (
                                        <div className="flex items-center space-x-1">
                                          <Package className="w-3 h-3" />
                                          <span>道具車担当</span>
                                        </div>
                                      )}
                                      {participation.umpire && (
                                        <div className="flex items-center space-x-1">
                                          <Mic className="w-3 h-3" />
                                          <span>審判担当</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {participation.comment && participation.comment.trim() && (
                                    <div className="flex items-start space-x-1 mt-2">
                                      <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span className="text-xs text-gray-600 leading-relaxed">
                                        {participation.comment}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipationProgressPage;
