/**
 * キャラクター関連の型定義
 * JSDocを使用してTypeScriptライクな型チェックを提供
 */

/**
 * キャラクター情報
 * @typedef {Object} Character
 * @property {number} id - キャラクターID
 * @property {string} name - キャラクター名（例: "霊夢A", "魔理沙&アリス（タッグ）"）
 * @property {string} [created_at] - 作成日時（ISO文字列）
 * @property {string} [updated_at] - 更新日時（ISO文字列）
 */

/**
 * キャラクター作成/更新データ
 * @typedef {Object} CharacterFormData
 * @property {string} name - キャラクター名
 */

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
 * @param {string} name - キャラクター名
 * @returns {string} キャラクタータイプ
 */
export const getCharacterType = (name) => {
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
 * @param {string} name - キャラクター名
 * @returns {string} 基本名（例: "霊夢A" → "霊夢"）
 */
export const getCharacterBaseName = (name) => {
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