import React, { useState, useEffect } from 'react';
import { User, Player } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import { userService } from '../services/userService';
import { Edit, Trash2, Users, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { showSuccess, showError, handleAsyncError } from '../utils/errorHandler';

// 選手フォームコンポーネント
interface PlayerFormProps {
  player?: Player;
  onSubmit: (player: Omit<Player, 'id'>) => void;
  onCancel: () => void;
}

// 新入部員（保護者）フォームコンポーネント
interface NewUserFormProps {
  onSubmit: (user: Omit<User, 'id'>) => void;
  onCancel: () => void;
  existingPins: string[];
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onSubmit, onCancel, existingPins }) => {
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    lineId: ''
  });

  // PIN自動生成（1001-9998の範囲で重複チェック）
  const generatePin = () => {
    let pin;
    let attempts = 0;
    do {
      pin = Math.floor(Math.random() * 8998) + 1001; // 1001-9998
      attempts++;
      if (attempts > 100) {
        // 100回試行しても重複しない場合は手動入力に誘導
        return '';
      }
    } while (existingPins.includes(pin.toString()));
    return pin.toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('保護者名を入力してください');
      return;
    }
    
    if (!formData.pin.trim()) {
      showError('PINコードを入力してください');
      return;
    }

    if (formData.pin.length !== 4) {
      showError('PINコードは4桁で入力してください');
      return;
    }

    const newUser: Omit<User, 'id'> = {
      name: formData.name.trim(),
      pin: formData.pin.trim(),
      role: 'parent',
      lineId: formData.lineId.trim(),
      players: [],
      defaultCarCapacity: 0,
      defaultEquipmentCar: false,
      defaultUmpire: false
    };

    onSubmit(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">新入部員追加</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                保護者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="例：田中太郎"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PINコード <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  className="input-field flex-1 text-center text-lg tracking-widest"
                  placeholder="0000"
                  maxLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pin: generatePin() })}
                  className="btn-secondary px-3"
                >
                  自動生成
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                4桁の数字で入力してください（1001-9998）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LINE ID
              </label>
              <input
                type="text"
                value={formData.lineId}
                onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                className="input-field"
                placeholder="例：tanaka_taro"
              />
              <p className="text-xs text-gray-500 mt-1">
                LINEでの連絡に使用します（任意）
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary flex-1"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                追加
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PlayerForm: React.FC<PlayerFormProps> = ({ player, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    hiraganaName: player?.hiraganaName || '',
    grade: player?.grade || 1,
    position: player?.position || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('選手名を入力してください');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h3 className="text-md font-semibold text-gray-900 mb-3">
          {player ? '選手情報編集' : '選手追加'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              選手名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ひらがな名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hiraganaName}
              onChange={(e) => setFormData({ ...formData, hiraganaName: e.target.value })}
              className="input-field"
              placeholder="例：すずき いちろう"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              フルネーム形式で入力してください（例：すずき いちろう）
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              学年 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
              className="input-field"
              required
            >
              {[1, 2, 3, 4, 5, 6].map(grade => (
                <option key={grade} value={grade}>{grade}年生</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ポジション
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="input-field"
              placeholder="例: ピッチャー、キャッチャー"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {player ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlayerManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string>('');
  const [showAddPlayer, setShowAddPlayer] = useState<{ userId: string; userName: string } | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<{ userId: string; player: Player } | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('all'); // 学年フィルター

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const loadedUsers = await userService.getUsers();
      // Supabaseのデータをアプリケーションの型に変換
      const convertedUsers: User[] = loadedUsers.map(u => ({
        id: u.id,
        pin: u.pin,
        name: u.name,
        role: u.role as 'admin' | 'coach' | 'player' | 'parent',
        lineId: u.lineId,
        players: u.players || [],
        defaultCarCapacity: u.defaultCarCapacity || 0,
        defaultEquipmentCar: u.defaultEquipmentCar || false,
        defaultUmpire: u.defaultUmpire || false
      }));
      setUsers(convertedUsers);
    } catch (error) {
      console.error('ユーザー読み込みに失敗しました:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedUsers = getUsers();
      setUsers(loadedUsers);
    }
  };

  // 学年別フィルター機能
  const getFilteredUsers = () => {
    if (selectedGrade === 'all') {
      return users;
    }

    return users.filter(user => {
      // この保護者の選手が選択された学年を含むかチェック
      return user.players.some(player => player.grade.toString() === selectedGrade);
    });
  };

  const getAvailableGrades = () => {
    const grades = new Set<string>();
    users.forEach(user => {
      user.players.forEach(player => {
        grades.add(player.grade.toString());
      });
    });
    return Array.from(grades).sort((a, b) => parseInt(b) - parseInt(a)); // 6年→1年の順
  };

  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    const result = await handleAsyncError(async () => {
      // PIN重複チェック
      const existingPin = users.find(u => u.pin === newUser.pin);
      if (existingPin) {
        showError('このPINコードは既に使用されています');
        return false;
      }

      try {
        const createdUser = await userService.createUser(newUser);
        
        const updatedUsers = [...users, createdUser];
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      } catch (error) {
        console.error('ユーザー追加に失敗しました:', error);
        // フォールバック: LocalStorageに保存
        const user: User = {
          ...newUser,
          id: `user-${Date.now()}`
        };
        const updatedUsers = [...users, user];
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      }
    }, '新入部員の追加に失敗しました');

    if (result) {
      showSuccess('新入部員を追加しました');
      setShowAddUser(false);
    }
  };

  const handleAddPlayer = async (newPlayer: Omit<Player, 'id'>) => {
    if (!showAddPlayer) return;
    
    const targetUser = users.find(u => u.id === showAddPlayer.userId);
    if (!targetUser) return;

    const result = await handleAsyncError(async () => {
      const player: Player = {
        ...newPlayer,
        id: `${targetUser.id}-${Date.now()}`
      };
      const updatedUser = {
        ...targetUser,
        players: [...targetUser.players, player]
      };
      
      try {
        await userService.updateUser(targetUser.id, updatedUser);
        
        const updatedUsers = users.map(u =>
          u.id === targetUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      } catch (error) {
        console.error('選手追加に失敗しました:', error);
        // フォールバック: LocalStorageに保存
        const updatedUsers = users.map(u =>
          u.id === targetUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      }
    }, '選手の追加に失敗しました');

    if (result) {
      showSuccess('選手を追加しました');
      setShowAddPlayer(null);
    }
  };

  const handleEditPlayer = async (playerId: string, updates: Partial<Player>) => {
    if (!editingPlayer) return;
    
    const targetUser = users.find(u => u.id === editingPlayer.userId);
    if (!targetUser) return;

    const result = await handleAsyncError(async () => {
      const updatedUser = {
        ...targetUser,
        players: targetUser.players.map(p =>
          p.id === playerId ? { ...p, ...updates } : p
        )
      };
      
      try {
        await userService.updateUser(targetUser.id, updatedUser);
        
        const updatedUsers = users.map(u =>
          u.id === targetUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      } catch (error) {
        console.error('選手編集に失敗しました:', error);
        // フォールバック: LocalStorageに保存
        const updatedUsers = users.map(u =>
          u.id === targetUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      }
    }, '選手の更新に失敗しました');

    if (result) {
      showSuccess('選手情報を更新しました');
      setEditingPlayer(null);
    }
  };

  const handleDeletePlayer = async (userId: string, playerId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (confirm('この選手を削除しますか？')) {
      const result = await handleAsyncError(async () => {
        const updatedUser = {
          ...targetUser,
          players: targetUser.players.filter(p => p.id !== playerId)
        };
        
        try {
          await userService.updateUser(targetUser.id, updatedUser);
          
          const updatedUsers = users.map(u =>
            u.id === targetUser.id ? updatedUser : u
          );
          setUsers(updatedUsers);
          saveUsers(updatedUsers);
          return true;
        } catch (error) {
          console.error('選手削除に失敗しました:', error);
          // フォールバック: LocalStorageに保存
          const updatedUsers = users.map(u =>
            u.id === targetUser.id ? updatedUser : u
          );
          setUsers(updatedUsers);
          saveUsers(updatedUsers);
          return true;
        }
      }, '選手の削除に失敗しました');

      if (result) {
        showSuccess('選手を削除しました');
      }
    }
  };

  // ユーザーをソート（フィルターなしの場合はPIN順、フィルターありの場合は学年別）
  const getGroupedAndSortedUsers = () => {
    const filtered = getFilteredUsers();
    
    if (selectedGrade === 'all') {
      // 全て表示の場合: PIN順でソート
      const sortedUsers = [...filtered].sort((a, b) => a.pin.localeCompare(b.pin));
      return [{ grade: null, users: sortedUsers }];
    } else {
      // 学年フィルターありの場合: その学年の選手を持つユーザーのみ、学年別にグループ化
      const groupedByGrade: { [grade: number]: User[] } = {};
      
      filtered.forEach(user => {
        user.players.forEach(player => {
          if (player.grade.toString() === selectedGrade) {
            if (!groupedByGrade[player.grade]) {
              groupedByGrade[player.grade] = [];
            }
            // このユーザーがまだこの学年グループに追加されていない場合のみ追加
            if (!groupedByGrade[player.grade].some(u => u.id === user.id)) {
              groupedByGrade[player.grade].push(user);
            }
          }
        });
      });
      
      // 学年降順でソート（6年→1年）
      const sortedGrades = Object.keys(groupedByGrade)
        .map(Number)
        .sort((a, b) => b - a);
      
      const result: { grade: number | null; users: User[] }[] = [];
      
      sortedGrades.forEach(grade => {
        // 各学年内でユーザーを選手IDでソート
        const sortedUsers = groupedByGrade[grade].sort((a, b) => {
          const aPlayer = a.players.find(p => p.grade === grade);
          const bPlayer = b.players.find(p => p.grade === grade);
          if (!aPlayer || !bPlayer) return 0;
          return aPlayer.id.localeCompare(bPlayer.id);
        });
        
        result.push({ grade, users: sortedUsers });
      });
      
      return result;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-gray-900">選手管理</h3>
        <button
          onClick={() => setShowAddUser(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新入部員追加</span>
        </button>
      </div>

      {/* 学年別フィルター */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGrade('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selectedGrade === 'all'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全て ({users.length})
        </button>
        {getAvailableGrades().map(grade => {
          const count = users.filter(user => 
            user.players.some(player => player.grade.toString() === grade)
          ).length;
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

      {/* ユーザー一覧（アコーディオン） */}
      <div className="space-y-2">
        {getGroupedAndSortedUsers().map(({ grade, users: gradeUsers }) => (
          <div key={grade !== null ? grade : 'all'}>
            {grade !== null && (
              <h4 className="text-sm font-semibold text-gray-700 mb-2 px-2">
                {grade}年生
              </h4>
            )}
            <div className="space-y-2">
              {gradeUsers.map(user => {
                const isExpanded = expandedUserId === user.id;
                // フィルターありの場合はその学年のみ、なしの場合は全選手
                const userPlayers = grade !== null 
                  ? user.players.filter(p => p.grade === grade).sort((a, b) => a.id.localeCompare(b.id))
                  : user.players.sort((a, b) => a.id.localeCompare(b.id));
                const playerGrades = [...new Set(user.players.map(p => p.grade))].sort((a, b) => b - a);
                
                return (
                  <div key={user.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* ユーザーカード */}
                    <button
                      onClick={() => setExpandedUserId(isExpanded ? '' : user.id)}
                      className="w-full p-3 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                            <span className="text-xs text-gray-500">PIN: {user.pin}</span>
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            {user.lineId && (
                              <span className="text-xs text-blue-600">LINE: {user.lineId}</span>
                            )}
                            <span className="text-xs text-gray-600">選手: {user.players.length}名</span>
                            <span className="text-xs text-gray-600">
                              学年: {playerGrades.map(g => `${g}年`).join(', ')}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>

                    {/* 選手一覧（アコーディオン） */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">選手一覧</span>
                          <button
                            onClick={() => setShowAddPlayer({ userId: user.id, userName: user.name })}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>選手追加</span>
                          </button>
                        </div>
                        
                        {userPlayers.length > 0 ? (
                          userPlayers.map(player => (
                            <div key={player.id} className="bg-white rounded-lg p-2 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">{player.name}</span>
                                    {player.hiraganaName && (
                                      <span className="text-xs text-blue-600">({player.hiraganaName})</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    {player.grade}年 ・ ID: {player.id} {player.position && `・${player.position}`}
                                  </div>
                                </div>
                                <div className="flex space-x-1 flex-shrink-0 ml-2">
                                  <button
                                    onClick={() => setEditingPlayer({ userId: user.id, player })}
                                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(user.id, player.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-400">
                            <p className="text-xs">この学年の選手はいません</p>
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
        
        {getFilteredUsers().length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">ユーザーが登録されていません</p>
          </div>
        )}
      </div>

      {/* 新入部員追加モーダル */}
      {showAddUser && (
        <NewUserForm
          onSubmit={handleAddUser}
          onCancel={() => setShowAddUser(false)}
          existingPins={users.map(u => u.pin)}
        />
      )}

      {/* 選手追加モーダル */}
      {showAddPlayer && (
        <PlayerForm
          onSubmit={handleAddPlayer}
          onCancel={() => setShowAddPlayer(null)}
        />
      )}

      {/* 選手編集モーダル */}
      {editingPlayer && (
        <PlayerForm
          player={editingPlayer.player}
          onSubmit={(updates) => handleEditPlayer(editingPlayer.player.id, updates)}
          onCancel={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
};

export default PlayerManagementPage;
