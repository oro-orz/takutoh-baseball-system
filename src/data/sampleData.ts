import { Event, User, Admin } from '../types';
import { getStoredData, setStoredData, STORAGE_KEYS } from '../utils/storage';

// サンプルデータ
export const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: '平日練習',
    type: 'practice',
    date: '2024-01-15',
    startTime: '18:00',
    endTime: '20:00',
    location: '託麻東小学校グラウンド',
    description: '基本練習とバッティング練習',
    items: ['グローブ', 'バット', 'ヘルメット', '水筒'],
    parking: '校舎横駐車場をご利用ください'
  },
  {
    id: '2',
    title: '練習試合 vs 城東少年野球',
    type: 'practice_game',
    date: '2024-01-20',
    startTime: '09:00',
    endTime: '12:00',
    location: '託麻東小学校グラウンド',
    opponent: '城東少年野球',
    description: '練習試合を行います',
    items: ['ユニフォーム', 'グローブ', 'バット', 'ヘルメット', '水筒'],
    parking: '校舎横駐車場をご利用ください'
  },
        {
          id: '3',
          title: '公式戦 第2戦',
          type: 'official_game',
          date: '2024-01-27',
          startTime: '10:00',
          endTime: '15:00',
          location: '城南中学校グラウンド',
          opponent: '城南少年野球',
          description: '公式戦第2戦',
          items: ['ユニフォーム', 'グローブ', 'バット', 'ヘルメット', '水筒', 'お弁当'],
          parking: '学校駐車場（台数制限あり）'
        },
  {
    id: '4',
    title: '公式戦 第1戦',
    type: 'official_game',
    date: '2024-02-03',
    startTime: '09:00',
    endTime: '16:00',
    location: '熊本市総合運動場',
    opponent: '桜井少年野球',
    description: '公式戦第1戦',
    items: ['ユニフォーム', 'グローブ', 'バット', 'ヘルメット', '水筒', 'お弁当'],
    parking: '総合運動場駐車場'
  },
  {
    id: '5',
    title: '焼肉会',
    type: 'other',
    date: '2024-02-10',
    startTime: '18:00',
    endTime: '21:00',
    location: '焼肉屋 牛角',
    description: 'チーム懇親会',
    items: ['参加費 3,000円'],
    parking: '店舗駐車場'
  }
];

export const SAMPLE_USERS: User[] = [
  {
    id: '1',
    pin: '1001',
    name: '田中太郎',
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
  // イベントデータ
  const existingEvents = getStoredData(STORAGE_KEYS.EVENTS, []);
  if (existingEvents.length === 0) {
    setStoredData(STORAGE_KEYS.EVENTS, SAMPLE_EVENTS);
  }
  
  // ユーザーデータ
  const existingUsers = getStoredData(STORAGE_KEYS.USERS, []);
  if (existingUsers.length === 0) {
    setStoredData(STORAGE_KEYS.USERS, SAMPLE_USERS);
  }
};
