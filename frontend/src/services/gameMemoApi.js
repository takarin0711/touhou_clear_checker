/**
 * ゲームメモAPI サービス
 */
import apiClient from './api';

/**
 * ゲームメモ関連のAPI呼び出し
 */
export const gameMemoApi = {
  /**
   * ユーザーの特定ゲームのメモを取得
   * @param {number} gameId - ゲームID
   * @returns {Promise<Object|null>} ゲームメモまたはnull
   */
  async getGameMemo(gameId) {
    try {
      const response = await apiClient.get(`/game-memos/${gameId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // メモが存在しない場合
      }
      throw error;
    }
  },

  /**
   * ユーザーの全ゲームメモを取得
   * @returns {Promise<Array>} ゲームメモの配列
   */
  async getMyGameMemos() {
    const response = await apiClient.get('/game-memos');
    return response.data;
  },

  /**
   * ゲームメモを作成
   * @param {number} gameId - ゲームID
   * @param {string} memoText - メモ内容
   * @returns {Promise<Object>} 作成されたゲームメモ
   */
  async createGameMemo(gameId, memoText) {
    const response = await apiClient.post(`/game-memos/${gameId}`, {
      memo: memoText
    });
    return response.data;
  },

  /**
   * ゲームメモを更新
   * @param {number} gameId - ゲームID
   * @param {string} memoText - メモ内容
   * @returns {Promise<Object>} 更新されたゲームメモ
   */
  async updateGameMemo(gameId, memoText) {
    const response = await apiClient.put(`/game-memos/${gameId}`, {
      memo: memoText
    });
    return response.data;
  },

  /**
   * ゲームメモを削除
   * @param {number} gameId - ゲームID
   * @returns {Promise<Object>} 削除結果メッセージ
   */
  async deleteGameMemo(gameId) {
    const response = await apiClient.delete(`/game-memos/${gameId}`);
    return response.data;
  },

  /**
   * ゲームメモを作成または更新（UPSERT）
   * @param {number} gameId - ゲームID
   * @param {string} memoText - メモ内容
   * @returns {Promise<Object>} 作成/更新されたゲームメモ
   */
  async createOrUpdateGameMemo(gameId, memoText) {
    const response = await apiClient.post(`/game-memos/${gameId}/upsert`, {
      memo: memoText
    });
    return response.data;
  }
};