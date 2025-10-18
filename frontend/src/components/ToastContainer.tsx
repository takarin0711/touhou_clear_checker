/**
 * トースト通知コンテナ
 *
 * トースト通知を画面上に表示します。
 */

import React from 'react';
import { useToast, Toast } from '../contexts/ToastContext';
import { ErrorSeverity } from '../types/error';

/**
 * トーストコンテナコンポーネント
 *
 * 使用例:
 * ```tsx
 * <ToastContainer />
 * ```
 */
export function ToastContainer(): React.ReactElement {
  const { toasts, removeToast } = useToast();

  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps): React.ReactElement {
  const severityStyles = getSeverityStyles(toast.severity);

  return (
    <div style={{ ...styles.toast, ...severityStyles }}>
      <div style={styles.message}>{toast.message}</div>
      <button onClick={onClose} style={styles.closeButton}>
        ×
      </button>
    </div>
  );
}

function getSeverityStyles(severity: ErrorSeverity): React.CSSProperties {
  switch (severity) {
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      return {
        backgroundColor: '#d32f2f',
        color: 'white'
      };
    case ErrorSeverity.WARNING:
      return {
        backgroundColor: '#f57c00',
        color: 'white'
      };
    case ErrorSeverity.INFO:
    default:
      return {
        backgroundColor: '#1976d2',
        color: 'white'
      };
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out'
  },
  message: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '1.5'
  },
  closeButton: {
    marginLeft: '12px',
    padding: '0',
    width: '24px',
    height: '24px',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    fontSize: '24px',
    lineHeight: '1',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  }
};

export default ToastContainer;
