/**
 * バリデーション関連の定数定義
 */

export const VALIDATION_CONSTANTS = {
  // ユーザー名バリデーション
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  
  // パスワードバリデーション
  PASSWORD_MIN_LENGTH: 6,
  
  // HTTPステータスコード
  HTTP_NOT_FOUND: 404,
  
  // ゲーム機体バリデーション
  CHARACTER_NAME_MIN_LENGTH: 1,
  CHARACTER_NAME_MAX_LENGTH: 100,
  CHARACTER_DESCRIPTION_MAX_LENGTH: 500,
} as const;

export type ValidationConstants = typeof VALIDATION_CONSTANTS;