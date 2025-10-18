/**
 * トースト通知コンテキスト
 *
 * アプリケーション全体でトースト通知を管理します。
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorSeverity } from '../types/error';

export interface Toast {
  id: string;
  message: string;
  severity: ErrorSeverity;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, severity?: ErrorSeverity, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * トーストプロバイダー
 *
 * 使用例:
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    severity: ErrorSeverity = ErrorSeverity.INFO,
    duration: number = 5000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, severity, duration };

    setToasts(prev => [...prev, newToast]);

    // 自動削除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, ErrorSeverity.INFO, duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, ErrorSeverity.ERROR, duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, ErrorSeverity.WARNING, duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, ErrorSeverity.INFO, duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

/**
 * トーストコンテキストフック
 *
 * 使用例:
 * ```tsx
 * const { showSuccess, showError } = useToast();
 *
 * showSuccess('保存しました');
 * showError('エラーが発生しました');
 * ```
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
