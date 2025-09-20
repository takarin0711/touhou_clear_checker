import api from '../../../services/api';

/**
 * ゲーム機体API関連の関数（統合game_charactersテーブル対応）
 */
export const gameCharacterApi = {
  /**
   * ゲーム別機体一覧取得
   * @param {number} gameId - ゲームID
   * @returns {Promise<Array>} 機体一覧
   */
  getGameCharacters: async (gameId) => {
    const response = await api.get(`/game-characters/${gameId}/characters`);
    return response.data;
  },

  /**
   * 機体ID別機体取得
   * @param {number} characterId - 機体ID
   * @returns {Promise<Object>} 機体情報
   */
  getGameCharacterById: async (characterId) => {
    const response = await api.get(`/game-characters/characters/${characterId}`);
    return response.data;
  },

  /**
   * ゲーム機体作成（管理者のみ）
   * @param {number} gameId - ゲームID
   * @param {Object} characterData - 機体データ
   * @param {string} characterData.character_name - 機体名
   * @param {string} [characterData.description] - 機体説明
   * @param {number} [characterData.sort_order] - ソート順序
   * @returns {Promise<Object>} 作成された機体情報
   */
  createGameCharacter: async (gameId, characterData) => {
    const response = await api.post(`/game-characters/${gameId}/characters`, characterData);
    return response.data;
  },

  /**
   * ゲーム機体更新（管理者のみ）
   * @param {number} characterId - 機体ID
   * @param {Object} characterData - 更新する機体データ
   * @param {string} [characterData.character_name] - 機体名
   * @param {string} [characterData.description] - 機体説明
   * @param {number} [characterData.sort_order] - ソート順序
   * @returns {Promise<Object>} 更新された機体情報
   */
  updateGameCharacter: async (characterId, characterData) => {
    const response = await api.put(`/game-characters/characters/${characterId}`, characterData);
    return response.data;
  },

  /**
   * ゲーム機体削除（管理者のみ）
   * @param {number} characterId - 機体ID
   * @returns {Promise<Object>} 削除結果
   */
  deleteGameCharacter: async (characterId) => {
    const response = await api.delete(`/game-characters/characters/${characterId}`);
    return response.data;
  },

  /**
   * ゲーム別機体数取得
   * @param {number} gameId - ゲームID
   * @returns {Promise<Object>} 機体数情報
   */
  getGameCharacterCount: async (gameId) => {
    const response = await api.get(`/game-characters/${gameId}/characters/count`);
    return response.data;
  },

  /**
   * ゲーム機体をキャラクター名でフィルタリング（フロントエンド側）
   * @param {Array} characters - 機体一覧
   * @param {string} searchTerm - 検索語句
   * @returns {Array} フィルタリング後の機体一覧
   */
  filterCharactersByName: (characters, searchTerm) => {
    if (!searchTerm) return characters;
    
    const term = searchTerm.toLowerCase();
    return characters.filter(character => 
      character.character_name.toLowerCase().includes(term) ||
      (character.description && character.description.toLowerCase().includes(term))
    );
  },
};