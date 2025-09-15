import axios from 'axios';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // 直接バックエンドを指定
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの自動付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // 認証エラーの場合、トークンをクリアしてログイン画面へ
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;