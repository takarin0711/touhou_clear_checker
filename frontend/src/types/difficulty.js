/**
 * 難易度関連の定数と共通関数
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

/**
 * 基本難易度の表示順序（全作品共通）
 */
export const BASE_DIFFICULTY_ORDER = [
  DIFFICULTIES.EASY,
  DIFFICULTIES.NORMAL,
  DIFFICULTIES.HARD,
  DIFFICULTIES.LUNATIC,
  DIFFICULTIES.EXTRA
];

/**
 * 全難易度の表示順序（デフォルト）
 */
export const DIFFICULTY_ORDER = [
  DIFFICULTIES.EASY,
  DIFFICULTIES.NORMAL,
  DIFFICULTIES.HARD,
  DIFFICULTIES.LUNATIC,
  DIFFICULTIES.EXTRA,
  DIFFICULTIES.PHANTASM
];

/**
 * ゲームに応じた難易度順序を取得
 * @param {Object} game - ゲームオブジェクト
 * @param {string} mode - ゲームモード（省略時は"normal"）
 * @returns {Array} 難易度配列
 */
export const getDifficultyOrderForGame = (game, mode = 'normal') => {
  if (!game) return BASE_DIFFICULTY_ORDER;
  
  // 紺珠伝の特殊モード対応
  if (game.series_number === 15) { // 紺珠伝
    if (mode === 'legacy') {
      return [DIFFICULTIES.EASY, DIFFICULTIES.NORMAL, DIFFICULTIES.HARD, DIFFICULTIES.LUNATIC, DIFFICULTIES.EXTRA];
    } else if (mode === 'pointdevice') {
      return [DIFFICULTIES.EASY, DIFFICULTIES.NORMAL, DIFFICULTIES.HARD, DIFFICULTIES.LUNATIC];
    }
  }
  
  // 基本難易度を構築
  let difficulties = [
    DIFFICULTIES.EASY,
    DIFFICULTIES.NORMAL,
    DIFFICULTIES.HARD,
    DIFFICULTIES.LUNATIC
  ];
  
  // Extra難易度は獣王園（シリーズ番号19）以外で追加
  if (game.series_number !== 19) {
    difficulties.push(DIFFICULTIES.EXTRA);
  }
  
  // Phantasm難易度は妖々夢（シリーズ番号7）のみで追加
  if (game.series_number === 7) {
    difficulties.push(DIFFICULTIES.PHANTASM);
  }
  
  return difficulties;
};