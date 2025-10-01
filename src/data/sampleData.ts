import { Event, User, Admin } from '../types';
import { getStoredData, setStoredData, STORAGE_KEYS } from '../utils/storage';

// サンプルデータ
export const SAMPLE_EVENTS: Event[] = [
  // 現在は2025年なので、過去のイベントは削除
  // 必要に応じて新しいイベントを追加してください
];

// サンプルユーザーは削除（実際のユーザーデータのみ使用）
export const SAMPLE_USERS: User[] = [];

export const SAMPLE_ADMIN: Admin = {
  id: '94253d2e-becf-475e-b88a-608f9d6543fc', // 実際の管理者UUID
  pin: '9999', // 管理者PIN（Supabaseダウン時のフォールバック用）
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
