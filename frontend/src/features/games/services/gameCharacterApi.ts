import api from '../../../services/api';
import { GameCharacter, GameCharacterFormData, GameCharacterCount, GameCharacterListResponse } from '../../../types/gameCharacter';

/**
 * ゲーム機体API関連の関数（統合game_charactersテーブル対応）
 */
export const gameCharacterApi = {
  /**
   * ゲーム別機体一覧取得
   * @param gameId - ゲームID
   * @returns 機体一覧
   */
  getGameCharacters: async (gameId: number): Promise<GameCharacter[]> => {
    const response = await api.get<GameCharacterListResponse>(`/game-characters/${gameId}/characters`);
    return response.data.game_characters;
  },

  /**
   * 機体ID別機体取得
   * @param characterId - 機体ID
   * @returns 機体情報
   */
  getGameCharacterById: async (characterId: number): Promise<GameCharacter> => {
    const response = await api.get(`/game-characters/characters/${characterId}`);
    return response.data;
  },

  /**
   * ゲーム機体作成（管理者のみ）
   * @param gameId - ゲームID
   * @param characterData - 機体データ
   * @returns 作成された機体情報
   */
  createGameCharacter: async (gameId: number, characterData: GameCharacterFormData): Promise<GameCharacter> => {
    const response = await api.post(`/game-characters/${gameId}/characters`, characterData);
    return response.data;
  },

  /**
   * ゲーム機体更新（管理者のみ）
   * @param characterId - 機体ID
   * @param characterData - 更新する機体データ
   * @returns 更新された機体情報
   */
  updateGameCharacter: async (characterId: number, characterData: GameCharacterFormData): Promise<GameCharacter> => {
    const response = await api.put(`/game-characters/characters/${characterId}`, characterData);
    return response.data;
  },

  /**
   * ゲーム機体削除（管理者のみ）
   * @param characterId - 機体ID
   * @returns 削除結果
   */
  deleteGameCharacter: async (characterId: number): Promise<any> => {
    const response = await api.delete(`/game-characters/characters/${characterId}`);
    return response.data;
  },

  /**
   * ゲーム別機体数取得
   * @param gameId - ゲームID
   * @returns 機体数情報
   */
  getGameCharacterCount: async (gameId: number): Promise<GameCharacterCount> => {
    const response = await api.get(`/game-characters/${gameId}/characters/count`);
    return response.data;
  },

  /**
   * ゲーム機体をキャラクター名でフィルタリング（フロントエンド側）
   * @param characters - 機体一覧
   * @param searchTerm - 検索語句
   * @returns フィルタリング後の機体一覧
   */
  filterCharactersByName: (characters: GameCharacter[], searchTerm: string): GameCharacter[] => {
    if (!searchTerm) return characters;
    
    const term = searchTerm.toLowerCase();
    return characters.filter(character => 
      character.character_name.toLowerCase().includes(term) ||
      (character.description && character.description.toLowerCase().includes(term))
    );
  },
};