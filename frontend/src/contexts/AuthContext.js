import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../features/auth/services/authApi';

// 認証状態の管理
const authReducer = (state, action) => {
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
      };
    
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// コンテキストの作成
const AuthContext = createContext();

/**
 * 認証プロバイダーコンポーネント
 */
export const AuthProvider = ({ children }) => {
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
      } catch (error) {
        console.error('認証情報の復元に失敗:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  /**
   * ログイン
   */
  const login = async (credentials) => {
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
    } catch (error) {
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
  const register = async (registerData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.register(registerData);
      const { access_token, user } = response;

      // LocalStorageに保存
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token },
      });

      return { success: true };
    } catch (error) {
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
    } catch (error) {
      console.error('認証確認エラー:', error);
      logout();
      return false;
    }
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    checkAuth,
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};