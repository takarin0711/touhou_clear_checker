import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../features/auth/services/authApi';
import { User, LoginCredentials, RegisterData, AuthContextType, EmailVerificationState } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  emailVerificationState: EmailVerificationState;
}

interface AuthAction {
  type: 'AUTH_START' | 'AUTH_SUCCESS' | 'AUTH_ERROR' | 'LOGOUT' | 'EMAIL_VERIFICATION_START' | 'EMAIL_VERIFICATION_SUCCESS' | 'EMAIL_VERIFICATION_ERROR' | 'EMAIL_RESEND_START' | 'EMAIL_RESEND_SUCCESS' | 'EMAIL_RESEND_ERROR';
  payload?: any;
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        user: null,
        token: null,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        error: null,
        isLoading: false,
        emailVerificationState: initialState.emailVerificationState,
      };
    
    case 'EMAIL_VERIFICATION_START':
      return {
        ...state,
        emailVerificationState: {
          ...state.emailVerificationState,
          isVerifying: true,
          error: null,
        },
      };
    
    case 'EMAIL_VERIFICATION_SUCCESS':
      return {
        ...state,
        emailVerificationState: {
          ...state.emailVerificationState,
          isVerifying: false,
          message: action.payload.message,
          error: null,
        },
      };
    
    case 'EMAIL_VERIFICATION_ERROR':
      return {
        ...state,
        emailVerificationState: {
          ...state.emailVerificationState,
          isVerifying: false,
          error: action.payload,
        },
      };
    
    case 'EMAIL_RESEND_START':
      return {
        ...state,
        emailVerificationState: {
          ...state.emailVerificationState,
          isResending: true,
          error: null,
        },
      };
    
    case 'EMAIL_RESEND_SUCCESS':
      return {
        ...state,
        emailVerificationState: {
          ...state.emailVerificationState,
          isResending: false,
          message: action.payload.message,
          error: null,
        },
      };
    
    case 'EMAIL_RESEND_ERROR':
      return {
        ...state,
        emailVerificationState: {
          ...state.emailVerificationState,
          isResending: false,
          error: action.payload,
        },
      };
    
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  emailVerificationState: {
    isVerifying: false,
    isResending: false,
    message: null,
    error: null,
  },
};

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 認証プロバイダーコンポーネント
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初期化時に保存された認証情報をチェック
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } catch (error: any) {
        console.error('認証情報の復元に失敗:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  /**
   * ログイン
   */
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.login(credentials);
      const { access_token, user } = response;

      // LocalStorageに保存
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token },
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'ログインに失敗しました';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * ユーザー登録
   */
  const register = async (registerData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.register(registerData);
      const { access_token, user } = response;

      // メール未認証の場合は自動ログインしない
      if (!user.email_verified) {
        dispatch({
          type: 'AUTH_ERROR', 
          payload: null, // エラーではないのでnull
        });
        return { 
          success: true, 
          requiresEmailVerification: true 
        };
      }

      // メール認証済みの場合（既存ユーザーや管理者作成など）
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token },
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'ユーザー登録に失敗しました';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * ログアウト
   */
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  /**
   * 認証状態の確認
   */
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }

    try {
      const user = await authApi.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      return true;
    } catch (error: any) {
      console.error('認証確認エラー:', error);
      // バックエンドが動いていない場合はログアウトして続行
      logout();
      return false;
    }
  }, []);

  /**
   * メールアドレス認証
   */
  const verifyEmail = async (token: string) => {
    dispatch({ type: 'EMAIL_VERIFICATION_START' });
    
    try {
      const response = await authApi.verifyEmail(token);
      dispatch({
        type: 'EMAIL_VERIFICATION_SUCCESS',
        payload: { message: response.message },
      });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'メール認証に失敗しました';
      dispatch({
        type: 'EMAIL_VERIFICATION_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * 認証メール再送信
   */
  const resendVerificationEmail = async (email: string) => {
    dispatch({ type: 'EMAIL_RESEND_START' });
    
    try {
      const response = await authApi.resendVerificationEmail(email);
      dispatch({
        type: 'EMAIL_RESEND_SUCCESS',
        payload: { message: response.message },
      });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'メール再送信に失敗しました';
      dispatch({
        type: 'EMAIL_RESEND_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    emailVerificationState: state.emailVerificationState,
    login,
    register,
    logout,
    checkAuth,
    verifyEmail,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 認証コンテキストを使用するカスタムフック
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};