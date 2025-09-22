/**
 * キャラクター関連の型定義
 */

/**
 * キャラクター情報
 */
export interface Character {
  /** キャラクターID */
  id: number;
  /** キャラクター名（例: "霊夢A", "魔理沙&アリス（タッグ）"） */
  name: string;
  /** 作成日時（ISO文字列） */
  created_at?: string;
  /** 更新日時（ISO文字列） */
  updated_at?: string;
}

/**
 * キャラクター作成/更新データ
 */
export interface CharacterFormData {
  /** キャラクター名 */
  name: string;
}

export const CHARACTER_TYPES = {
  SOLO: 'solo',           // 単体キャラ（霊夢A等）
  PAIR_TAG: 'pair_tag',   // ペア・タッグ（霊夢&紫（タッグ））
  PAIR_SOLO: 'pair_solo', // ペア・単体（霊夢（単体））
  SPECIAL: 'special'      // 特殊（オオカミ等）
};

/**
 * キャラクタータイプの表示ラベル
 */
export const CHARACTER_TYPE_LABELS = {
  [CHARACTER_TYPES.SOLO]: '単体',
  [CHARACTER_TYPES.PAIR_TAG]: 'タッグ',
  [CHARACTER_TYPES.PAIR_SOLO]: '単体',
  [CHARACTER_TYPES.SPECIAL]: '特殊'
};

/**
 * キャラクター名から推定されるタイプを取得
 */
export const getCharacterType = (name: string): string => {
  if (name.includes('&') && name.includes('タッグ')) {
    return CHARACTER_TYPES.PAIR_TAG;
  }
  if (name.includes('（単体）')) {
    return CHARACTER_TYPES.PAIR_SOLO;
  }
  if (['オオカミ', 'カワウソ', 'オオワシ'].includes(name)) {
    return CHARACTER_TYPES.SPECIAL;
  }
  return CHARACTER_TYPES.SOLO;
};

/**
 * キャラクター名から基本名を抽出
 */
export const getCharacterBaseName = (name: string): string => {
  // ペアの場合
  if (name.includes('&')) {
    return name.split('&')[0].trim();
  }
  // 単体表記の場合
  if (name.includes('（')) {
    return name.split('（')[0].trim();
  }
  // ショットタイプ付きの場合
  const match = name.match(/^([^A-C]+)[A-C]?$/);
  if (match) {
    return match[1];
  }
  return name;
};