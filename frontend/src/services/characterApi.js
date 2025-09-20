/**
 * キャラクターAPI サービス
 */
import apiClient from './api';

/**
 * キャラクター関連のAPI呼び出し
 */
export const characterApi = {
  /**
   * 全キャラクター一覧を取得
   * @returns {Promise<Array>} キャラクター配列
   */
  async getAllCharacters() {
    const response = await apiClient.get('/characters');
    return response.data;
  },

  /**
   * IDでキャラクターを取得
   * @param {number} characterId - キャラクターID
   * @returns {Promise<Object>} キャラクター情報
   */
  async getCharacterById(characterId) {
    const response = await apiClient.get(`/characters/${characterId}`);
    return response.data;
  },

  /**
   * 特定ゲームで利用可能なキャラクター一覧を取得
   * @param {number} gameId - ゲームID
   * @returns {Promise<Array>} キャラクター配列
   */
  async getGameCharacters(gameId) {
    const response = await apiClient.get(`/games/${gameId}/characters`);
    return response.data;
  },

  /**
   * キャラクターを作成（管理者のみ）
   * @param {Object} characterData - キャラクターデータ
   * @param {string} characterData.name - キャラクター名
   * @returns {Promise<Object>} 作成されたキャラクター
   */
  async createCharacter(characterData) {
    const response = await apiClient.post('/characters', characterData);
    return response.data;
  },

  /**
   * キャラクターを更新（管理者のみ）
   * @param {number} characterId - キャラクターID
   * @param {Object} characterData - 更新データ
   * @returns {Promise<Object>} 更新されたキャラクター
   */
  async updateCharacter(characterId, characterData) {
    const response = await apiClient.put(`/characters/${characterId}`, characterData);
    return response.data;
  },

  /**
   * キャラクターを削除（管理者のみ）
   * @param {number} characterId - キャラクターID
   * @returns {Promise<Object>} 削除結果メッセージ
   */
  async deleteCharacter(characterId) {
    const response = await apiClient.delete(`/characters/${characterId}`);
    return response.data;
  }
};