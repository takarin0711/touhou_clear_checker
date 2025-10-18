/**
 * エラーハンドリングユーティリティの単体テスト
 */

import { AxiosError } from 'axios';
import {
  parseApiError,
  getErrorDisplayInfo,
  formatErrorDetails
} from '../errorHandler';
import {
  ErrorType,
  ErrorSeverity,
  ApiErrorResponse
} from '../../types/error';

// ロガーをモック化
jest.mock('../logging/logger', () => ({
  createLogger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  })
}));

describe('errorHandler', () => {
  describe('parseApiError', () => {
    test('Axiosエラー（404）を正しくパースすること', () => {
      const axiosError: Partial<AxiosError<ApiErrorResponse>> = {
        isAxiosError: true,
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            error: 'Not Found',
            message: 'ユーザーが見つかりません',
            error_code: 'USER_NOT_FOUND'
          },
          headers: {},
          config: {} as any
        },
        config: {
          url: '/api/users/123',
          method: 'GET'
        } as any
      };

      const result = parseApiError(axiosError);

      expect(result.type).toBe(ErrorType.NOT_FOUND_ERROR);
      expect(result.message).toBe('ユーザーが見つかりません');
      expect(result.code).toBe('USER_NOT_FOUND');
      expect(result.originalError).toBe(axiosError);
      expect(result.timestamp).toBeDefined();
    });

    test('Axiosエラー（401）を認証エラーとして扱うこと', () => {
      const axiosError: Partial<AxiosError<ApiErrorResponse>> = {
        isAxiosError: true,
        message: 'Unauthorized',
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {
            error: 'Authentication Error',
            message: '認証が必要です'
          },
          headers: {},
          config: {} as any
        },
        config: {} as any
      };

      const result = parseApiError(axiosError);

      expect(result.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(result.message).toBe('認証が必要です');
    });

    test('Axiosエラー（403）を認可エラーとして扱うこと', () => {
      const axiosError: Partial<AxiosError<ApiErrorResponse>> = {
        isAxiosError: true,
        message: 'Forbidden',
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: {
            error: 'Authorization Error',
            message: '権限がありません'
          },
          headers: {},
          config: {} as any
        },
        config: {} as any
      };

      const result = parseApiError(axiosError);

      expect(result.type).toBe(ErrorType.AUTHORIZATION_ERROR);
      expect(result.message).toBe('権限がありません');
    });

    test('Axiosエラー（422）をバリデーションエラーとして扱うこと', () => {
      const axiosError: Partial<AxiosError<ApiErrorResponse>> = {
        isAxiosError: true,
        message: 'Validation Error',
        response: {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: {
            error: 'Validation Error',
            message: '入力値が不正です',
            details: {
              email: 'メールアドレスの形式が正しくありません'
            }
          },
          headers: {},
          config: {} as any
        },
        config: {} as any
      };

      const result = parseApiError(axiosError);

      expect(result.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.message).toBe('入力値が不正です');
      expect(result.details).toEqual({
        email: 'メールアドレスの形式が正しくありません'
      });
    });

    test('Axiosエラー（500）をサーバーエラーとして扱うこと', () => {
      const axiosError: Partial<AxiosError<ApiErrorResponse>> = {
        isAxiosError: true,
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            error: 'Server Error',
            message: 'サーバーで問題が発生しました'
          },
          headers: {},
          config: {} as any
        },
        config: {} as any
      };

      const result = parseApiError(axiosError);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.message).toBe('サーバーで問題が発生しました');
    });

    test('ネットワークエラー（レスポンスなし）を正しく扱うこと', () => {
      const axiosError: Partial<AxiosError> = {
        isAxiosError: true,
        message: 'Network Error',
        request: {},
        config: {} as any
      };

      const result = parseApiError(axiosError);

      expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      expect(result.message).toBe('ネットワークエラーが発生しました。接続を確認してください。');
    });

    test('一般的なErrorオブジェクトを正しく扱うこと', () => {
      const error = new Error('Something went wrong');

      const result = parseApiError(error);

      expect(result.type).toBe(ErrorType.COMPONENT_ERROR);
      expect(result.message).toBe('Something went wrong');
      expect(result.originalError).toBe(error);
    });

    test('不明なエラーを正しく扱うこと', () => {
      const error = 'string error';

      const result = parseApiError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe('不明なエラーが発生しました');
    });
  });

  describe('getErrorDisplayInfo', () => {
    test('認証エラーの表示情報を正しく生成すること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            error: 'Authentication Error',
            message: '認証が必要です'
          }
        }
      } as any);

      const displayInfo = getErrorDisplayInfo(error);

      expect(displayInfo.title).toBe('認証エラー');
      expect(displayInfo.message).toBe('認証が必要です');
      expect(displayInfo.severity).toBe(ErrorSeverity.ERROR);
      expect(displayInfo.actionLabel).toBe('ログインページへ');
      expect(displayInfo.actionCallback).toBeDefined();
    });

    test('ネットワークエラーの表示情報を正しく生成すること', () => {
      const error = parseApiError({
        isAxiosError: true,
        request: {},
        message: 'Network Error'
      } as any);

      const displayInfo = getErrorDisplayInfo(error);

      expect(displayInfo.title).toBe('ネットワークエラー');
      expect(displayInfo.severity).toBe(ErrorSeverity.CRITICAL);
      expect(displayInfo.actionLabel).toBe('再試行');
      expect(displayInfo.actionCallback).toBeDefined();
    });

    test('バリデーションエラーの表示情報を正しく生成すること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            error: 'Validation Error',
            message: '入力値が不正です'
          }
        }
      } as any);

      const displayInfo = getErrorDisplayInfo(error);

      expect(displayInfo.title).toBe('入力エラー');
      expect(displayInfo.severity).toBe(ErrorSeverity.WARNING);
    });

    test('サーバーエラーの表示情報を正しく生成すること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            error: 'Server Error',
            message: 'サーバーで問題が発生しました'
          }
        }
      } as any);

      const displayInfo = getErrorDisplayInfo(error);

      expect(displayInfo.title).toBe('サーバーエラー');
      expect(displayInfo.severity).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('formatErrorDetails', () => {
    test('エラー詳細を文字列化できること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            error: 'Not Found',
            message: 'ユーザーが見つかりません',
            error_code: 'USER_NOT_FOUND',
            details: {
              userId: 123
            }
          }
        }
      } as any);

      const details = formatErrorDetails(error);

      expect(details).toContain('Type: NOT_FOUND_ERROR');
      expect(details).toContain('Message: ユーザーが見つかりません');
      expect(details).toContain('Code: USER_NOT_FOUND');
      expect(details).toContain('Timestamp:');
    });

    test('詳細情報がない場合も正しく文字列化できること', () => {
      const error = parseApiError(new Error('Simple error'));

      const details = formatErrorDetails(error);

      expect(details).toContain('Type: COMPONENT_ERROR');
      expect(details).toContain('Message: Simple error');
      expect(details).not.toContain('Code:');
    });
  });

  describe('エラータイプマッピング', () => {
    test('409をDUPLICATE_ERRORにマッピングすること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 409,
          data: {
            error: 'Duplicate Error',
            message: 'すでに登録されています'
          }
        }
      } as any);

      expect(error.type).toBe(ErrorType.DUPLICATE_ERROR);
    });

    test('408をTIMEOUT_ERRORにマッピングすること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 408,
          data: {
            error: 'Timeout',
            message: 'タイムアウトしました'
          }
        }
      } as any);

      expect(error.type).toBe(ErrorType.TIMEOUT_ERROR);
    });

    test('400をVALIDATION_ERRORにマッピングすること', () => {
      const error = parseApiError({
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            error: 'Bad Request',
            message: '不正なリクエストです'
          }
        }
      } as any);

      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });
});
