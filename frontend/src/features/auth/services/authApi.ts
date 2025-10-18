import api from '../../../services/api';
import { createLogger } from '../../../utils/logging/logger';

const logger = createLogger('AuthAPI');

/**
 * 認証API関連の関数
 */
export const authApi = {
  /**
   * ユーザー登録
   * @param {import('../../../types/auth').RegisterData} registerData
   * @returns {Promise<import('../../../types/auth').AuthResponse>}
   */
  register: async (registerData) => {
    try {
      logger.logApiCall('POST', '/users/register', { username: registerData.username, email: registerData.email });
      const response = await api.post('/users/register', registerData);
      logger.logApiSuccess('POST', '/users/register', response.status);
      return response.data;
    } catch (error) {
      logger.logApiError('POST', '/users/register', error);
      throw error;
    }
  },

  /**
   * ログイン
   * @param {import('../../../types/auth').LoginCredentials} credentials
   * @returns {Promise<import('../../../types/auth').AuthResponse>}
   */
  login: async (credentials) => {
    try {
      logger.logApiCall('POST', '/users/login', { username: credentials.username });
      // URLSearchParamsを使用（FastAPIのOAuth2PasswordRequestForm形式）
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await api.post('/users/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      logger.logApiSuccess('POST', '/users/login', response.status);
      return response.data;
    } catch (error) {
      logger.logApiError('POST', '/users/login', error);
      throw error;
    }
  },

  /**
   * 現在のユーザー情報取得
   * @returns {Promise<import('../../../types/auth').User>}
   */
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * ユーザー情報更新
   * @param {Partial<import('../../../types/auth').User>} userData 
   * @returns {Promise<import('../../../types/auth').User>}
   */
  updateUser: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  /**
   * アカウント削除
   * @returns {Promise<void>}
   */
  deleteAccount: async () => {
    await api.delete('/users/me');
  },

  /**
   * メールアドレス認証
   * @param {string} token 認証トークン
   * @returns {Promise<import('../../../types/auth').MessageResponse>}
   */
  verifyEmail: async (token) => {
    const response = await api.post('/users/verify-email', { token });
    return response.data;
  },

  /**
   * 認証メール再送信
   * @param {string} email メールアドレス
   * @returns {Promise<import('../../../types/auth').MessageResponse>}
   */
  resendVerificationEmail: async (email) => {
    const response = await api.post('/users/resend-verification', { email });
    return response.data;
  },
};