import { Event, User, Participation, GameRecord } from '../types';

// LocalStorage のキー
export const STORAGE_KEYS = {
  AUTH: 'takutoh_auth',
  EVENTS: 'takutoh_events',
  USERS: 'takutoh_users',
  PARTICIPATIONS: 'takutoh_participations',
  GAME_RECORDS: 'takutoh_game_records'
} as const;

// データの取得
export const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// データの保存
export const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

// イベントデータの管理
export const getEvents = (): Event[] => {
  return getStoredData(STORAGE_KEYS.EVENTS, []);
};

export const saveEvents = (events: Event[]): void => {
  setStoredData(STORAGE_KEYS.EVENTS, events);
};

// ユーザーデータの管理
export const getUsers = (): User[] => {
  return getStoredData(STORAGE_KEYS.USERS, []);
};

export const saveUsers = (users: User[]): void => {
  setStoredData(STORAGE_KEYS.USERS, users);
};

// 参加状況データの管理
export const getParticipations = (): Participation[] => {
  return getStoredData(STORAGE_KEYS.PARTICIPATIONS, []);
};

export const saveParticipations = (participations: Participation[]): void => {
  setStoredData(STORAGE_KEYS.PARTICIPATIONS, participations);
};

// 試合記録データの管理
export const getGameRecords = (): GameRecord[] => {
  return getStoredData(STORAGE_KEYS.GAME_RECORDS, []);
};

export const saveGameRecords = (records: GameRecord[]): void => {
  setStoredData(STORAGE_KEYS.GAME_RECORDS, records);
};

// 認証データの管理
export const getAuthData = () => {
  return getStoredData(STORAGE_KEYS.AUTH, null);
};

export const saveAuthData = (authData: any): void => {
  setStoredData(STORAGE_KEYS.AUTH, authData);
};

export const clearAuthData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
};
