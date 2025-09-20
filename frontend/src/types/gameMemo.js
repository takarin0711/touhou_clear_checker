/**
 * ゲームメモ関連の型定義
 * JSDocを使用してTypeScriptライクな型チェックを提供
 */

/**
 * ゲームメモ
 * @typedef {Object} GameMemo
 * @property {number} id - メモID
 * @property {number} user_id - ユーザーID
 * @property {number} game_id - ゲームID
 * @property {string} memo - メモ内容
 * @property {string} [created_at] - 作成日時（ISO文字列）
 * @property {string} [updated_at] - 更新日時（ISO文字列）
 */

/**
 * ゲームメモ作成/更新データ
 * @typedef {Object} GameMemoFormData
 * @property {string} memo - メモ内容
 */

/**
 * メモの最大文字数
 */
export const MEMO_MAX_LENGTH = 2000;

/**
 * メモの警告文字数（最大文字数の80%）
 */
export const MEMO_WARNING_LENGTH = Math.floor(MEMO_MAX_LENGTH * 0.8);

/**
 * メモが空でないかチェック
 * @param {GameMemo|string} memo - ゲームメモオブジェクトまたはメモ文字列
 * @returns {boolean} メモが空でない場合true
 */
export const hasMemoContent = (memo) => {
  const content = typeof memo === 'string' ? memo : memo?.memo;
  return content != null && content.trim() !== '';
};

/**
 * メモの文字数を取得
 * @param {GameMemo|string} memo - ゲームメモオブジェクトまたはメモ文字列
 * @returns {number} メモの文字数
 */
export const getMemoLength = (memo) => {
  const content = typeof memo === 'string' ? memo : memo?.memo;
  return content ? content.length : 0;
};

/**
 * メモが文字数制限を超えているかチェック
 * @param {GameMemo|string} memo - ゲームメモオブジェクトまたはメモ文字列
 * @returns {boolean} 文字数制限を超えている場合true
 */
export const isMemoTooLong = (memo) => {
  return getMemoLength(memo) > MEMO_MAX_LENGTH;
};

/**
 * メモが警告文字数を超えているかチェック
 * @param {GameMemo|string} memo - ゲームメモオブジェクトまたはメモ文字列
 * @returns {boolean} 警告文字数を超えている場合true
 */
export const isMemoNearLimit = (memo) => {
  return getMemoLength(memo) > MEMO_WARNING_LENGTH;
};