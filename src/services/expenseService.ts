import { supabase } from '../lib/supabase';
import { 
  Expense, 
  ExpenseCategory, 
  ExpenseSubcategory, 
  QuickExpense, 
  ReimbursementSummary, 
  MonthlyExpenseSummary,
  ExpenseFormData,
  ExpenseApprovalData,
  ExpenseStatus
} from '../types';

export class ExpenseService {
  // 費目カテゴリー一覧を取得
  static async getCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  // 費目サブカテゴリー一覧を取得
  static async getSubcategories(categoryId?: string): Promise<ExpenseSubcategory[]> {
    let query = supabase
      .from('expense_subcategories')
      .select('*')
      .order('display_order');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // よく使われる費目一覧を取得
  static async getQuickExpenses(): Promise<QuickExpense[]> {
    const { data, error } = await supabase
      .from('quick_expenses')
      .select(`
        *,
        category:expense_categories(*),
        subcategory:expense_subcategories(*)
      `)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  // 支出一覧を取得
  static async getExpenses(filters?: {
    userId?: string;
    status?: ExpenseStatus;
    month?: string;
    paidAt?: null; // 未払いのみを取得する場合
  }): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*),
        subcategory:expense_subcategories(*),
        user:users!expenses_user_id_fkey(*),
        approver:users!expenses_approved_by_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.month) {
      query = query.gte('expense_date', `${filters.month}-01`)
                   .lt('expense_date', `${filters.month}-32`);
    }

    // 未払いのみを取得する場合
    if (filters?.paidAt === null) {
      query = query.is('paid_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // 支出を登録
  static async createExpense(userId: string, formData: ExpenseFormData, receiptFile?: File): Promise<Expense> {
    let receiptUrl: string | undefined;

    // レシートファイルをアップロード
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    // 支出データを保存
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        expense_date: formData.expenseDate,
        amount: formData.amount,
        category_id: formData.categoryId,
        subcategory_id: formData.subcategoryId,
        description: formData.description,
        receipt_url: receiptUrl,
        status: 'pending'
      })
      .select(`
        *,
        category:expense_categories(*),
        subcategory:expense_subcategories(*),
        user:users!expenses_user_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 支出を承認/却下
  static async approveExpense(expenseId: string, approvalData: ExpenseApprovalData, approverId: string): Promise<Expense> {
    const updateData: any = {
      status: approvalData.status,
      approved_by: approverId,
      approved_at: new Date().toISOString()
    };

    if (approvalData.status === 'rejected' && approvalData.rejectionReason) {
      updateData.rejection_reason = approvalData.rejectionReason;
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .select(`
        *,
        category:expense_categories(*),
        subcategory:expense_subcategories(*),
        user:users!expenses_user_id_fkey(*),
        approver:users!expenses_approved_by_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 支出を支払い済みに更新
  static async markAsPaid(expenseIds: string[], paymentDate: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'paid',
        paid_at: paymentDate
      })
      .in('id', expenseIds);

    if (error) throw error;
  }

  // 立替金集計を取得
  static async getReimbursementSummary(): Promise<ReimbursementSummary[]> {
    const { data, error } = await supabase
      .from('reimbursement_summary')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  // 月別支出集計を取得
  static async getMonthlyExpenseSummary(month?: string): Promise<MonthlyExpenseSummary[]> {
    let query = supabase
      .from('monthly_expense_summary')
      .select('*')
      .order('month', { ascending: false });

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ユーザーの立替金合計を取得
  static async getUserReimbursementTotal(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved']);

    if (error) throw error;
    
    return data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  }

  // 支出統計を取得
  static async getExpenseStats(): Promise<{
    totalPending: number;
    totalApproved: number;
    totalPaid: number;
    totalAmount: number;
  }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('status, amount');

    if (error) throw error;

    const stats = {
      totalPending: 0,
      totalApproved: 0,
      totalPaid: 0,
      totalAmount: 0
    };

    data?.forEach(expense => {
      stats.totalAmount += expense.amount;
      
      switch (expense.status) {
        case 'pending':
          stats.totalPending += expense.amount;
          break;
        case 'approved':
          stats.totalApproved += expense.amount;
          break;
        case 'paid':
          stats.totalPaid += expense.amount;
          break;
      }
    });

    return stats;
  }
}

export const expenseService = ExpenseService;
