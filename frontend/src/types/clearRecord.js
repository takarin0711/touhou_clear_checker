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
 * @property {boolean} is_special_clear_1 - 特殊クリア条件1（作品固有）
 * @property {boolean} is_special_clear_2 - 特殊クリア条件2（作品固有）
 * @property {boolean} is_special_clear_3 - 特殊クリア条件3（作品固有）
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
 * @property {boolean} is_special_clear_1 - 特殊クリア条件1（作品固有）
 * @property {boolean} is_special_clear_2 - 特殊クリア条件2（作品固有）
 * @property {boolean} is_special_clear_3 - 特殊クリア条件3（作品固有）
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
 * @property {boolean} special_clear_1 - 特殊クリア条件1（作品固有）
 * @property {boolean} special_clear_2 - 特殊クリア条件2（作品固有）
 * @property {boolean} special_clear_3 - 特殊クリア条件3（作品固有）
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
  FULL_SPELL_CARD: 'full_spell_card',
  SPECIAL_CLEAR_1: 'special_clear_1',
  SPECIAL_CLEAR_2: 'special_clear_2',
  SPECIAL_CLEAR_3: 'special_clear_3'
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
 * @param {number} gameId - ゲームID（特殊条件判定用）
 * @returns {string[]} クリア条件配列
 */
export const getClearConditionsForGameType = (gameType, gameId = null) => {
  let conditions = [];
  
  if (gameType === 'versus') {
    conditions = CLEAR_CONDITIONS_ARRAY_VERSUS;
  } else {
    conditions = CLEAR_CONDITIONS_ARRAY;
  }
  
  // 特殊クリア条件を持つゲーム
  if (gameId === 7) {
    // 星蓮船：ノーベントラー
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1];
  } else if (gameId === 8) {
    // 妖精大戦争：ノーアイス
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1];
  } else if (gameId === 9) {
    // 神霊廟：ノートランス
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1];
  } else if (gameId === 12) {
    // 天空璋：ノー季節解放
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1];
  } else if (gameId === 13) {
    // 鬼形獣：ノー暴走、ノー霊撃
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1, CLEAR_CONDITIONS.SPECIAL_CLEAR_2];
  } else if (gameId === 14) {
    // 虹龍洞：ノーカード
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1];
  }
  
  return conditions;
};

/**
 * クリア条件の表示ラベル
 */
export const CLEAR_CONDITION_LABELS = {
  [CLEAR_CONDITIONS.CLEARED]: 'クリア',
  [CLEAR_CONDITIONS.NO_CONTINUE]: 'ノーコンティニュー',
  [CLEAR_CONDITIONS.NO_BOMB]: 'ノーボム',
  [CLEAR_CONDITIONS.NO_MISS]: 'ノーミス',
  [CLEAR_CONDITIONS.FULL_SPELL_CARD]: 'フルスペカ',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_1]: '特殊条件1',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_2]: '特殊条件2',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_3]: '特殊条件3'
};

/**
 * ゲーム別の特殊クリア条件ラベル
 */
export const getSpecialClearLabel = (gameId, specialType) => {
  const labels = {
    7: { // 星蓮船
      special_clear_1: 'ノーベントラー'
    },
    8: { // 妖精大戦争
      special_clear_1: 'ノーアイス'
    },
    9: { // 神霊廟
      special_clear_1: 'ノートランス'
    },
    12: { // 天空璋
      special_clear_1: 'ノー季節解放'
    },
    13: { // 鬼形獣
      special_clear_1: 'ノー暴走',
      special_clear_2: 'ノー霊撃'
    },
    14: { // 虹龍洞
      special_clear_1: 'ノーカード'
    }
  };
  
  return labels[gameId]?.[specialType] || `特殊条件${specialType.slice(-1)}`;
};

/**
 * クリア条件の説明
 */
export const CLEAR_CONDITION_DESCRIPTIONS = {
  [CLEAR_CONDITIONS.CLEARED]: '通常クリア',
  [CLEAR_CONDITIONS.NO_CONTINUE]: 'コンティニューなしでクリア',
  [CLEAR_CONDITIONS.NO_BOMB]: 'ボムを使わずにクリア',
  [CLEAR_CONDITIONS.NO_MISS]: '被弾なしでクリア',
  [CLEAR_CONDITIONS.FULL_SPELL_CARD]: '全スペルカード取得',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_1]: '特殊クリア条件1',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_2]: '特殊クリア条件2',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_3]: '特殊クリア条件3'
};

/**
 * ゲーム別の特殊クリア条件説明
 */
export const getSpecialClearDescription = (gameId, specialType) => {
  const descriptions = {
    7: { // 星蓮船
      special_clear_1: 'ベントラーを使用せずにクリア'
    },
    8: { // 妖精大戦争
      special_clear_1: 'アイスバリアを使用せずにクリア'
    },
    9: { // 神霊廟
      special_clear_1: 'トランスを使用せずにクリア'
    },
    12: { // 天空璋
      special_clear_1: 'シーズンリリースを使用せずにクリア'
    },
    13: { // 鬼形獣
      special_clear_1: 'ロアリングモードを使用せずにクリア',
      special_clear_2: 'ハイパーモードを使用せずにクリア'
    },
    14: { // 虹龍洞
      special_clear_1: 'アビリティカードを使用せずにクリア'
    }
  };
  
  return descriptions[gameId]?.[specialType] || `特殊クリア条件${specialType.slice(-1)}`;
};

/**
 * クリア条件の色（Tailwind CSS）
 */
export const CLEAR_CONDITION_COLORS = {
  [CLEAR_CONDITIONS.CLEARED]: 'text-blue-600',
  [CLEAR_CONDITIONS.NO_CONTINUE]: 'text-green-600',
  [CLEAR_CONDITIONS.NO_BOMB]: 'text-orange-600',
  [CLEAR_CONDITIONS.NO_MISS]: 'text-red-600',
  [CLEAR_CONDITIONS.FULL_SPELL_CARD]: 'text-purple-600',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_1]: 'text-cyan-600',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_2]: 'text-pink-600',
  [CLEAR_CONDITIONS.SPECIAL_CLEAR_3]: 'text-indigo-600'
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
  if (clearRecord.is_special_clear_1) conditions.push(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
  if (clearRecord.is_special_clear_2) conditions.push(CLEAR_CONDITIONS.SPECIAL_CLEAR_2);
  if (clearRecord.is_special_clear_3) conditions.push(CLEAR_CONDITIONS.SPECIAL_CLEAR_3);
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
         clearRecord.is_full_spell_card ||
         clearRecord.is_special_clear_1 ||
         clearRecord.is_special_clear_2 ||
         clearRecord.is_special_clear_3;
};