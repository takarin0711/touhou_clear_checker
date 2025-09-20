/**
 * API関連の定数定義
 */

/**
 * API設定の定数
 */
export const API_CONFIG = {
  // ベースURL
  BASE_URL: 'http://localhost:8000/api/v1',
  
  // タイムアウト設定（ミリ秒）
  TIMEOUT: 5000,
  
  // HTTPステータスコード
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // リクエストヘッダー
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION_PREFIX: 'Bearer '
  }
};

/**
 * APIエンドポイントの定数
 */
export const API_ENDPOINTS = {
  // 認証関連
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    ME: '/users/me'
  },
  
  // ゲーム関連
  GAMES: {
    LIST: '/games',
    DETAIL: (id) => `/games/${id}`,
    CHARACTERS: (id) => `/games/${id}/characters`
  },
  
  // クリア状況関連
  CLEAR_STATUS: {
    LIST: '/clear-status',
    BY_GAME: (gameId) => `/clear-status/game/${gameId}`,
    DETAIL: (id) => `/clear-status/${id}`,
    CREATE: '/clear-status',
    UPDATE: (id) => `/clear-status/${id}`,
    DELETE: (id) => `/clear-status/${id}`
  },
  
  // クリア記録関連
  CLEAR_RECORDS: {
    LIST: '/clear-records',
    CREATE: '/clear-records',
    DETAIL: (id) => `/clear-records/${id}`,
    UPDATE: (id) => `/clear-records/${id}`,
    DELETE: (id) => `/clear-records/${id}`
  },
  
  // ゲームメモ関連
  GAME_MEMOS: {
    BY_GAME: (gameId) => `/game-memos/${gameId}`,
    CREATE: '/game-memos',
    UPDATE: (id) => `/game-memos/${id}`,
    DELETE: (id) => `/game-memos/${id}`
  }
};

/**
 * ローカルストレージのキー定数
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user'
};

/**
 * API関連のエラーメッセージ定数
 */
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
  TIMEOUT_ERROR: 'リクエストがタイムアウトしました。しばらく後にお試しください。',
  UNAUTHORIZED: '認証に失敗しました。ログインし直してください。',
  FORBIDDEN: 'この操作を行う権限がありません。',
  NOT_FOUND: '要求されたリソースが見つかりません。',
  SERVER_ERROR: 'サーバーエラーが発生しました。時間をおいてお試しください。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。'
};