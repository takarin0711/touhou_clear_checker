import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../features/auth/services/authApi';
import { User, LoginCredentials, RegisterData } from '../types/auth';

// authApiのモック
jest.mock('../features/auth/services/authApi');
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  is_active: true,
  is_admin: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockAuthResponse = {
  access_token: 'test-token',
  token_type: 'bearer',
  user: mockUser,
};

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// console.errorをモック
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// テスト用のAuthProviderラッパー
const createWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('useAuth フック', () => {
    it('AuthProvider外で使用するとエラーが発生する', () => {
      // エラーをキャッチするためのコンソールエラーを無効化
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('AuthProvider内で使用すると正常に動作する', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.checkAuth).toBe('function');
    });
  });

  describe('初期化', () => {
    it('localStorageに認証情報がない場合、初期状態を維持する', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('localStorageに有効な認証情報がある場合、状態を復元する', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'stored-token';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('stored-token');
    });

    it('localStorageの認証情報が壊れている場合、クリアする', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'stored-token';
        if (key === 'user') return 'invalid-json';
        return null;
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(console.error).toHaveBeenCalledWith('認証情報の復元に失敗:', expect.any(Error));
    });
  });

  describe('login', () => {
    it('ログインが成功した場合、状態とlocalStorageを更新する', async () => {
      mockedAuthApi.login.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123',
      };

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login(credentials);
      });

      expect(loginResult).toEqual({ success: true });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('ログインが失敗した場合、エラー状態を設定する', async () => {
      const errorMessage = 'Invalid credentials';
      const error = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      };
      mockedAuthApi.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login(credentials);
      });

      expect(loginResult).toEqual({ success: false, error: errorMessage });
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('ログイン中はローディング状態になる', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockedAuthApi.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      // ログイン開始
      act(() => {
        result.current.login({ username: 'test', password: 'test' });
      });

      // ローディング状態を確認
      expect(result.current.isLoading).toBe(true);

      // ログイン完了
      await act(async () => {
        resolveLogin!(mockAuthResponse);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('APIエラーレスポンスがない場合はデフォルトメッセージを使用する', async () => {
      const error = new Error('Network Error');
      mockedAuthApi.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login({ username: 'test', password: 'test' });
      });

      expect(loginResult.error).toBe('ログインに失敗しました');
      expect(result.current.error).toBe('ログインに失敗しました');
    });
  });

  describe('register', () => {
    it('ユーザー登録が成功した場合、状態とlocalStorageを更新する', async () => {
      mockedAuthApi.register.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      const registerData: RegisterData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      let registerResult: any;
      await act(async () => {
        registerResult = await result.current.register(registerData);
      });

      expect(registerResult).toEqual({ success: true });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('ユーザー登録が失敗した場合、エラー状態を設定する', async () => {
      const errorMessage = 'Username already exists';
      const error = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      };
      mockedAuthApi.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      const registerData: RegisterData = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
      };

      let registerResult: any;
      await act(async () => {
        registerResult = await result.current.register(registerData);
      });

      expect(registerResult).toEqual({ success: false, error: errorMessage });
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });

    it('APIエラーレスポンスがない場合はデフォルトメッセージを使用する', async () => {
      const error = new Error('Network Error');
      mockedAuthApi.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      let registerResult: any;
      await act(async () => {
        registerResult = await result.current.register({
          username: 'test',
          email: 'test@example.com',
          password: 'test',
        });
      });

      expect(registerResult.error).toBe('ユーザー登録に失敗しました');
      expect(result.current.error).toBe('ユーザー登録に失敗しました');
    });
  });

  describe('logout', () => {
    it('ログアウト時に状態とlocalStorageをクリアする', async () => {
      // 事前にログイン状態にする
      mockedAuthApi.login.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      // ログイン
      await act(async () => {
        await result.current.login({ username: 'test', password: 'test' });
      });

      // ログイン状態を確認
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');

      // ログアウト
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('checkAuth', () => {
    it('トークンがない場合はfalseを返す', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      let authResult: boolean;
      await act(async () => {
        authResult = await result.current.checkAuth();
      });

      expect(authResult!).toBe(false);
    });

    it('有効なトークンの場合はユーザー情報を更新してtrueを返す', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      let authResult: boolean;
      await act(async () => {
        authResult = await result.current.checkAuth();
      });

      expect(authResult!).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('valid-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('無効なトークンの場合はログアウトしてfalseを返す', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      const error = new Error('Unauthorized');
      mockedAuthApi.getCurrentUser.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      let authResult: boolean;
      await act(async () => {
        authResult = await result.current.checkAuth();
      });

      expect(authResult!).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(console.error).toHaveBeenCalledWith('認証確認エラー:', error);
    });
  });

  describe('AuthProvider コンポーネント', () => {
    it('子コンポーネントにAuthContextを提供する', () => {
      const TestComponent = () => {
        const { user, token } = useAuth();
        return (
          <div>
            <span data-testid="user">{user ? user.username : 'not logged in'}</span>
            <span data-testid="token">{token || 'no token'}</span>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('not logged in');
      expect(screen.getByTestId('token')).toHaveTextContent('no token');
    });
  });

  describe('エラー処理とエッジケース', () => {
    it('複数回のログイン試行を正しく処理する', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      // 最初のログイン（失敗）
      mockedAuthApi.login.mockRejectedValueOnce(new Error('First attempt failed'));
      await act(async () => {
        await result.current.login({ username: 'test', password: 'test' });
      });

      expect(result.current.error).toBe('ログインに失敗しました');

      // 2回目のログイン（成功）
      mockedAuthApi.login.mockResolvedValue(mockAuthResponse);
      await act(async () => {
        await result.current.login({ username: 'test', password: 'test' });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.user).toEqual(mockUser);
    });

    it('同時に複数のAPIリクエストが実行されても正しく処理する', async () => {
      mockedAuthApi.login.mockResolvedValue(mockAuthResponse);
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);
      localStorageMock.getItem.mockReturnValue('test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      // 同時にloginとcheckAuthを実行
      await act(async () => {
        await Promise.all([
          result.current.login({ username: 'test', password: 'test' }),
          result.current.checkAuth(),
        ]);
      });

      // 最終的な状態は一貫している
      expect(result.current.user).toBeDefined();
      expect(result.current.token).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});