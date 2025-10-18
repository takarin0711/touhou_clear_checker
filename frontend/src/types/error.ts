/**
 * エラー型定義
 *
 * バックエンドのカスタム例外レスポンスと連携するための型定義
 */

/**
 * バックエンドのエラーレスポンス形式
 */
export interface ApiErrorResponse {
  error: string;           // エラータイプ（例: "Not Found", "Validation Error"）
  message: string;         // エラーメッセージ
  error_code?: string;     // エラーコード（例: "USER_NOT_FOUND"）
  details?: Record<string, any>; // 追加詳細情報
}

/**
 * アプリケーション内部で使用するエラー情報
 */
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  originalError?: any;
  timestamp: string;
}

/**
 * エラータイプ列挙
 */
export enum ErrorType {
  // ネットワーク・API関連
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 認証・認可関連
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',

  // データ関連
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',

  // システム関連
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // クライアント関連
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * エラーレベル列挙
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * ユーザー向けエラー表示情報
 */
export interface ErrorDisplayInfo {
  title: string;
  message: string;
  severity: ErrorSeverity;
  actionLabel?: string;
  actionCallback?: () => void;
  showDetails?: boolean;
}
