/**
 * ゲームメモ関連の型定義
 */
import { MEMO_CONSTANTS } from '../constants/gameFeatureConstants';

/**
 * ゲームメモ
 */
export interface GameMemo {
  /** メモID */
  id: number;
  /** ユーザーID */
  user_id: number;
  /** ゲームID */
  game_id: number;
  /** メモ内容 */
  memo: string;
  /** 作成日時（ISO文字列） */
  created_at?: string;
  /** 更新日時（ISO文字列） */
  updated_at?: string;
}

/**
 * ゲームメモ作成/更新データ
 */
export interface GameMemoFormData {
  /** メモ内容 */
  memo: string;
}

/**
 * メモの最大文字数
 */
export const MEMO_MAX_LENGTH = MEMO_CONSTANTS.MAX_LENGTH;

/**
 * メモの警告文字数（最大文字数の80%）
 */
export const MEMO_WARNING_LENGTH = Math.floor(MEMO_CONSTANTS.MAX_LENGTH * MEMO_CONSTANTS.WARNING_RATIO);

/**
 * メモが空でないかチェック
 */
export const hasMemoContent = (memo: GameMemo | string): boolean => {
  const content = typeof memo === 'string' ? memo : memo?.memo;
  return content != null && content.trim() !== '';
};

/**
 * メモの文字数を取得
 */
export const getMemoLength = (memo: GameMemo | string): number => {
  const content = typeof memo === 'string' ? memo : memo?.memo;
  return content ? content.length : 0;
};

/**
 * メモが文字数制限を超えているかチェック
 */
export const isMemoTooLong = (memo: GameMemo | string): boolean => {
  return getMemoLength(memo) > MEMO_MAX_LENGTH;
};

/**
 * メモが警告文字数を超えているかチェック
 */
export const isMemoNearLimit = (memo: GameMemo | string): boolean => {
  return getMemoLength(memo) > MEMO_WARNING_LENGTH;
};