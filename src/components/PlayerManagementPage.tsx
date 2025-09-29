import React, { useState, useEffect } from 'react';
import { User, Player } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import { userService } from '../services/userService';
import { UserPlus, Edit, Trash2, Users, Plus, X } from 'lucide-react';
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
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
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
        players: u.players || [],
        defaultCarCapacity: 0,
        defaultEquipmentCar: false,
        defaultUmpire: false
      }));
      setUsers(convertedUsers);
      if (convertedUsers.length > 0) {
        setSelectedUserId(convertedUsers[0].id);
      }
    } catch (error) {
      console.error('ユーザー読み込みに失敗しました:', error);
      // フォールバック: LocalStorageから読み込み
      const loadedUsers = getUsers();
      setUsers(loadedUsers);
      if (loadedUsers.length > 0) {
        setSelectedUserId(loadedUsers[0].id);
      }
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

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
        
        // 新しく追加したユーザーを選択
        setSelectedUserId(createdUser.id);
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
        setSelectedUserId(user.id);
        return true;
      }
    }, '新入部員の追加に失敗しました');

    if (result) {
      showSuccess('新入部員を追加しました');
      setShowAddUser(false);
    }
  };

  const handleAddPlayer = async (newPlayer: Omit<Player, 'id'>) => {
    if (!selectedUser) return;

    const result = await handleAsyncError(async () => {
      const player: Player = {
        ...newPlayer,
        id: `${selectedUser.id}-${Date.now()}`
      };
      const updatedUser = {
        ...selectedUser,
        players: [...selectedUser.players, player]
      };
      
      try {
        await userService.updateUser(selectedUser.id, updatedUser);
        
        const updatedUsers = users.map(u =>
          u.id === selectedUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      } catch (error) {
        console.error('選手追加に失敗しました:', error);
        // フォールバック: LocalStorageに保存
        const updatedUsers = users.map(u =>
          u.id === selectedUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      }
    }, '選手の追加に失敗しました');

    if (result) {
      showSuccess('選手を追加しました');
      setShowAddPlayer(false);
    }
  };

  const handleEditPlayer = async (playerId: string, updates: Partial<Player>) => {
    if (!selectedUser) return;

    const result = await handleAsyncError(async () => {
      const updatedUser = {
        ...selectedUser,
        players: selectedUser.players.map(p =>
          p.id === playerId ? { ...p, ...updates } : p
        )
      };
      
      try {
        await userService.updateUser(selectedUser.id, updatedUser);
        
        const updatedUsers = users.map(u =>
          u.id === selectedUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
      } catch (error) {
        console.error('選手編集に失敗しました:', error);
        // フォールバック: LocalStorageに保存
        const updatedUsers = users.map(u =>
          u.id === selectedUser.id ? updatedUser : u
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

  const handleDeletePlayer = async (playerId: string) => {
    if (!selectedUser) return;

    if (confirm('この選手を削除しますか？')) {
      const result = await handleAsyncError(async () => {
        const updatedUser = {
          ...selectedUser,
          players: selectedUser.players.filter(p => p.id !== playerId)
        };
        
        try {
          await userService.updateUser(selectedUser.id, updatedUser);
          
          const updatedUsers = users.map(u =>
            u.id === selectedUser.id ? updatedUser : u
          );
          setUsers(updatedUsers);
          saveUsers(updatedUsers);
          return true;
        } catch (error) {
          console.error('選手削除に失敗しました:', error);
          // フォールバック: LocalStorageに保存
          const updatedUsers = users.map(u =>
            u.id === selectedUser.id ? updatedUser : u
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
          onClick={() => {
            setSelectedGrade('all');
            setSelectedUserId(''); // 選手一覧を非表示
          }}
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
              onClick={() => {
                setSelectedGrade(grade);
                setSelectedUserId(''); // 選手一覧を非表示
              }}
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

      {/* 保護者選択 */}
      <div className="card">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">保護者選択</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {getFilteredUsers().map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedUserId === user.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-600 mt-1">
                PIN: {user.pin}
              </div>
              <div className="text-xs text-gray-500">
                選手数: {user.players.length}名
              </div>
              <div className="text-xs text-gray-500 mt-1">
                学年: {user.players.map(p => `${p.grade}年`).join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                {selectedUser.name}さんの選手一覧
              </h4>
            </div>
            <button
              onClick={() => setShowAddPlayer(true)}
              className="btn-secondary flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>選手追加</span>
            </button>
          </div>

          <div className="space-y-3">
            {selectedUser.players.map((player) => (
              <div key={player.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{player.name}</h5>
                    {player.hiraganaName && (
                      <p className="text-xs text-blue-600 font-medium">
                        {player.hiraganaName}
                      </p>
                    )}
                    <p className="text-xs text-gray-600">
                      {player.grade}年生 {player.position && `・${player.position}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPlayer(player)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {selectedUser.players.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">登録された選手がいません</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 新入部員追加モーダル */}
      {showAddUser && (
        <NewUserForm
          onSubmit={handleAddUser}
          onCancel={() => setShowAddUser(false)}
          existingPins={users.map(u => u.pin)}
        />
      )}

      {/* 選手追加モーダル */}
      {showAddPlayer && selectedUser && (
        <PlayerForm
          onSubmit={handleAddPlayer}
          onCancel={() => setShowAddPlayer(false)}
        />
      )}

      {/* 選手編集モーダル */}
      {editingPlayer && (
        <PlayerForm
          player={editingPlayer}
          onSubmit={(updates) => handleEditPlayer(editingPlayer.id, updates)}
          onCancel={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
};

export default PlayerManagementPage;
