// エラーハンドリングユーティリティ

export interface ErrorInfo {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private messageQueue: ErrorInfo[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  showMessage(errorInfo: ErrorInfo): void {
    this.messageQueue.push(errorInfo);
    this.renderMessage(errorInfo);
  }

  showError(message: string, duration: number = 5000): void {
    this.showMessage({
      message,
      type: 'error',
      duration
    });
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.showMessage({
      message,
      type: 'success',
      duration
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.showMessage({
      message,
      type: 'warning',
      duration
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showMessage({
      message,
      type: 'info',
      duration
    });
  }

  private renderMessage(errorInfo: ErrorInfo): void {
    const messageElement = document.createElement('div');
    messageElement.className = this.getMessageClasses(errorInfo.type);
    messageElement.innerHTML = this.getMessageHTML(errorInfo.message, errorInfo.type);
    
    // 既存のメッセージがある場合は少し下に配置
    const existingMessages = document.querySelectorAll('.error-message-toast');
    const topOffset = 16 + (existingMessages.length * 80);
    messageElement.style.top = `${topOffset}px`;
    
    document.body.appendChild(messageElement);

    // アニメーション
    setTimeout(() => {
      messageElement.style.transform = 'translateX(0)';
      messageElement.style.opacity = '1';
    }, 10);

    // 自動削除
    setTimeout(() => {
      messageElement.style.transform = 'translateX(100%)';
      messageElement.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(messageElement)) {
          document.body.removeChild(messageElement);
        }
      }, 300);
    }, errorInfo.duration || 3000);
  }

  private getMessageClasses(type: string): string {
    const baseClasses = 'fixed right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300 error-message-toast';
    
    switch (type) {
      case 'error':
        return `${baseClasses} bg-red-500 text-white transform translate-x-full opacity-0`;
      case 'success':
        return `${baseClasses} bg-green-500 text-white transform translate-x-full opacity-0`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white transform translate-x-full opacity-0`;
      case 'info':
        return `${baseClasses} bg-blue-500 text-white transform translate-x-full opacity-0`;
      default:
        return `${baseClasses} bg-gray-500 text-white transform translate-x-full opacity-0`;
    }
  }

  private getMessageHTML(message: string, type: string): string {
    const icon = this.getIcon(type);
    return `
      ${icon}
      <span>${message}</span>
    `;
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'error':
        return `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
        `;
      case 'success':
        return `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        `;
      case 'warning':
        return `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        `;
      case 'info':
        return `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        `;
      default:
        return `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        `;
    }
  }
}

// 便利な関数
export const showError = (message: string, duration?: number) => {
  ErrorHandler.getInstance().showError(message, duration);
};

export const showSuccess = (message: string, duration?: number) => {
  ErrorHandler.getInstance().showSuccess(message, duration);
};

export const showWarning = (message: string, duration?: number) => {
  ErrorHandler.getInstance().showWarning(message, duration);
};

export const showInfo = (message: string, duration?: number) => {
  ErrorHandler.getInstance().showInfo(message, duration);
};

// 非同期処理のエラーハンドリング
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage: string = '処理中にエラーが発生しました'
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error: any) {
    console.error('Async error:', error);
    const detailedMessage = error?.message || errorMessage;
    showError(detailedMessage);
    return null;
  }
};

// フォームバリデーション
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => string | null>): string[] => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(rules)) {
    const value = data[field];
    const error = validator(value);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
};

// バリデーションルール
export const validationRules = {
  required: (fieldName: string) => (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName}は必須です`;
    }
    return null;
  },
  
  minLength: (min: number, fieldName: string) => (value: string) => {
    if (value && value.length < min) {
      return `${fieldName}は${min}文字以上で入力してください`;
    }
    return null;
  },
  
  maxLength: (max: number, fieldName: string) => (value: string) => {
    if (value && value.length > max) {
      return `${fieldName}は${max}文字以下で入力してください`;
    }
    return null;
  },
  
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '有効なメールアドレスを入力してください';
    }
    return null;
  },
  
  number: (fieldName: string) => (value: any) => {
    if (value && isNaN(Number(value))) {
      return `${fieldName}は数値で入力してください`;
    }
    return null;
  },
  
  min: (min: number, fieldName: string) => (value: number) => {
    if (value !== undefined && value < min) {
      return `${fieldName}は${min}以上で入力してください`;
    }
    return null;
  },
  
  max: (max: number, fieldName: string) => (value: number) => {
    if (value !== undefined && value > max) {
      return `${fieldName}は${max}以下で入力してください`;
    }
    return null;
  }
};
