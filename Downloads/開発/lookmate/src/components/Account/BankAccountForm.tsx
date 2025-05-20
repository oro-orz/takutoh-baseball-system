import React, { useState } from 'react';
import { BankAccount } from '../../types';
import { Save, AlertCircle } from 'lucide-react';

interface BankAccountFormProps {
  initialData: BankAccount;
  onSave: (data: BankAccount) => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<BankAccount>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof BankAccount, string>>>({});
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name as keyof BankAccount]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    
    if (isSaved) {
      setIsSaved(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BankAccount, string>> = {};
    
    if (!formData.bankName.trim()) {
      newErrors.bankName = '銀行名を入力してください';
    }
    
    if (!formData.branchName.trim()) {
      newErrors.branchName = '支店名を入力してください';
    }
    
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = '口座番号を入力してください';
    } else if (!/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = '口座番号は数字のみで入力してください';
    }
    
    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = '口座名義を入力してください';
    }

    if (!formData.taxId?.trim()) {
      newErrors.taxId = '適格請求書発行事業者登録番号を入力してください';
    } else if (!/^T\d{13}$/.test(formData.taxId)) {
      newErrors.taxId = '正しい形式で入力してください（例：T1234567890123）';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
      setIsSaved(true);
      
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">振込先口座情報</h2>
        <p className="text-sm text-gray-500 mt-1">
          報酬の受け取りに使用する銀行口座情報を入力してください
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
              銀行名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.bankName ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="例：三菱UFJ銀行"
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.bankName}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">
              支店名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branchName"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.branchName ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="例：渋谷支店"
            />
            {errors.branchName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.branchName}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              口座種別 <span className="text-red-500">*</span>
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ordinary">普通</option>
              <option value="checking">当座</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              口座番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.accountNumber ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="例：1234567"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.accountNumber}
              </p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">
              口座名義 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountHolder"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.accountHolder ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="例：スズキ ミサキ"
            />
            <p className="mt-1 text-xs text-gray-500">
              ※ 口座名義は全角カタカナで入力してください
            </p>
            {errors.accountHolder && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.accountHolder}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              適格請求書発行事業者登録番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.taxId ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="例：T1234567890123"
            />
            <p className="mt-1 text-xs text-gray-500">
              ※ T+13桁の数字で入力してください
            </p>
            {errors.taxId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.taxId}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-end">
          {isSaved && (
            <p className="mr-4 text-sm text-green-600 flex items-center">
              <CheckCircleIcon size={16} className="mr-1" />
              保存しました
            </p>
          )}
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Save size={18} className="mr-2" />
            保存する
          </button>
        </div>
      </form>
    </div>
  );
};

const CheckCircleIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default BankAccountForm;