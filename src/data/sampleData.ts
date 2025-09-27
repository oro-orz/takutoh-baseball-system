import { Event, User, Admin } from '../types';
import { getStoredData, setStoredData, STORAGE_KEYS } from '../utils/storage';

// サンプルデータ
export const SAMPLE_EVENTS: Event[] = [
  // 現在は2025年なので、過去のイベントは削除
  // 必要に応じて新しいイベントを追加してください
];

export const SAMPLE_USERS: User[] = [
  {
    id: '1',
    pin: '1001',
    name: '田中太郎',
    role: 'parent',
    players: [
      { id: '1-1', name: '田中一郎', hiraganaName: 'いちろう', grade: 6, position: 'ピッチャー' },
      { id: '1-2', name: '田中二郎', hiraganaName: '(た)じろう', grade: 4, position: 'キャッチャー' }
    ],
    defaultCarCapacity: 3,
    defaultEquipmentCar: false,
    defaultUmpire: false
  },
  {
    id: '2',
    pin: '1002',
    name: '佐藤花子',
    role: 'parent',
    players: [
      { id: '2-1', name: '佐藤二郎', hiraganaName: '(さ)じろう', grade: 5, position: 'ファースト' }
    ],
    defaultCarCapacity: 2,
    defaultEquipmentCar: true,
    defaultUmpire: true
  },
  {
    id: '3',
    pin: '1003',
    name: '鈴木次郎',
    role: 'parent',
    players: [
      { id: '3-1', name: '鈴木四郎', hiraganaName: 'しろう', grade: 6, position: 'ショート' },
      { id: '3-2', name: '鈴木五郎', hiraganaName: 'ごろう', grade: 3, position: 'セカンド' }
    ],
    defaultCarCapacity: 4,
    defaultEquipmentCar: false,
    defaultUmpire: false
  }
];

export const SAMPLE_ADMIN: Admin = {
  id: 'admin',
  pin: '9999',
  name: '管理者'
};

// 初期データの設定
export const initializeSampleData = () => {
  // イベントデータ - 空の配列で初期化（過去データをクリア）
  setStoredData(STORAGE_KEYS.EVENTS, []);
  
  // 参加データ - 空の配列で初期化（過去データをクリア）
  setStoredData(STORAGE_KEYS.PARTICIPATIONS, []);
  
  // 試合記録データ - 空の配列で初期化（過去データをクリア）
  setStoredData(STORAGE_KEYS.GAME_RECORDS, []);
  
  // ユーザーデータ
  const existingUsers = getStoredData(STORAGE_KEYS.USERS, []);
  if (existingUsers.length === 0) {
    setStoredData(STORAGE_KEYS.USERS, SAMPLE_USERS);
  }
};
