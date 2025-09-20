import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants/apiConstants';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
  },
});

// リクエストインターセプター（認証トークンの自動付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `${API_CONFIG.HEADERS.AUTHORIZATION_PREFIX}${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === API_CONFIG.STATUS_CODES.UNAUTHORIZED) {
      // 認証エラーの場合、トークンをクリアしてログイン画面へ
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;