/**
 * ゲーム特殊機能関連の定数定義
 * 特定のゲームIDに依存する機能の設定を集約管理
 */
export const SPECIAL_CLEAR_GAME_IDS = {
  /** 特殊クリア条件1を持つゲームID配列 */
  SPECIAL_CLEAR_1_GAMES: [7, 8, 9, 12, 13, 14] as number[],
  
  /** 特殊クリア条件2を持つゲームID配列（鬼形獣のみ） */
  SPECIAL_CLEAR_2_GAMES: [13] as number[],
} as const;

/**
 * メモ機能関連の定数定義
 */
export const MEMO_CONSTANTS = {
  /** メモの最大文字数 */
  MAX_LENGTH: 2000,
  
  /** 警告表示の閾値割合（80%） */
  WARNING_RATIO: 0.8,
} as const;