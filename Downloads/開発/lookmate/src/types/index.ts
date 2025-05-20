export interface MatchingItem {
  id: string;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  date: string;
  description?: string;
  logoUrl?: string;
}

export interface BankAccount {
  bankName: string;
  branchName: string;
  accountType: 'ordinary' | 'checking';
  accountNumber: string;
  accountHolder: string;
  taxId?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

export interface MatchingUpdateProps {
  matchingId: string;
  status: 'approved' | 'rejected';
  message?: string;
}

export interface MonthlyEarnings {
  year: number;
  month: number;
  matchings: MatchingItem[];
  totalAmount: number;
}

export interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  totalAmount: number;
  bankAccount: BankAccount;
}