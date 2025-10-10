/**
 * クリア記録関連の型定義（機体別条件対応）
 */

/**
 * クリア記録
 */
export interface ClearRecord {
  /** 記録ID */
  id: number;
  /** ユーザーID */
  user_id: number;
  /** ゲームID */
  game_id: number;
  /** キャラクターID */
  character_id: number;
  /** 難易度 */
  difficulty: string;
  /** ゲームモード（紺珠伝など） */
  mode?: string;
  /** キャラクター名 */
  character_name?: string;
  /** 通常クリア */
  is_cleared: boolean;
  /** ノーコンティニュークリア */
  is_no_continue_clear: boolean;
  /** ノーボムクリア */
  is_no_bomb_clear: boolean;
  /** ノーミスクリア */
  is_no_miss_clear: boolean;
  /** フルスペルカード取得 */
  is_full_spell_card: boolean;
  /** 特殊クリア条件1（作品固有） */
  is_special_clear_1: boolean;
  /** 特殊クリア条件2（作品固有） */
  is_special_clear_2: boolean;
  /** 特殊クリア条件3（作品固有） */
  is_special_clear_3: boolean;
  /** クリア日（YYYY-MM-DD） */
  cleared_at?: string;
  /** 最終更新日時（ISO文字列） */
  last_updated_at?: string;
  /** 作成日時（ISO文字列） */
  created_at?: string;
}

/**
 * クリア記録作成/更新データ
 */
export interface ClearRecordFormData {
  /** ゲームID */
  game_id: number;
  /** キャラクターID */
  character_id: number;
  /** 難易度 */
  difficulty: string;
  /** ゲームモード（紺珠伝など） */
  mode?: string;
  /** 通常クリア */
  is_cleared: boolean;
  /** ノーコンティニュークリア */
  is_no_continue_clear: boolean;
  /** ノーボムクリア */
  is_no_bomb_clear: boolean;
  /** ノーミスクリア */
  is_no_miss_clear: boolean;
  /** フルスペルカード取得 */
  is_full_spell_card: boolean;
  /** 特殊クリア条件1（作品固有） */
  is_special_clear_1: boolean;
  /** 特殊クリア条件2（作品固有） */
  is_special_clear_2: boolean;
  /** 特殊クリア条件3（作品固有） */
  is_special_clear_3: boolean;
  /** クリア日（YYYY-MM-DD） */
  cleared_at?: string;
}

/**
 * 機体別条件データ（タブ式UI用）
 */
export interface IndividualConditionData {
  /** 通常クリア */
  cleared: boolean;
  /** ノーコンティニュークリア */
  no_continue: boolean;
  /** ノーボムクリア */
  no_bomb: boolean;
  /** ノーミスクリア */
  no_miss: boolean;
  /** フルスペルカード取得 */
  full_spell_card: boolean;
  /** 特殊クリア条件1（作品固有） */
  special_clear_1: boolean;
  /** 特殊クリア条件2（作品固有） */
  special_clear_2: boolean;
  /** 特殊クリア条件3（作品固有） */
  special_clear_3: boolean;
}

/**
 * 難易度別データ（タブ式UI用）
 */
export interface DifficultyData {
  /** キャラクターID → 条件データのマップ */
  characters: Record<string, IndividualConditionData>;
}

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
 */
export const getClearConditionsForGameType = (gameType: string, gameId: number | null = null): string[] => {
  let conditions: string[] = [];
  
  if (gameType === 'versus') {
    conditions = CLEAR_CONDITIONS_ARRAY_VERSUS;
  } else {
    conditions = CLEAR_CONDITIONS_ARRAY;
  }
  
  // 特殊クリア条件を持つゲーム
  if (gameId === 2) {
    // 妖々夢：ノー結界
    conditions = [...conditions, CLEAR_CONDITIONS.SPECIAL_CLEAR_1];
  } else if (gameId === 7) {
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
export const getSpecialClearLabel = (gameId: number, specialType: string): string => {
  const labels = {
    2: { // 妖々夢
      special_clear_1: 'ノー結界'
    },
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
export const getSpecialClearDescription = (gameId: number, specialType: string): string => {
  const descriptions = {
    2: { // 妖々夢
      special_clear_1: '結界を使用せずにクリア'
    },
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
 */
export const getAchievedConditions = (clearRecord: ClearRecord): string[] => {
  const conditions: string[] = [];
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
 */
export const hasAnyCondition = (clearRecord: ClearRecord): boolean => {
  return clearRecord.is_cleared || 
         clearRecord.is_no_continue_clear || 
         clearRecord.is_no_bomb_clear || 
         clearRecord.is_no_miss_clear ||
         clearRecord.is_full_spell_card ||
         clearRecord.is_special_clear_1 ||
         clearRecord.is_special_clear_2 ||
         clearRecord.is_special_clear_3;
};