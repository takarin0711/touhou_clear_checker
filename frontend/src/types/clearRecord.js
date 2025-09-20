/**
 * クリア記録関連の型定義（機体別条件対応）
 * JSDocを使用してTypeScriptライクな型チェックを提供
 */

/**
 * クリア記録
 * @typedef {Object} ClearRecord
 * @property {number} id - 記録ID
 * @property {number} user_id - ユーザーID
 * @property {number} game_id - ゲームID
 * @property {number} character_id - キャラクターID
 * @property {string} difficulty - 難易度
 * @property {boolean} is_cleared - 通常クリア
 * @property {boolean} is_no_continue_clear - ノーコンティニュークリア
 * @property {boolean} is_no_bomb_clear - ノーボムクリア
 * @property {boolean} is_no_miss_clear - ノーミスクリア
 * @property {boolean} is_full_spell_card - フルスペルカード取得
 * @property {string} [cleared_at] - クリア日（YYYY-MM-DD）
 * @property {string} [last_updated_at] - 最終更新日時（ISO文字列）
 * @property {string} [created_at] - 作成日時（ISO文字列）
 */

/**
 * クリア記録作成/更新データ
 * @typedef {Object} ClearRecordFormData
 * @property {number} game_id - ゲームID
 * @property {number} character_id - キャラクターID
 * @property {string} difficulty - 難易度
 * @property {boolean} is_cleared - 通常クリア
 * @property {boolean} is_no_continue_clear - ノーコンティニュークリア
 * @property {boolean} is_no_bomb_clear - ノーボムクリア
 * @property {boolean} is_no_miss_clear - ノーミスクリア
 * @property {boolean} is_full_spell_card - フルスペルカード取得
 * @property {string} [cleared_at] - クリア日（YYYY-MM-DD）
 */

/**
 * 機体別条件データ（タブ式UI用）
 * @typedef {Object} IndividualConditionData
 * @property {boolean} cleared - 通常クリア
 * @property {boolean} no_continue - ノーコンティニュークリア
 * @property {boolean} no_bomb - ノーボムクリア
 * @property {boolean} no_miss - ノーミスクリア
 * @property {boolean} full_spell_card - フルスペルカード取得
 */

/**
 * 難易度別データ（タブ式UI用）
 * @typedef {Object} DifficultyData
 * @property {Object.<string, IndividualConditionData>} characters - キャラクターID → 条件データのマップ
 */

/**
 * クリア条件の種類
 */
export const CLEAR_CONDITIONS = {
  CLEARED: 'cleared',
  NO_CONTINUE: 'no_continue',
  NO_BOMB: 'no_bomb',
  NO_MISS: 'no_miss',
  FULL_SPELL_CARD: 'full_spell_card'
};

/**
 * クリア条件の配列（map用）
 */
export const CLEAR_CONDITIONS_ARRAY = [
  CLEAR_CONDITIONS.CLEARED,
  CLEAR_CONDITIONS.NO_CONTINUE,
  CLEAR_CONDITIONS.NO_BOMB,
  CLEAR_CONDITIONS.NO_MISS,
  CLEAR_CONDITIONS.FULL_SPELL_CARD
];

/**
 * 対戦型STG用のクリア条件配列（フルスペカなし）
 */
export const CLEAR_CONDITIONS_ARRAY_VERSUS = [
  CLEAR_CONDITIONS.CLEARED,
  CLEAR_CONDITIONS.NO_CONTINUE,
  CLEAR_CONDITIONS.NO_BOMB,
  CLEAR_CONDITIONS.NO_MISS
];

/**
 * ゲームタイプに応じたクリア条件配列を取得
 * @param {string} gameType - ゲームタイプ
 * @returns {string[]} クリア条件配列
 */
export const getClearConditionsForGameType = (gameType) => {
  if (gameType === 'versus') {
    return CLEAR_CONDITIONS_ARRAY_VERSUS;
  }
  return CLEAR_CONDITIONS_ARRAY;
};

/**
 * クリア条件の表示ラベル
 */
export const CLEAR_CONDITION_LABELS = {
  [CLEAR_CONDITIONS.CLEARED]: 'クリア',
  [CLEAR_CONDITIONS.NO_CONTINUE]: 'ノーコンティニュー',
  [CLEAR_CONDITIONS.NO_BOMB]: 'ノーボム',
  [CLEAR_CONDITIONS.NO_MISS]: 'ノーミス',
  [CLEAR_CONDITIONS.FULL_SPELL_CARD]: 'フルスペカ'
};

/**
 * クリア条件の説明
 */
export const CLEAR_CONDITION_DESCRIPTIONS = {
  [CLEAR_CONDITIONS.CLEARED]: '通常クリア',
  [CLEAR_CONDITIONS.NO_CONTINUE]: 'コンティニューなしでクリア',
  [CLEAR_CONDITIONS.NO_BOMB]: 'ボムを使わずにクリア',
  [CLEAR_CONDITIONS.NO_MISS]: '被弾なしでクリア',
  [CLEAR_CONDITIONS.FULL_SPELL_CARD]: '全スペルカード取得'
};

/**
 * クリア条件の色（Tailwind CSS）
 */
export const CLEAR_CONDITION_COLORS = {
  [CLEAR_CONDITIONS.CLEARED]: 'text-blue-600',
  [CLEAR_CONDITIONS.NO_CONTINUE]: 'text-green-600',
  [CLEAR_CONDITIONS.NO_BOMB]: 'text-orange-600',
  [CLEAR_CONDITIONS.NO_MISS]: 'text-red-600',
  [CLEAR_CONDITIONS.FULL_SPELL_CARD]: 'text-purple-600'
};

/**
 * クリア記録から達成済み条件を取得
 * @param {ClearRecord} clearRecord - クリア記録
 * @returns {string[]} 達成済み条件のキー配列
 */
export const getAchievedConditions = (clearRecord) => {
  const conditions = [];
  if (clearRecord.is_cleared) conditions.push(CLEAR_CONDITIONS.CLEARED);
  if (clearRecord.is_no_continue_clear) conditions.push(CLEAR_CONDITIONS.NO_CONTINUE);
  if (clearRecord.is_no_bomb_clear) conditions.push(CLEAR_CONDITIONS.NO_BOMB);
  if (clearRecord.is_no_miss_clear) conditions.push(CLEAR_CONDITIONS.NO_MISS);
  if (clearRecord.is_full_spell_card) conditions.push(CLEAR_CONDITIONS.FULL_SPELL_CARD);
  return conditions;
};

/**
 * クリア記録が何らかの条件を達成しているかチェック
 * @param {ClearRecord} clearRecord - クリア記録
 * @returns {boolean} 何らかの条件を達成している場合true
 */
export const hasAnyCondition = (clearRecord) => {
  return clearRecord.is_cleared || 
         clearRecord.is_no_continue_clear || 
         clearRecord.is_no_bomb_clear || 
         clearRecord.is_no_miss_clear ||
         clearRecord.is_full_spell_card;
};