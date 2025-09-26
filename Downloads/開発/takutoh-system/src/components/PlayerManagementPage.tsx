import React, { useState, useEffect } from 'react';
import { User, Player } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import { UserPlus, Edit, Trash2, Users } from 'lucide-react';
import { showSuccess, showError, handleAsyncError } from '../utils/errorHandler';

// 選手フォームコンポーネント
interface PlayerFormProps {
  player?: Player;
  onSubmit: (player: Omit<Player, 'id'>) => void;
  onCancel: () => void;
}

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
              ふりがな
            </label>
            <input
              type="text"
              value={formData.hiraganaName}
              onChange={(e) => setFormData({ ...formData, hiraganaName: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              学年
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
              className="input-field"
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
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const loadedUsers = getUsers();
    setUsers(loadedUsers);
    if (loadedUsers.length > 0) {
      setSelectedUserId(loadedUsers[0].id);
    }
  }, []);

  const selectedUser = users.find(u => u.id === selectedUserId);

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
      const updatedUsers = users.map(u =>
        u.id === selectedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      return true;
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
      const updatedUsers = users.map(u =>
        u.id === selectedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      return true;
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
        const updatedUsers = users.map(u =>
          u.id === selectedUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        return true;
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
          onClick={() => setShowAddPlayer(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>選手追加</span>
        </button>
      </div>

      {/* 保護者選択 */}
      <div className="card">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">保護者選択</h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
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
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              {selectedUser.name}さんの選手一覧
            </h4>
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
