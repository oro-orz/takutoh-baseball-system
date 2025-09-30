import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, Car, CreditCard, MessageCircle } from 'lucide-react';
import { Event, User, Player } from '../types';
import { participationService, Participation } from '../services/participationService';
import { userService } from '../services/userService';
import { getPlayerDisplayName } from '../utils/playerName';
import { handleAsyncError } from '../utils/errorHandler';

interface ParticipationProgressModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerParticipation {
  player: Player;
  parentName: string;
  participation: Participation | null;
  status: 'participating' | 'not_participating' | 'pending';
}

const ParticipationProgressModal: React.FC<ParticipationProgressModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null); // null = 全て
  const [gradeFilter, setGradeFilter] = useState<number | null>(null); // null = 全学年
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [tappedPlayer, setTappedPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // モーダルを閉じる際にタップ状態をリセット
      setTappedPlayer(null);
    }
  }, [isOpen, event.id]);

  const loadData = async () => {
    setIsLoading(true);
    
    await handleAsyncError(async () => {
      // 全ユーザーを取得
      const users = await userService.getUsers();
      setAllUsers(users);

      // 参加状況を取得
      const eventParticipations = await participationService.getParticipationsByEvent(event.id);
      setParticipations(eventParticipations);
    }, 'データの読み込みに失敗しました');
    
    setIsLoading(false);
  };

  // 全選手の参加状況を整理（メモ化）
  const playerParticipations = useMemo((): PlayerParticipation[] => {
    const result: PlayerParticipation[] = [];
    
    allUsers.forEach(user => {
      if (user.role === 'parent' && user.players) {
        user.players.forEach(player => {
          const participation = participations.find(p => p.player_id === player.id);
          let status: 'participating' | 'not_participating' | 'pending' = 'pending';
          
          if (participation) {
            status = participation.status === 'attending' ? 'participating' : 'not_participating';
          }
          
          result.push({
            player,
            parentName: user.name,
            participation: participation || null,
            status
          });
        });
      }
    });
    
    return result;
  }, [allUsers, participations, event.id]);

  // フィルタリングされた選手リスト
  const getFilteredPlayers = (): PlayerParticipation[] => {
    return playerParticipations.filter(playerParticipation => {
      // 参加状況フィルター
      if (statusFilter !== null && playerParticipation.status !== statusFilter) {
        return false;
      }
      
      // 学年フィルター
      if (gradeFilter !== null && playerParticipation.player.grade !== gradeFilter) {
        return false;
      }
      
      return true;
    });
  };

  // 参加状況別にソート
  const getSortedPlayers = (): PlayerParticipation[] => {
    const filteredPlayers = getFilteredPlayers();
    
    return filteredPlayers.sort((a, b) => {
      const statusOrder = { 'participating': 0, 'not_participating': 1, 'pending': 2 };
      const aOrder = statusOrder[a.status];
      const bOrder = statusOrder[b.status];
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // 同じ参加状況の場合は学年順
      return a.player.grade - b.player.grade;
    });
  };

  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status);
  };

  const handleGradeFilterChange = (grade: number | null) => {
    setGradeFilter(grade);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'participating':
        return 'bg-blue-100';
      case 'not_participating':
        return 'bg-red-100';
      case 'pending':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };


  const allPlayers = allUsers.flatMap(u => u.players);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] min-h-[70vh] flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              参加進捗 - {event.eventName || event.title}
            </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* フィルター */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-3">
            {/* 参加状況フィルター */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 font-medium">参加:</span>
              <button
                onClick={() => handleStatusFilterChange(null)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  statusFilter === null
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                全
              </button>
              {[
                { key: 'participating', label: '参加', color: 'bg-blue-100 text-blue-800' },
                { key: 'not_participating', label: '不参加', color: 'bg-red-100 text-red-800' },
                { key: 'pending', label: '未入力', color: 'bg-gray-100 text-gray-800' }
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => handleStatusFilterChange(key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    statusFilter === key
                      ? color
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 学年別フィルター */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 font-medium">学年:</span>
              <button
                onClick={() => handleGradeFilterChange(null)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  gradeFilter === null
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                全
              </button>
              {[1, 2, 3, 4, 5, 6].map(grade => (
                <button
                  key={grade}
                  onClick={() => handleGradeFilterChange(grade)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    gradeFilter === grade
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* アイコン説明 */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>送迎可能</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-3 h-3" />
                <span>道具車可能</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>審判可能</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>コメント</span>
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {getSortedPlayers().map((playerParticipation) => {
                const { player, participation } = playerParticipation;
                
                return (
                  <div
                    key={player.id}
                    className={`p-2 rounded-lg border text-center cursor-pointer relative ${getStatusColor(playerParticipation.status)}`}
                    onMouseEnter={() => setHoveredPlayer(player.id)}
                    onMouseLeave={() => setHoveredPlayer(null)}
                    onClick={() => {
                      if (participation?.comment) {
                        setTappedPlayer(tappedPlayer === player.id ? null : player.id);
                      }
                    }}
                  >
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      {getPlayerDisplayName(player, allPlayers)}
                    </div>
                    
                    <div className="flex items-center justify-center space-x-1 text-xs">
                      {participation?.car_capacity && participation.car_capacity > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-2.5 h-2.5" />
                          <span className="text-xs">{participation.car_capacity}</span>
                        </div>
                      )}
                      {participation?.equipment_car && (
                        <Car className="w-2.5 h-2.5" />
                      )}
                      {participation?.umpire && (
                        <CreditCard className="w-2.5 h-2.5" />
                      )}
                      {participation?.comment && (
                        <MessageCircle className="w-2.5 h-2.5" />
                      )}
                    </div>

                    {/* ツールチップ */}
                    {((hoveredPlayer === player.id || tappedPlayer === player.id) && participation?.comment) && (
                      <div className="absolute inset-0 p-2 rounded-lg border text-center z-10 bg-white shadow-lg">
                        <div className="text-xs font-medium text-gray-900 mb-1">
                          {getPlayerDisplayName(player, allPlayers)}
                        </div>
                        <div className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                          {participation.comment}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 text-center">
            {getFilteredPlayers().length}名の選手を表示中
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationProgressModal;
