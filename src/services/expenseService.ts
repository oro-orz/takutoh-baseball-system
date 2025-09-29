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
    
    // データをアプリケーションの型にマッピング
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      userId: item.user_id,
      expenseDate: item.expense_date,
      categoryId: item.category_id,
      subcategoryId: item.subcategory_id,
      receiptUrl: item.receipt_url,
      rejectionReason: item.rejection_reason,
      approvedBy: item.approved_by,
      approvedAt: item.approved_at,
      paidAt: item.paid_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return mappedData;
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
      .from('expenses')
      .select(`
        user_id,
        user:users!expenses_user_id_fkey(id, name),
        amount,
        status,
        paid_at,
        created_at
      `)
      .in('status', ['pending', 'approved'])  // pending と approved の両方を含む
      .is('paid_at', null);  // paid_at が null（支払済みでない）

    if (error) throw error;

    // ユーザー別に集計
    const summaryMap = new Map<string, ReimbursementSummary>();
    
    data?.forEach((expense: any) => {
      const userId = expense.user_id;
      const amount = expense.amount || 0;
      
      
      if (!summaryMap.has(userId)) {
        summaryMap.set(userId, {
          userId,
          userName: expense.user?.name || '不明なユーザー',
          totalAmount: 0,
          expenseCount: 0,
          lastExpenseDate: expense.created_at
        });
      }
      
      const summary = summaryMap.get(userId)!;
      summary.totalAmount += amount;
      summary.expenseCount += 1;
      
      if (expense.created_at > (summary.lastExpenseDate || '')) {
        summary.lastExpenseDate = expense.created_at;
      }
    });

    return Array.from(summaryMap.values());
  }

  // 月別支出集計を取得
  static async getMonthlyExpenseSummary(month?: string): Promise<MonthlyExpenseSummary[]> {
    let query = supabase
      .from('expenses')
      .select(`
        expense_date,
        amount,
        category:expense_categories(name),
        subcategory:expense_subcategories(name)
      `)
      .in('status', ['approved', 'paid'])  // 承認済みと支払済みを両方含む
      .order('expense_date', { ascending: false });

    if (month) {
      const startDate = `${month}-01`;
      // 月末日を正しく計算
      const year = parseInt(month.substring(0, 4));
      const monthNum = parseInt(month.substring(5, 7));
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${month}-${lastDay.toString().padStart(2, '0')}`;
      query = query.gte('expense_date', startDate).lte('expense_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // 月別・カテゴリ別に集計
    const summaryMap = new Map<string, MonthlyExpenseSummary>();
    
    data?.forEach((expense: any) => {
      
      const expenseMonth = expense.expense_date.substring(0, 7);
      const categoryName = expense.category?.name || '未分類';
      const subcategoryName = expense.subcategory?.name || '未分類';
      const amount = expense.amount || 0;
      
      const key = `${expenseMonth}-${categoryName}-${subcategoryName}`;
      
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          month: expenseMonth,
          categoryId: '',
          categoryName,
          subcategoryId: '',
          subcategoryName,
          expenseCount: 0,
          totalAmount: 0
        });
      }
      
      const summary = summaryMap.get(key)!;
      summary.expenseCount += 1;
      summary.totalAmount += amount;
    });

    return Array.from(summaryMap.values());
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
      const amount = expense.amount || 0;
      stats.totalAmount += amount;
      
      
      switch (expense.status) {
        case 'pending':
          stats.totalPending += amount;
          break;
        case 'approved':
          stats.totalApproved += amount;
          break;
        case 'paid':
          stats.totalPaid += amount;
          break;
      }
    });

    return stats;
  }

  // 単一の支出を支払い済みにマーク
  static async markSingleAsPaid(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', expenseId);

    if (error) throw error;
  }
}

export const expenseService = ExpenseService;
