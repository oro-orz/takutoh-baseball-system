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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">選手名簿</h1>
          </div>
          
          {/* 学年別フィルター */}
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">学年で絞り込み:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="bg-white rounded-lg shadow-sm">
          {filteredPlayers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">該当する選手がいません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPlayers
                .sort((a, b) => {
                  // 学年順（高い順）、次に名前順
                  if (a.grade !== b.grade) {
                    return b.grade - a.grade;
                  }
                  return a.name.localeCompare(b.name, 'ja');
                })
                .map((player, index) => (
                  <div key={`${player.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-semibold text-sm">
                                {player.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {player.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getGradeLabel(player.grade)}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {getPositionLabel(player.position)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 統計情報 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {filteredPlayers.length}
              </div>
              <div className="text-sm text-gray-500">総選手数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(filteredPlayers.map(p => p.grade)).size}
              </div>
              <div className="text-sm text-gray-500">学年数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRosterPage;
