/**
 * エラーバウンダリコンポーネント
 *
 * Reactコンポーネントツリー内のエラーをキャッチし、
 * フォールバックUIを表示します。
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { parseApiError, getErrorDisplayInfo, formatErrorDetails } from '../utils/errorHandler';
import { AppError } from '../types/error';
import { createLogger } from '../utils/logging/logger';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: (error: AppError, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

/**
 * エラーバウンダリコンポーネント
 *
 * 使用例:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * カスタムフォールバックUI:
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => <CustomErrorUI error={error} onReset={reset} />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーをパース
    const appError = parseApiError(error);

    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーログを記録
    logger.error('Component Error Caught', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    // 開発環境では詳細をコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary Caught:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // デフォルトフォールバックUI
      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * デフォルトエラーフォールバックUI
 */
interface FallbackProps {
  error: AppError;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: FallbackProps): React.ReactElement {
  const displayInfo = getErrorDisplayInfo(error);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{displayInfo.title}</h1>
        </div>

        <div style={styles.body}>
          <p style={styles.message}>{displayInfo.message}</p>

          {isDevelopment && (
            <details style={styles.details}>
              <summary style={styles.summary}>詳細情報（開発環境のみ）</summary>
              <pre style={styles.pre}>{formatErrorDetails(error)}</pre>
            </details>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onReset} style={styles.button}>
            再試行
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// インラインスタイル（基本的なUI）
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#d32f2f'
  },
  body: {
    padding: '24px'
  },
  message: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#333',
    lineHeight: '1.6'
  },
  details: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  pre: {
    margin: '8px 0 0 0',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
    lineHeight: '1.4'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#1976d2',
    color: 'white',
    transition: 'background-color 0.2s'
  },
  buttonSecondary: {
    backgroundColor: '#757575'
  }
};

export default ErrorBoundary;
