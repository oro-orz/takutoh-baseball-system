import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, Calendar, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Payment {
  id: string;
  influencer_id: string;
  amount: number;
  matching_date: string;
  due_date: string;
  invoice_number: string | null;
  created_at: string;
  influencer_name: string;
}

const PaymentManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          influencer_id,
          amount,
          matching_date,
          due_date,
          invoice_number,
          created_at,
          profiles:influencer_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPayments = data.map(payment => ({
        ...payment,
        influencer_name: payment.profiles.full_name,
      }));

      setPayments(formattedPayments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('支払いデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (paymentId: string) => {
    try {
      setIsGeneratingInvoice(paymentId);
      setError(null);

      // 請求書番号の生成（例：INV-2024-001）
      const date = new Date();
      const year = date.getFullYear();
      const { count } = await supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`);

      const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

      // 請求書番号の更新
      const { error: updateError } = await supabase
        .from('payments')
        .update({ invoice_number: invoiceNumber })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // 支払いデータを再取得
      fetchPayments();
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError('請求書の生成に失敗しました');
    } finally {
      setIsGeneratingInvoice(null);
    }
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/invoices/download/${paymentId}`);
      if (!response.ok) throw new Error('請求書のダウンロードに失敗しました');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('請求書のダウンロードに失敗しました');
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.influencer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="インフルエンサー名で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                インフルエンサー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                マッチング日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                支払期限
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  読み込み中...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  支払いデータが見つかりません
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.influencer_name}
                    </div>
                    {payment.invoice_number && (
                      <div className="text-sm text-gray-500">
                        請求書番号: {payment.invoice_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign size={16} className="mr-1 text-gray-400" />
                      ¥{payment.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      {new Date(payment.matching_date).toLocaleDateString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      {new Date(payment.due_date).toLocaleDateString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {payment.invoice_number ? (
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleDownloadInvoice(payment.id)}
                      >
                        <Download size={16} />
                      </button>
                    ) : (
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleGenerateInvoice(payment.id)}
                        disabled={isGeneratingInvoice === payment.id}
                      >
                        {isGeneratingInvoice === payment.id ? (
                          '生成中...'
                        ) : (
                          <FileText size={16} />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;