/**
 * エラーハンドリングユーティリティ
 *
 * API通信エラーやアプリケーションエラーを統一的に処理します
 */

import { AxiosError } from 'axios';
import {
  ApiErrorResponse,
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorDisplayInfo
} from '../types/error';
import { createLogger } from './logging/logger';

const logger = createLogger('ErrorHandler');

/**
 * Axiosエラーを AppError に変換
 */
export function parseApiError(error: unknown): AppError {
  const timestamp = new Date().toISOString();

  // Axiosエラーの場合
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // レスポンスがある場合（サーバーからのエラーレスポンス）
    if (axiosError.response) {
      const { status, data } = axiosError.response;

      logger.error('API Error Response', axiosError, {
        status,
        url: axiosError.config?.url,
        method: axiosError.config?.method
      });

      return {
        type: mapHttpStatusToErrorType(status),
        message: data?.message || axiosError.message || 'API通信でエラーが発生しました',
        code: data?.error_code,
        details: data?.details,
        originalError: axiosError,
        timestamp
      };
    }

    // リクエストは送信されたがレスポンスがない場合（ネットワークエラー）
    if (axiosError.request) {
      logger.error('Network Error', axiosError);

      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'ネットワークエラーが発生しました。接続を確認してください。',
        originalError: axiosError,
        timestamp
      };
    }

    // リクエスト設定中のエラー
    logger.error('Request Setup Error', axiosError);

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: 'リクエストの準備中にエラーが発生しました',
      originalError: axiosError,
      timestamp
    };
  }

  // 一般的なErrorオブジェクトの場合
  if (error instanceof Error) {
    logger.error('Application Error', error);

    return {
      type: ErrorType.COMPONENT_ERROR,
      message: error.message || '予期しないエラーが発生しました',
      originalError: error,
      timestamp
    };
  }

  // 不明なエラーの場合
  logger.error('Unknown Error', null, { error });

  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: '不明なエラーが発生しました',
    originalError: error,
    timestamp
  };
}

/**
 * HTTPステータスコードからエラータイプへのマッピング
 */
function mapHttpStatusToErrorType(status: number): ErrorType {
  if (status === 401) {
    return ErrorType.AUTHENTICATION_ERROR;
  }
  if (status === 403) {
    return ErrorType.AUTHORIZATION_ERROR;
  }
  if (status === 404) {
    return ErrorType.NOT_FOUND_ERROR;
  }
  if (status === 409) {
    return ErrorType.DUPLICATE_ERROR;
  }
  if (status === 422 || status === 400) {
    return ErrorType.VALIDATION_ERROR;
  }
  if (status === 408 || status === 504) {
    return ErrorType.TIMEOUT_ERROR;
  }
  if (status >= 500) {
    return ErrorType.SERVER_ERROR;
  }

  return ErrorType.API_ERROR;
}

/**
 * Axiosエラーかどうかを判定
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * AppError をユーザー向け表示情報に変換
 */
export function getErrorDisplayInfo(error: AppError): ErrorDisplayInfo {
  const severity = mapErrorTypeToSeverity(error.type);
  const title = getErrorTitle(error.type);
  const message = getUserFriendlyMessage(error);

  const displayInfo: ErrorDisplayInfo = {
    title,
    message,
    severity,
    showDetails: process.env.NODE_ENV === 'development'
  };

  // エラータイプに応じたアクション追加
  if (error.type === ErrorType.AUTHENTICATION_ERROR) {
    displayInfo.actionLabel = 'ログインページへ';
    displayInfo.actionCallback = () => {
      window.location.href = '/login';
    };
  } else if (error.type === ErrorType.NETWORK_ERROR) {
    displayInfo.actionLabel = '再試行';
    displayInfo.actionCallback = () => {
      window.location.reload();
    };
  }

  return displayInfo;
}

/**
 * エラータイプから重要度へのマッピング
 */
function mapErrorTypeToSeverity(type: ErrorType): ErrorSeverity {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
    case ErrorType.SERVER_ERROR:
    case ErrorType.DATABASE_ERROR:
      return ErrorSeverity.CRITICAL;

    case ErrorType.AUTHENTICATION_ERROR:
    case ErrorType.AUTHORIZATION_ERROR:
      return ErrorSeverity.ERROR;

    case ErrorType.VALIDATION_ERROR:
    case ErrorType.DUPLICATE_ERROR:
      return ErrorSeverity.WARNING;

    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * エラータイプに応じたタイトルを取得
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return 'ネットワークエラー';
    case ErrorType.AUTHENTICATION_ERROR:
      return '認証エラー';
    case ErrorType.AUTHORIZATION_ERROR:
      return '権限エラー';
    case ErrorType.NOT_FOUND_ERROR:
      return 'データが見つかりません';
    case ErrorType.VALIDATION_ERROR:
      return '入力エラー';
    case ErrorType.DUPLICATE_ERROR:
      return '重複エラー';
    case ErrorType.SERVER_ERROR:
      return 'サーバーエラー';
    case ErrorType.DATABASE_ERROR:
      return 'データベースエラー';
    case ErrorType.TIMEOUT_ERROR:
      return 'タイムアウト';
    default:
      return 'エラー';
  }
}

/**
 * ユーザーフレンドリーなエラーメッセージを取得
 */
function getUserFriendlyMessage(error: AppError): string {
  // バックエンドからのメッセージがある場合はそれを使用
  if (error.message && !error.message.includes('undefined')) {
    return error.message;
  }

  // デフォルトメッセージ
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'インターネット接続を確認してください';
    case ErrorType.AUTHENTICATION_ERROR:
      return 'ログインが必要です';
    case ErrorType.AUTHORIZATION_ERROR:
      return 'この操作を実行する権限がありません';
    case ErrorType.NOT_FOUND_ERROR:
      return '指定されたデータが見つかりませんでした';
    case ErrorType.SERVER_ERROR:
      return 'サーバーで問題が発生しました。しばらく待ってから再試行してください';
    case ErrorType.TIMEOUT_ERROR:
      return 'リクエストがタイムアウトしました。再試行してください';
    default:
      return '問題が発生しました。再試行してください';
  }
}

/**
 * エラーの詳細情報を文字列化（デバッグ用）
 */
export function formatErrorDetails(error: AppError): string {
  const details: string[] = [];

  details.push(`Type: ${error.type}`);
  details.push(`Message: ${error.message}`);

  if (error.code) {
    details.push(`Code: ${error.code}`);
  }

  if (error.details && Object.keys(error.details).length > 0) {
    details.push(`Details: ${JSON.stringify(error.details, null, 2)}`);
  }

  details.push(`Timestamp: ${error.timestamp}`);

  if (error.originalError && process.env.NODE_ENV === 'development') {
    if (error.originalError.stack) {
      details.push(`\nStack Trace:\n${error.originalError.stack}`);
    }
  }

  return details.join('\n');
}
