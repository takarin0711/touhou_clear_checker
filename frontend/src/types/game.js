// ゲーム関連の型定義

/**
 * @typedef {Object} Game
 * @property {number} id - ゲームID
 * @property {string} title - ゲームタイトル
 * @property {number} series_number - シリーズ番号（12.8など小数点対応）
 * @property {number} release_year - リリース年
 * @property {string} game_type - ゲームタイプ（main_series, fighting等）
 */

/**
 * @typedef {Object} GameListResponse
 * @property {Game[]} games - ゲーム一覧
 */

/**
 * @typedef {Object} GameFilter
 * @property {number|null} series_number - シリーズ番号フィルター
 * @property {string|null} game_type - ゲームタイプフィルター
 * @property {string|null} search - タイトル検索
 */

/**
 * @typedef {Object} GameType
 * @property {string} MAIN_SERIES - 本編STG
 * @property {string} FIGHTING - 格闘ゲーム
 * @property {string} PHOTOGRAPHY - 撮影STG
 * @property {string} MIXED - 格闘+STG要素
 */

export const GAME_TYPES = {
  MAIN_SERIES: 'main_series',
  FIGHTING: 'fighting',
  PHOTOGRAPHY: 'photography',
  MIXED: 'mixed',
};

export const GAME_TYPE_LABELS = {
  [GAME_TYPES.MAIN_SERIES]: '本編STG',
  [GAME_TYPES.FIGHTING]: '格闘ゲーム',
  [GAME_TYPES.PHOTOGRAPHY]: '撮影STG',
  [GAME_TYPES.MIXED]: '格闘+STG',
};

export {};