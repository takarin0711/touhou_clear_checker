/**
 * ゲーム機体関連の型定義
 */

/**
 * ゲーム機体情報
 */
export interface GameCharacter {
  /** 機体ID */
  id: number;
  /** ゲームID */
  game_id: number;
  /** 機体名（例: "霊夢A", "魔理沙&アリス（タッグ）"） */
  character_name: string;
  /** 機体説明（オプション） */
  description?: string;
  /** ソート順序 */
  sort_order: number;
  /** 作成日時（ISO文字列） */
  created_at?: string;
  /** 更新日時（ISO文字列） */
  updated_at?: string;
}

/**
 * ゲーム機体作成/更新データ
 */
export interface GameCharacterFormData {
  /** 機体名 */
  character_name: string;
  /** 機体説明（オプション） */
  description?: string;
  /** ソート順序（オプション、デフォルトで自動採番） */
  sort_order?: number;
}

/**
 * ゲーム機体一覧レスポンス
 */
export interface GameCharacterListResponse {
  /** ゲーム機体一覧 */
  game_characters: GameCharacter[];
  /** 総数 */
  total_count: number;
}

/**
 * ゲーム機体数情報
 */
export interface GameCharacterCount {
  /** 機体数 */
  character_count: number;
}