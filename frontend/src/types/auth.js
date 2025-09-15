// 認証関連の型定義

/**
 * @typedef {Object} User
 * @property {number} id - ユーザーID
 * @property {string} username - ユーザー名
 * @property {string} email - メールアドレス
 * @property {boolean} is_active - アクティブフラグ
 * @property {boolean} is_admin - 管理者フラグ
 * @property {string} created_at - 作成日時
 * @property {string} updated_at - 更新日時
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username - ユーザー名
 * @property {string} password - パスワード
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} username - ユーザー名
 * @property {string} email - メールアドレス
 * @property {string} password - パスワード
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} access_token - アクセストークン
 * @property {string} token_type - トークンタイプ
 * @property {User} user - ユーザー情報
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user - 現在のユーザー
 * @property {string|null} token - 認証トークン
 * @property {boolean} isLoading - ローディング状態
 * @property {function} login - ログイン関数
 * @property {function} register - 登録関数
 * @property {function} logout - ログアウト関数
 * @property {function} checkAuth - 認証状態確認関数
 */

export {};