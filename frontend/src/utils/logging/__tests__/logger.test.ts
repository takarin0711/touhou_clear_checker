/**
 * 構造化ロガーの単体テスト
 */

import { Logger, createLogger } from '../logger';
import { LogLevel } from '../logConfig';

// コンソールメソッドをモック化
const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Logger', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  afterAll(() => {
    // すべてのテスト後にモックを復元
    mockConsoleDebug.mockRestore();
    mockConsoleInfo.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('createLogger', () => {
    test('名前付きロガーが作成されること', () => {
      const logger = createLogger('TestLogger');
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('debug', () => {
    test('DEBUGメッセージが出力されること', () => {
      const logger = createLogger('TestLogger');
      logger.debug('Debug message');

      expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
      expect(mockConsoleDebug.mock.calls[0][0]).toContain('[DEBUG]');
      expect(mockConsoleDebug.mock.calls[0][0]).toContain('[TestLogger]');
      expect(mockConsoleDebug.mock.calls[0][0]).toContain('Debug message');
    });

    test('コンテキスト情報が含まれること', () => {
      const logger = createLogger('TestLogger');
      const context = { userId: 1, action: 'login' };
      logger.debug('Debug with context', context);

      expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
      expect(mockConsoleDebug.mock.calls[0][1]).toEqual(context);
    });

    test('機密情報がマスキングされること', () => {
      const logger = createLogger('TestLogger');
      const context = { username: 'test', password: 'secret' };
      logger.debug('Debug with sensitive data', context);

      expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
      const loggedContext = mockConsoleDebug.mock.calls[0][1];
      expect(loggedContext.username).toBe('test');
      expect(loggedContext.password).toBe('***MASKED***');
    });
  });

  describe('info', () => {
    test('INFOメッセージが出力されること', () => {
      const logger = createLogger('TestLogger');
      logger.info('Info message');

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      expect(mockConsoleInfo.mock.calls[0][0]).toMatch(/\[INFO\s*\]/);
      expect(mockConsoleInfo.mock.calls[0][0]).toContain('Info message');
    });
  });

  describe('warn', () => {
    test('WARNメッセージが出力されること', () => {
      const logger = createLogger('TestLogger');
      logger.warn('Warning message');

      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleWarn.mock.calls[0][0]).toMatch(/\[WARN\s*\]/);
      expect(mockConsoleWarn.mock.calls[0][0]).toContain('Warning message');
    });
  });

  describe('error', () => {
    test('ERRORメッセージが出力されること', () => {
      const logger = createLogger('TestLogger');
      const error = new Error('Test error');
      logger.error('Error message', error);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError.mock.calls[0][0]).toContain('[ERROR]');
      expect(mockConsoleError.mock.calls[0][0]).toContain('Error message');
    });

    test('エラーオブジェクトがサニタイズされること', () => {
      const logger = createLogger('TestLogger');
      const error: any = {
        message: 'API Error',
        config: {
          headers: { Authorization: 'Bearer secret-token' }
        }
      };
      logger.error('API request failed', error);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const loggedError = mockConsoleError.mock.calls[0][2];
      expect(loggedError.message).toBe('API Error');
      expect(loggedError.config.headers).toBe('***MASKED***');
    });
  });

  describe('logApiCall', () => {
    test('API呼び出しログが出力されること', () => {
      const logger = createLogger('TestLogger');
      logger.logApiCall('GET', '/api/users', { page: 1 });

      expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
      expect(mockConsoleDebug.mock.calls[0][0]).toContain('API Call: GET /api/users');
      expect(mockConsoleDebug.mock.calls[0][1]).toHaveProperty('method', 'GET');
      expect(mockConsoleDebug.mock.calls[0][1]).toHaveProperty('url', '/api/users');
    });

    test('機密パラメータがマスキングされること', () => {
      const logger = createLogger('TestLogger');
      logger.logApiCall('POST', '/api/login', { username: 'test', password: 'secret' });

      const loggedContext = mockConsoleDebug.mock.calls[0][1];
      expect(loggedContext.params.username).toBe('test');
      expect(loggedContext.params.password).toBe('***MASKED***');
    });
  });

  describe('logApiSuccess', () => {
    test('API成功ログが出力されること', () => {
      const logger = createLogger('TestLogger');
      logger.logApiSuccess('GET', '/api/users', 200, { count: 10 });

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      expect(mockConsoleInfo.mock.calls[0][0]).toContain('API Success: GET /api/users');
      expect(mockConsoleInfo.mock.calls[0][1]).toHaveProperty('status', 200);
    });
  });

  describe('logApiError', () => {
    test('APIエラーログが出力されること', () => {
      const logger = createLogger('TestLogger');
      const error = new Error('Request failed');
      logger.logApiError('POST', '/api/users', error);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError.mock.calls[0][0]).toContain('API Error: POST /api/users');
    });
  });

  describe('タイムスタンプ', () => {
    test('ログにタイムスタンプが含まれること', () => {
      const logger = createLogger('TestLogger');
      logger.info('Test message');

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      // ISO 8601形式のタイムスタンプを含むか確認（例: 2025-01-15T12:34:56.789Z）
      expect(mockConsoleInfo.mock.calls[0][0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });
});
