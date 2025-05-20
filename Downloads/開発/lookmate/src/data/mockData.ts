import { MatchingItem, BankAccount } from '../types';

export const mockMatchings: MatchingItem[] = [
  {
    id: '1',
    companyName: '化粧品A社',
    status: 'approved',
    amount: 50000,
    date: '2025-01-15',
    description: '化粧品新商品のSNSプロモーション。1ヶ月間の継続的な宣伝活動。'
  },
  {
    id: '2',
    companyName: 'テクノロジーB社',
    status: 'pending',
    amount: 35000,
    date: '2025-01-18',
    description: '新型スマートウォッチのレビュー投稿。製品紹介動画の作成依頼。'
  },
  {
    id: '3',
    companyName: '食品C社',
    status: 'rejected',
    amount: 20000,
    date: '2025-01-10',
    description: 'オーガニック食品ブランドの宣伝。ライフスタイル投稿の作成依頼。'
  },
  {
    id: '4',
    companyName: 'アパレルD社',
    status: 'approved',
    amount: 45000,
    date: '2025-01-05',
    description: 'アパレルブランドの季節コレクション紹介。ファッションコーディネート提案。'
  },
  {
    id: '5',
    companyName: 'フィットネスE社',
    status: 'pending',
    amount: 30000,
    date: '2025-01-20',
    description: 'ホームトレーニング器具の紹介。エクササイズルーティンのデモンストレーション動画作成。'
  }
];

export const mockBankAccount: BankAccount = {
  bankName: '',
  branchName: '',
  accountType: 'ordinary',
  accountNumber: '',
  accountHolder: '',
  taxId: ''
};