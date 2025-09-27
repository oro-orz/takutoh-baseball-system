// イベントタイプ
export type EventType = 'practice' | 'practice_game' | 'official_game' | 'other' | 'cancelled' | 'postponed';

// 参加部員の選択肢
export type ParticipantGroup = 'all' | '6th' | '5th' | '4th' | '4th_below' | '3rd' | '3rd_below';

// 服装の選択肢
export type ClothingType = 'official_uniform' | 'second_uniform' | 'practice_clothes' | 'takutoh_t' | 'free';

// 昼食の選択肢
export type LunchType = 'required' | 'not_required';

// イベント
export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  opponent?: string; // 対戦相手
  description?: string;
  items?: string[]; // 持ち物
  parking?: string; // 駐車場情報
  files?: EventFile[];
  // 新しい項目
  eventName?: string; // 大会名
  participants?: ParticipantGroup[]; // 参加部員
  meetingTime?: string; // 集合時間
  schedule?: string; // 当日予定
  clothing?: ClothingType[]; // 服装
  preparation?: string; // 準備物
  lunch?: LunchType; // 昼食
  teaGarbageDuty?: string; // お茶・ゴミ当番
  equipmentBenchSupport?: string; // 道具車・ベンチサポート
  reference?: string; // 参考事項
  cancellationReason?: string; // 中止・延期理由
}

// イベントファイル
export interface EventFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string; // ファイルタイプを必須に
  uploadedAt?: string;
}

// 選手
export interface Player {
  id: string;
  name: string;
  hiraganaName?: string; // ひらがな名
  grade: number; // 学年
  position?: string; // ポジション
}

// 参加状況
export interface Participation {
  eventId: string;
  playerId: string;
  status: 'attending' | 'not_attending' | 'undecided';
  parentParticipation: 'attending' | 'not_attending' | 'undecided' | string;
  carCapacity?: number; // 乗合い可能人数
  equipmentCar: boolean; // 道具車担当
  umpire: boolean; // 審判担当
  transport?: 'can_transport' | 'cannot_transport'; // 送迎可否
  comment?: string; // コメント
}

// ユーザー（保護者）
export interface User {
  id: string;
  pin: string;
  name: string;
  role: 'admin' | 'coach' | 'player' | 'parent';
  lineId?: string; // LINE ID
  players: Player[];
  defaultCarCapacity?: number;
  defaultEquipmentCar: boolean;
  defaultUmpire: boolean;
}

// 管理者
export interface Admin {
  id: string;
  pin: string;
  name: string;
}

// 認証状態
export interface AuthState {
  user: User | Admin | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// 参加状況の集計
export interface ParticipationSummary {
  totalPlayers: number;
  attendingPlayers: number;
  notAttendingPlayers: number;
  undecidedPlayers: number;
  attendingParents: number;
  notAttendingParents: number;
  undecidedParents: number;
  carCount: number;
  equipmentCarCount: number;
  umpireCount: number;
}

// 先発オーダー
export interface StartingLineup {
  playerId: string;
  position: string;
  battingOrder: number;
}

// イニング別スコア
export interface InningScore {
  inning: number;
  our: number;
  opponent: number;
}

// スコアボード
export interface Scoreboard {
  innings: InningScore[];
  total: {
    our: number;
    opponent: number;
  };
}

// 試合記録
export interface GameRecord {
  id: string;
  eventId: string;
  result: 'win' | 'lose' | 'draw';
  score: {
    our: number;
    opponent: number;
  };
  files: string[];
  opponent?: string; // 対戦相手
  details?: string; // 詳細
  startingLineup?: StartingLineup[];
  scoreboard?: Scoreboard;
}
