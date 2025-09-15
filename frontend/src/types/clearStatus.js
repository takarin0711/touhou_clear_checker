/**
 * @typedef {Object} ClearStatus
 * @property {number} id - クリア状況ID
 * @property {number} game_id - ゲームID
 * @property {number} user_id - ユーザーID
 * @property {'Easy'|'Normal'|'Hard'|'Lunatic'|'Extra'|'Phantasm'} difficulty - 難易度
 * @property {boolean} is_cleared - クリア済みフラグ
 * @property {string|null} cleared_at - クリア日時
 * @property {boolean} no_continue_clear - ノーコンティニュークリア
 * @property {boolean} no_bomb_clear - ノーボムクリア  
 * @property {boolean} no_miss_clear - ノーミスクリア
 * @property {number|null} score - スコア
 * @property {string|null} memo - メモ
 */

/**
 * @typedef {Object} ClearStatusCreate
 * @property {number} game_id - ゲームID
 * @property {'Easy'|'Normal'|'Hard'|'Lunatic'|'Extra'|'Phantasm'} difficulty - 難易度
 * @property {boolean} is_cleared - クリア済みフラグ
 * @property {string|null} cleared_at - クリア日時
 * @property {boolean} no_continue_clear - ノーコンティニュークリア
 * @property {boolean} no_bomb_clear - ノーボムクリア
 * @property {boolean} no_miss_clear - ノーミスクリア
 * @property {number|null} score - スコア
 * @property {string|null} memo - メモ
 */

/**
 * @typedef {Object} ClearStatusUpdate
 * @property {boolean} is_cleared - クリア済みフラグ
 * @property {string|null} cleared_at - クリア日時
 * @property {boolean} no_continue_clear - ノーコンティニュークリア
 * @property {boolean} no_bomb_clear - ノーボムクリア
 * @property {boolean} no_miss_clear - ノーミスクリア
 * @property {number|null} score - スコア
 * @property {string|null} memo - メモ
 */

/**
 * 難易度の定数
 */
export const DIFFICULTIES = {
  EASY: 'Easy',
  NORMAL: 'Normal', 
  HARD: 'Hard',
  LUNATIC: 'Lunatic',
  EXTRA: 'Extra',
  PHANTASM: 'Phantasm'
};

/**
 * 難易度のラベル
 */
export const DIFFICULTY_LABELS = {
  [DIFFICULTIES.EASY]: 'Easy',
  [DIFFICULTIES.NORMAL]: 'Normal',
  [DIFFICULTIES.HARD]: 'Hard', 
  [DIFFICULTIES.LUNATIC]: 'Lunatic',
  [DIFFICULTIES.EXTRA]: 'Extra',
  [DIFFICULTIES.PHANTASM]: 'Phantasm'
};

/**
 * 難易度の色
 */
export const DIFFICULTY_COLORS = {
  [DIFFICULTIES.EASY]: 'green',
  [DIFFICULTIES.NORMAL]: 'blue',
  [DIFFICULTIES.HARD]: 'orange',
  [DIFFICULTIES.LUNATIC]: 'red',
  [DIFFICULTIES.EXTRA]: 'purple',
  [DIFFICULTIES.PHANTASM]: 'purple'
};