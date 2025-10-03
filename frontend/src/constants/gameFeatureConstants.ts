/**
 * ゲーム特殊機能関連の定数定義
 * シリーズ番号ベースで管理（堅牢な設計）
 */
export const SPECIAL_CLEAR_SERIES_NUMBERS = {
  /** 特殊クリア条件1を持つシリーズ番号配列 */
  SPECIAL_CLEAR_1_GAMES: [12.0, 12.8, 13.0, 16.0, 17.0, 18.0] as number[],
  
  /** 特殊クリア条件2を持つシリーズ番号配列（鬼形獣のみ） */
  SPECIAL_CLEAR_2_GAMES: [17.0] as number[],
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