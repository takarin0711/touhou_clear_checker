/**
 * 時間関連の定数定義
 * マジックナンバーを避けるため、時間に関する値を集約管理
 */
export const TIME_CONSTANTS = {
  /** メール再送信のクールダウン時間（秒） */
  EMAIL_RESEND_COOLDOWN_SECONDS: 60,
  
  /** タイマーの更新間隔（ミリ秒） */
  TIMER_INTERVAL_MS: 1000,
  
  /** API通信のタイムアウト時間（ミリ秒） */
  API_TIMEOUT_MS: 5000,
} as const;