import React, { useState, useEffect } from 'react';
import { Event, Participation, Player } from '../types';
import { getParticipations, saveParticipations } from '../utils/storage';
import { participationService } from '../services/participationService';
import { getPlayerDisplayName } from '../utils/playerName';
import { CheckCircle, XCircle } from 'lucide-react';
import { showSuccess, handleAsyncError } from '../utils/errorHandler';

interface ParticipationFormProps {
  event: Event;
  players: Player[];
  onSave: () => void;
}

const ParticipationForm: React.FC<ParticipationFormProps> = ({ event, players, onSave }) => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadParticipations();
  }, [event.id]);

  const loadParticipations = async () => {
    try {
      const loadedParticipations = await participationService.getParticipationsByEvent(event.id);
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
      const localParticipations = getParticipations();
      const eventParticipations = localParticipations.filter(p => p.eventId === event.id);
      setParticipations(eventParticipations);
    }
  };

  const eventParticipations = participations.filter(p => p.eventId === event.id);

  const getParticipationForPlayer = (playerId: string): Participation | undefined => {
    return eventParticipations.find(p => p.playerId === playerId);
  };

  const updateParticipation = (playerId: string, updates: Partial<Participation>) => {
    const existingParticipation = getParticipationForPlayer(playerId);

    if (existingParticipation) {
      const updatedParticipations = participations.map(p =>
        p.playerId === playerId && p.eventId === event.id
          ? { ...p, ...updates }
          : p
      );
      setParticipations(updatedParticipations);
    } else {
      const newParticipation: Participation = {
        eventId: event.id,
        playerId,
        status: event.type === 'practice' || event.type === 'other' ? 'attending' : 'undecided',
        parentParticipation: 'undecided',
        carCapacity: 0,
        equipmentCar: false,
        umpire: false,
        ...updates
      };
      setParticipations([...participations, newParticipation]);
    }
  };

  const getFamilyCooperation = () => {
    const firstPlayerParticipation = eventParticipations.find(p =>
      players.some(player => player.id === p.playerId)
    );
    return firstPlayerParticipation || {
      parentParticipation: 'undecided',
      carCapacity: 0,
      equipmentCar: false,
      umpire: false,
      transport: undefined
    };
  };

  const updateFamilyCooperation = (updates: Partial<Participation>) => {
    players.forEach(player => {
      updateParticipation(player.id, updates);
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    const result = await handleAsyncError(async () => {
      if (players.length > 0) {
        updateParticipation(players[0].id, { comment });
      }

      // Supabaseに保存
      for (const participation of eventParticipations) {
        const participationData = {
          event_id: participation.eventId,
          player_id: participation.playerId,
          status: participation.status,
          parent_participation: participation.parentParticipation,
          car_capacity: participation.carCapacity,
          equipment_car: participation.equipmentCar,
          umpire: participation.umpire,
          transport: participation.transport,
          comment: participation.comment
        };

        const existingParticipation = await participationService.getParticipationsByEventAndPlayer(
          participation.eventId, 
          participation.playerId
        );

        if (existingParticipation.length > 0) {
          await participationService.updateParticipation(existingParticipation[0].id, participationData);
        } else {
          await participationService.createParticipation(participationData);
        }
      }

      // フォールバック: LocalStorageにも保存
      const allParticipations = getParticipations();
      const updatedParticipations = allParticipations.filter(p => p.eventId !== event.id);
      saveParticipations([...updatedParticipations, ...participations]);
      onSave();

      return true;
    }, '参加状況の保存に失敗しました');

    if (result) {
      showSuccess('参加状況を保存しました');
    }

    setIsSubmitting(false);
  };

  // 練習イベントかどうかを判定
  const isPracticeEvent = event.type === 'practice' || event.type === 'other';

  return (
    <div className="space-y-6">
      {isPracticeEvent ? (
        // 練習イベント用のシンプルなフォーム
        <PracticeForm event={event} players={players} onSave={onSave} />
      ) : (
        // 通常のイベント用の詳細フォーム
        <>
          {/* 選手の参加状況 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">選手の参加状況</h4>
            </div>

            <div className="p-3 space-y-2">
              {players.map((player, index) => {
                const participation = getParticipationForPlayer(player.id);
                const playerStatus = participation?.status || 'undecided';

                return (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{getPlayerDisplayName(player)}</span>
                        <span className="text-xs text-gray-500 ml-1">{player.grade}年生</span>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                {[
                  {
                    value: 'attending',
                    label: '参加',
                    color: 'bg-blue-500 text-white',
                    icon: CheckCircle,
                    selectedColor: 'bg-blue-500 text-white'
                  },
                  {
                    value: 'not_attending',
                    label: '不参加',
                    color: 'bg-red-500 text-white',
                    icon: XCircle,
                    selectedColor: 'bg-red-500 text-white'
                  }
                ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = playerStatus === option.value;

                        return (
                          <button
                            key={option.value}
                            onClick={() => updateParticipation(player.id, { status: option.value as any })}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                              isSelected
                                ? option.selectedColor
                                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 保護者の参加 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">保護者の参加人数</h4>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => updateFamilyCooperation({ parentParticipation: count.toString() as any })}
                    className={`p-2 rounded-lg text-center transition-all duration-200 ${
                      getFamilyCooperation().parentParticipation === count.toString()
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 active:bg-blue-50 active:text-blue-700'
                    }`}
                  >
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs">名</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 送迎 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">送迎</h4>
            </div>

            <div className="p-3 space-y-2">
              <div className="flex space-x-2">
                {[
                  { value: 'can_transport', label: 'できる', color: 'bg-blue-500 text-white' },
                  { value: 'cannot_transport', label: 'できない', color: 'bg-red-500 text-white' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFamilyCooperation({ transport: option.value as any })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      getFamilyCooperation().transport === option.value
                        ? option.color
                        : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {getFamilyCooperation().transport === 'can_transport' && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    乗合い可能人数
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <button
                        key={count}
                        onClick={() => updateFamilyCooperation({ carCapacity: count })}
                        className={`p-1 rounded-lg text-center transition-all duration-200 ${
                          getFamilyCooperation().carCapacity === count
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-700 active:bg-blue-100 active:text-blue-700 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm font-bold">{count}</div>
                        <div className="text-xs">人</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 道具車・審判 */}
          <div className="space-y-3">
            {/* 道具車 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">道具車</h4>
              </div>

              <div className="p-3">
                <div className="flex space-x-2">
                  {[
                    { value: true, label: 'できる', color: 'bg-blue-500 text-white' },
                    { value: false, label: 'できない', color: 'bg-red-500 text-white' }
                  ].map((option) => (
                    <button
                      key={option.value.toString()}
                      onClick={() => updateFamilyCooperation({ equipmentCar: option.value })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        getFamilyCooperation().equipmentCar === option.value
                          ? option.color
                          : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 審判 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">審判</h4>
              </div>

              <div className="p-3">
                <div className="flex space-x-2">
                  {[
                    { value: true, label: 'できる', color: 'bg-blue-500 text-white' },
                    { value: false, label: 'できない', color: 'bg-red-500 text-white' }
                  ].map((option) => (
                    <button
                      key={option.value.toString()}
                      onClick={() => updateFamilyCooperation({ umpire: option.value })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        getFamilyCooperation().umpire === option.value
                          ? option.color
                          : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* コメント */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">コメント</h4>
            </div>

            <div className="p-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="例：遅刻の可能性があります、体調不良のため不参加、など"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="sticky bottom-4 bg-white pt-4 mt-6 pb-4">
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center space-x-2 min-w-[120px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">保存中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">保存</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 練習用のシンプルなフォームコンポーネント
interface PracticeFormProps {
  event: Event;
  players: Player[];
  onSave: () => void;
}

const PracticeForm: React.FC<PracticeFormProps> = ({ event, players, onSave }) => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadParticipations();
  }, [event.id]);

  const loadParticipations = async () => {
    try {
      const loadedParticipations = await participationService.getParticipationsByEvent(event.id);
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
      const localParticipations = getParticipations();
      const eventParticipations = localParticipations.filter(p => p.eventId === event.id);
      setParticipations(eventParticipations);
    }
  };

  const eventParticipations = participations.filter(p => p.eventId === event.id);

  const getParticipationForPlayer = (playerId: string): Participation | undefined => {
    return eventParticipations.find(p => p.playerId === playerId);
  };

  const updateParticipation = (playerId: string, updates: Partial<Participation>) => {
    const existingParticipation = getParticipationForPlayer(playerId);
    
    if (existingParticipation) {
      const updatedParticipations = participations.map(p => 
        p.playerId === playerId && p.eventId === event.id
          ? { ...p, ...updates }
          : p
      );
      setParticipations(updatedParticipations);
    } else {
      const newParticipation: Participation = {
        eventId: event.id,
        playerId,
        status: 'attending', // 練習は基本的に参加前提
        parentParticipation: 'attending',
        carCapacity: 0,
        equipmentCar: false,
        umpire: false,
        ...updates
      };
      setParticipations([...participations, newParticipation]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const result = await handleAsyncError(async () => {
      // 練習イベントの場合、参加状況が未入力の選手は「参加」として扱う
      const updatedParticipations = participations.map(participation => {
        if (participation.eventId === event.id && participation.status === 'undecided') {
          return { ...participation, status: 'attending' as const };
        }
        return participation;
      });
      
      // コメントを最初の選手の参加状況に保存
      if (players.length > 0) {
        updateParticipation(players[0].id, { comment });
      }
      
      // Supabaseに保存
      for (const participation of eventParticipations) {
        const participationData = {
          event_id: participation.eventId,
          player_id: participation.playerId,
          status: participation.status === 'undecided' ? 'attending' : participation.status,
          parent_participation: participation.parentParticipation,
          car_capacity: participation.carCapacity,
          equipment_car: participation.equipmentCar,
          umpire: participation.umpire,
          transport: participation.transport,
          comment: participation.comment
        };

        const existingParticipation = await participationService.getParticipationsByEventAndPlayer(
          participation.eventId, 
          participation.playerId
        );

        if (existingParticipation.length > 0) {
          await participationService.updateParticipation(existingParticipation[0].id, participationData);
        } else {
          await participationService.createParticipation(participationData);
        }
      }
      
      // フォールバック: LocalStorageにも保存
      const allParticipations = getParticipations();
      const filteredParticipations = allParticipations.filter(p => p.eventId !== event.id);
      saveParticipations([...filteredParticipations, ...participations]);
      onSave();
      return true;
    }, '参加状況の保存に失敗しました');

    if (result) {
      showSuccess('参加状況を保存しました');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
             <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
               <h3 className="text-base font-semibold text-gray-900 mb-1">
                 {event.type === 'practice' ? '平日練習 - 不参加連絡' : '出欠連絡'}
               </h3>
               <p className="text-xs text-gray-600">
                 {event.type === 'practice' 
                   ? '平日練習は基本的に参加前提です。不参加の場合は下記で連絡してください。'
                   : '参加・不参加の連絡をお願いします。'
                 }
               </p>
             </div>

      {/* 選手の不参加連絡 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            {event.type === 'practice' ? '不参加連絡' : '出欠連絡'}
          </h4>
        </div>
        
        <div className="p-3 space-y-2">
          {players.map((player, index) => {
            const participation = getParticipationForPlayer(player.id);
            const playerStatus = participation?.status || (event.type === 'practice' || event.type === 'other' ? 'attending' : 'undecided');

            return (
              <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{getPlayerDisplayName(player)}</span>
                    <span className="text-xs text-gray-500 ml-1">{player.grade}年生</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {event.type === 'practice' ? (
                    // 練習イベント: 参加前提、不参加のみ連絡
                    <>
                      {playerStatus === 'attending' ? (
                        <span className="text-xs text-green-600 font-medium">参加予定</span>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-red-600 font-medium">不参加</span>
                          <button
                            onClick={() => updateParticipation(player.id, { status: 'attending' })}
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            取り消し
                          </button>
                        </div>
                      )}

                      {playerStatus === 'attending' && (
                        <button
                          onClick={() => updateParticipation(player.id, { status: 'not_attending' })}
                          className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium active:bg-red-600 transition-colors"
                        >
                          不参加連絡
                        </button>
                      )}
                    </>
                  ) : (
                    // その他イベント: 参加・不参加の選択
                    <div className="flex space-x-1">
                      {[
                        {
                          value: 'attending',
                          label: '参加',
                          color: 'bg-blue-500 text-white',
                          icon: CheckCircle,
                          selectedColor: 'bg-blue-500 text-white'
                        },
                        {
                          value: 'not_attending',
                          label: '不参加',
                          color: 'bg-red-500 text-white',
                          icon: XCircle,
                          selectedColor: 'bg-red-500 text-white'
                        }
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = playerStatus === option.value;

                        return (
                          <button
                            key={option.value}
                            onClick={() => updateParticipation(player.id, { status: option.value as any })}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                              isSelected
                                ? option.selectedColor
                                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* コメント */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            {event.type === 'practice' ? '不参加理由・連絡事項' : '連絡事項'}
          </h4>
        </div>

        <div className="p-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={event.type === 'practice' 
              ? "不参加の理由や連絡事項があればお書きください（例：体調不良、用事があるため、など）"
              : "連絡事項があればお書きください（例：遅刻の可能性、アレルギー情報、など）"
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="sticky bottom-4 bg-white pt-4 mt-6 pb-4">
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center space-x-2 min-w-[120px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">保存中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">保存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipationForm;
