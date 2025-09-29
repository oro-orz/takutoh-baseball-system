import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Player } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import { userService } from '../services/userService';
import { supabase } from '../services/supabase';
import { User as UserIcon, Plus, Edit, Trash2, Camera } from 'lucide-react';

const MyPage: React.FC = () => {
  const { authState, updateUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const user = authState.user;
  if (!user || !('players' in user)) {
    return <div>ユーザー情報が正しくありません</div>;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleProfileImageUpload = async (playerId: string, file: File) => {
    try {
      // ファイルをSupabaseストレージにアップロード
      const filePath = `profile-images/${playerId}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('画像アップロードエラー:', uploadError);
        return;
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // ユーザーデータを更新
      const updatedPlayers = user.players.map(player => 
        player.id === playerId 
          ? { ...player, profileImageUrl: urlData.publicUrl }
          : player
      );

      const updatedUser = { ...user, players: updatedPlayers };
      
      // Supabaseに保存
      await userService.updateUser(user.id, {
        players: updatedPlayers
      });

      // ローカル状態を更新
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      
      console.log('プロフィール画像をアップロードしました:', urlData.publicUrl);
    } catch (error) {
      console.error('プロフィール画像アップロードに失敗しました:', error);
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

  // usersが読み込まれるまで待つ
  if (users.length === 0) {
    return <div>ユーザー情報の読み込み中...</div>;
  }

  const currentUser = users.find(u => u.id === user.id) || user;

  if (!currentUser) {
    return <div>ユーザー情報が見つかりません</div>;
  }

  const handleSaveUser = async () => {
    try {
      await userService.updateUser(currentUser.id, currentUser);
      
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? currentUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      // フォールバック: LocalStorageに保存
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? currentUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setIsEditing(false);
    }
  };

  const handleAddPlayer = async (newPlayer: Omit<Player, 'id'>) => {
    const player: Player = {
      ...newPlayer,
      id: `${currentUser.id}-${Date.now()}`
    };
    const updatedUser = {
      ...currentUser,
      players: [...currentUser.players, player]
    };
    
    try {
      await userService.updateUser(currentUser.id, updatedUser);
      
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setShowAddPlayer(false);
    } catch (error) {
      console.error('Failed to add player:', error);
      // フォールバック: LocalStorageに保存
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setShowAddPlayer(false);
    }
  };

  const handleEditPlayer = async (playerId: string, updates: Partial<Player>) => {
    const updatedUser = {
      ...currentUser,
      players: currentUser.players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      )
    };
    
    try {
      await userService.updateUser(currentUser.id, updatedUser);
      
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setEditingPlayer(null);
    } catch (error) {
      console.error('Failed to edit player:', error);
      // フォールバック: LocalStorageに保存
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setEditingPlayer(null);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (confirm('この選手を削除しますか？')) {
      const updatedUser = {
        ...currentUser,
        players: currentUser.players.filter(p => p.id !== playerId)
      };
      
      try {
        await userService.updateUser(currentUser.id, updatedUser);
        
        const updatedUsers = users.map(u => 
          u.id === currentUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
      } catch (error) {
        console.error('Failed to delete player:', error);
        // フォールバック: LocalStorageに保存
        const updatedUsers = users.map(u => 
          u.id === currentUser.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ユーザー情報 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">保護者情報</h3>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary"
          >
            {isEditing ? 'キャンセル' : '編集'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お名前
            </label>
            {isEditing ? (
              <input
                type="text"
                value={currentUser.name}
                onChange={(e) => {
                  const updatedUser = { ...currentUser, name: e.target.value };
                  const updatedUsers = users.map(u => 
                    u.id === currentUser.id ? updatedUser : u
                  );
                  setUsers(updatedUsers);
                  // AuthStateも更新してヘッダーに反映
                  updateUser({ name: e.target.value });
                }}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900">{currentUser.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PINコード
            </label>
            <p className="text-gray-900 font-mono">{currentUser.pin}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LINE ID
            </label>
            {isEditing ? (
              <input
                type="text"
                value={currentUser.lineId || ''}
                onChange={(e) => {
                  const updatedUser = { ...currentUser, lineId: e.target.value };
                  const updatedUsers = users.map(u => 
                    u.id === currentUser.id ? updatedUser : u
                  );
                  setUsers(updatedUsers);
                  // AuthStateも更新
                  updateUser({ lineId: e.target.value });
                }}
                className="input-field"
                placeholder="例：tanaka_taro"
              />
            ) : (
              <p className="text-gray-900">{currentUser.lineId || '未設定'}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              LINEでの連絡に使用します（任意）
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveUser}
              className="btn-primary"
            >
              保存
            </button>
          </div>
        )}
      </div>

      {/* 選手一覧 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">登録選手</h3>
          </div>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>選手追加</span>
          </button>
        </div>

        <div className="space-y-4">
          {currentUser.players.map((player) => (
            <div key={player.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* プロフィール画像 */}
                  <div className="relative">
                    {player.profileImageUrl ? (
                      <img 
                        src={player.profileImageUrl} 
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {/* 画像アップロードボタン */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleProfileImageUpload(player.id, file);
                        }
                      }}
                      className="hidden"
                      id={`profile-upload-${player.id}`}
                    />
                    <label
                      htmlFor={`profile-upload-${player.id}`}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
                      title="プロフィール画像を変更"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </label>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{player.name}</h4>
                    {player.hiraganaName && (
                      <p className="text-sm text-blue-600 font-medium">
                        {player.hiraganaName}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {player.grade}年生 {player.position && `・${player.position}`}
                    </p>
                  </div>
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

          {currentUser.players.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>登録された選手がいません</p>
            </div>
          )}
        </div>
      </div>


      {/* 選手追加モーダル */}
      {showAddPlayer && (
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
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {player ? '選手編集' : '選手追加'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選手名（漢字）
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ひらがな名
            </label>
            <input
              type="text"
              value={formData.hiraganaName}
              onChange={(e) => setFormData({ ...formData, hiraganaName: e.target.value })}
              className="input-field"
              placeholder="例：すずき いちろう"
            />
            <p className="text-xs text-gray-500 mt-1">
              フルネーム形式で入力してください（例：すずき いちろう）。同姓の選手がいる場合は自動で（す）いちろう形式で表示されます。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ポジション（任意）
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="input-field"
              placeholder="例: ピッチャー、キャッチャー"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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

export default MyPage;
