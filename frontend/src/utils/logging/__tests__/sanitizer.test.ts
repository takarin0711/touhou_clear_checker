/**
 * セキュリティサニタイザーの単体テスト
 */

import { sanitizeLogData, sanitizeError, sanitizeRequestData } from '../sanitizer';

describe('sanitizer', () => {
  describe('sanitizeLogData', () => {
    test('パスワードフィールドがマスキングされること', () => {
      const data = {
        username: 'testuser',
        password: 'secret123',
        email: 'test@example.com'
      };

      const result = sanitizeLogData(data);

      expect(result.username).toBe('testuser');
      expect(result.password).toBe('***MASKED***');
      // emailフィールドもマスキングされる（SENSITIVE_KEYSに含まれる）
      expect(result.email).toBe('***MASKED***');
    });

    test('トークンフィールドがマスキングされること', () => {
      const data = {
        access_token: 'abc123',
        refresh_token: 'def456',
        userId: 1
      };

      const result = sanitizeLogData(data);

      expect(result.access_token).toBe('***MASKED***');
      expect(result.refresh_token).toBe('***MASKED***');
      expect(result.userId).toBe(1);
    });

    test('ネストされたオブジェクトの機密情報がマスキングされること', () => {
      const data = {
        user: {
          id: 1,
          name: 'testuser',
          credentials: {
            password: 'secret',
            apiKey: 'key123'
          }
        }
      };

      const result = sanitizeLogData(data);

      expect(result.user.id).toBe(1);
      expect(result.user.name).toBe('testuser');
      expect(result.user.credentials.password).toBe('***MASKED***');
      expect(result.user.credentials.apiKey).toBe('***MASKED***');
    });

    test('配列内の機密情報がマスキングされること', () => {
      const data = {
        users: [
          { name: 'user1', password: 'pass1' },
          { name: 'user2', password: 'pass2' }
        ]
      };

      const result = sanitizeLogData(data);

      expect(result.users[0].name).toBe('user1');
      expect(result.users[0].password).toBe('***MASKED***');
      expect(result.users[1].name).toBe('user2');
      expect(result.users[1].password).toBe('***MASKED***');
    });

    test('null/undefinedが正しく処理されること', () => {
      expect(sanitizeLogData(null)).toBeNull();
      expect(sanitizeLogData(undefined)).toBeUndefined();
    });

    test('プリミティブ型（数値・真偽値）がそのまま返されること', () => {
      expect(sanitizeLogData(123)).toBe(123);
      expect(sanitizeLogData(true)).toBe(true);
    });

    test('emailフィールドがマスキングされること', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        age: 25
      };

      const result = sanitizeLogData(data);

      expect(result.username).toBe('testuser');
      expect(result.email).toBe('***MASKED***');
      expect(result.age).toBe(25);
    });

    test('文字列内のメールアドレスがマスキングされること', () => {
      const message = 'User test@example.com has registered';
      const result = sanitizeLogData(message);

      expect(result).toBe('User ***MASKED*** has registered');
    });

    test('JWTトークンがマスキングされること', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const result = sanitizeLogData(token);

      expect(result).toBe('***MASKED***');
    });

    test('Bearerトークンがマスキングされること', () => {
      const authHeader = 'Bearer abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
      const result = sanitizeLogData(authHeader);

      expect(result).toBe('***MASKED***');
    });

    test('APIキー形式の文字列がマスキングされること', () => {
      const apiKey = 'test_api_key_1234567890abcdefghijklmnopqrstuvwxyz12345';
      const result = sanitizeLogData(apiKey);

      expect(result).toBe('***MASKED***');
    });

    test('複数のメールアドレスがすべてマスキングされること', () => {
      const message = 'Emails: user1@example.com, user2@test.org, admin@site.net';
      const result = sanitizeLogData(message);

      expect(result).not.toContain('user1@example.com');
      expect(result).not.toContain('user2@test.org');
      expect(result).not.toContain('admin@site.net');
      expect(result).toContain('***MASKED***');
    });

    test('機密情報を含まない文字列はそのまま返されること', () => {
      const message = 'This is a normal message';
      const result = sanitizeLogData(message);

      expect(result).toBe('This is a normal message');
    });
  });

  describe('sanitizeError', () => {
    test('エラーオブジェクトがサニタイズされること', () => {
      const error = new Error('Test error');
      error.name = 'TestError';

      const result = sanitizeError(error);

      expect(result.message).toBe('Test error');
      expect(result.name).toBe('TestError');
      expect(result.stack).toBeDefined();
    });

    test('APIエラーレスポンスがサニタイズされること', () => {
      const error: any = {
        message: 'Request failed',
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {
            detail: 'Invalid credentials',
            password: 'secret'
          }
        }
      };

      const result = sanitizeError(error);

      expect(result.response.status).toBe(401);
      expect(result.response.statusText).toBe('Unauthorized');
      expect(result.response.data.detail).toBe('Invalid credentials');
      expect(result.response.data.password).toBe('***MASKED***');
    });

    test('リクエスト設定情報がマスキングされること', () => {
      const error: any = {
        message: 'Request failed',
        config: {
          url: '/api/users',
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
          data: { username: 'test', password: 'secret' }
        }
      };

      const result = sanitizeError(error);

      expect(result.config.url).toBe('/api/users');
      expect(result.config.method).toBe('POST');
      expect(result.config.headers).toBe('***MASKED***');
      expect(result.config.data).toBe('***MASKED***');
    });

    test('nullエラーが正しく処理されること', () => {
      expect(sanitizeError(null)).toBeNull();
    });
  });

  describe('sanitizeRequestData', () => {
    test('リクエストデータがサニタイズされること', () => {
      const requestData = {
        url: '/api/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secret-token'
        },
        data: {
          username: 'testuser',
          password: 'secret123'
        }
      };

      const result = sanitizeRequestData(requestData);

      expect(result.url).toBe('/api/login');
      expect(result.method).toBe('POST');
      expect(result.headers.Authorization).toBe('***MASKED***');
      expect(result.data.username).toBe('testuser');
      expect(result.data.password).toBe('***MASKED***');
    });

    test('nullリクエストが正しく処理されること', () => {
      expect(sanitizeRequestData(null)).toBeNull();
    });
  });
});
