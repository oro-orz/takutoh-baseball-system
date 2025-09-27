import React, { useState, useEffect } from 'react';
import { User, Player } from '../types';
import { userService } from '../services/userService';
import { Users, Filter } from 'lucide-react';

const PlayerRosterPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const loadedUsers = await userService.getUsers();
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  // 学年別フィルター機能
  const getAvailableGrades = (): string[] => {
    const grades = new Set<string>();
    users.forEach(user => {
      user.players.forEach(player => {
        grades.add(player.grade.toString());
      });
    });
    return Array.from(grades).sort((a, b) => parseInt(b) - parseInt(a)); // 6年から1年の順
  };

  const getFilteredPlayers = (): Array<Player & { parentName: string }> => {
    const allPlayers: Array<Player & { parentName: string }> = [];
    users.forEach(user => {
      user.players.forEach(player => {
        allPlayers.push({
          ...player,
          parentName: user.name // 保護者名を追加（表示用）
        });
      });
    });

    if (selectedGrade === 'all') {
      return allPlayers;
    }

    return allPlayers.filter(player => 
      player.grade.toString() === selectedGrade
    );
  };

  const getGradeLabel = (grade: number): string => {
    return `${grade}年`;
  };

  const getGradeColor = (grade: number): string => {
    switch (grade) {
      case 6: return 'bg-red-100 text-red-800';
      case 5: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionLabel = (position: string | undefined): string => {
    if (!position) return '未定';
    const positionLabels: { [key: string]: string } = {
      'pitcher': 'ピッチャー',
      'catcher': 'キャッチャー',
      'first': 'ファースト',
      'second': 'セカンド',
      'third': 'サード',
      'shortstop': 'ショート',
      'left': 'レフト',
      'center': 'センター',
      'right': 'ライト',
      'utility': 'ユーティリティ'
    };
    return positionLabels[position] || position;
  };

  const filteredPlayers = getFilteredPlayers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
              <p className="text-gray-600">選手名簿を読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-gray-600" />
        <h2 className="text-md font-semibold text-gray-900">選手名簿</h2>
      </div>

      {/* 学年別フィルター */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">学年で絞り込み</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedGrade === 'all'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全て ({filteredPlayers.length})
          </button>
          {getAvailableGrades().map(grade => {
            const count = users.reduce((total, user) => 
              total + user.players.filter(player => player.grade.toString() === grade).length, 0
            );
            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedGrade === grade
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {grade}年 ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 選手一覧 */}
      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">該当する選手がいません</p>
          </div>
        ) : (
          (() => {
            // 学年ごとにグループ化
            const groupedPlayers = filteredPlayers.reduce((groups, player) => {
              const grade = player.grade;
              if (!groups[grade]) {
                groups[grade] = [];
              }
              groups[grade].push(player);
              return groups;
            }, {} as Record<number, Array<Player & { parentName: string }>>);

            // 学年順（高い順）でソート
            const sortedGrades = Object.keys(groupedPlayers)
              .map(Number)
              .sort((a, b) => b - a);

            return sortedGrades.map(grade => (
              <div key={grade} className="space-y-2">
                {/* 学年ヘッダー */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getGradeColor(grade)}`}>
                    {getGradeLabel(grade)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {groupedPlayers[grade].length}名
                  </span>
                </div>
                
                {/* その学年の選手一覧 */}
                <div className="space-y-2">
                  {groupedPlayers[grade]
                    .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
                    .map((player, index) => (
                      <div key={`${player.id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {player.name}
                            </h3>
                            <span className="text-xs text-gray-400">
                              {getPositionLabel(player.position)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ));
          })()
        )}
      </div>
      </div>
    );
};

export default PlayerRosterPage;
