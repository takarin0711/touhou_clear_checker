/**
 * クリア記録API サービス（機体別条件対応）
 */
import apiClient from './api';

/**
 * クリア記録関連のAPI呼び出し
 */
export const clearRecordApi = {
  /**
   * ユーザーのクリア記録一覧を取得
   * @returns {Promise<Array>} クリア記録配列
   */
  async getMyClearRecords() {
    const response = await apiClient.get('/clear-records');
    return response.data;
  },

  /**
   * ユーザーの特定ゲームのクリア記録を取得
   * @param {number} gameId - ゲームID
   * @returns {Promise<Array>} クリア記録配列
   */
  async getMyClearRecordsByGame(gameId) {
    const response = await apiClient.get(`/clear-records?game_id=${gameId}`);
    return response.data;
  },

  /**
   * クリア記録を作成
   * @param {Object} recordData - クリア記録データ
   * @param {number} recordData.game_id - ゲームID
   * @param {number} recordData.character_id - キャラクターID
   * @param {string} recordData.difficulty - 難易度
   * @param {boolean} recordData.is_cleared - 通常クリア
   * @param {boolean} recordData.is_no_continue_clear - ノーコンティニュークリア
   * @param {boolean} recordData.is_no_bomb_clear - ノーボムクリア
   * @param {boolean} recordData.is_no_miss_clear - ノーミスクリア
   * @param {string} [recordData.cleared_at] - クリア日（YYYY-MM-DD）
   * @returns {Promise<Object>} 作成されたクリア記録
   */
  async createClearRecord(recordData) {
    const response = await apiClient.post('/clear-records', recordData);
    return response.data;
  },

  /**
   * クリア記録を更新
   * @param {number} recordId - 記録ID
   * @param {Object} updateData - 更新データ
   * @returns {Promise<Object>} 更新されたクリア記録
   */
  async updateClearRecord(recordId, updateData) {
    const response = await apiClient.put(`/clear-records/${recordId}`, updateData);
    return response.data;
  },

  /**
   * クリア記録を削除
   * @param {number} recordId - 記録ID
   * @returns {Promise<Object>} 削除結果メッセージ
   */
  async deleteClearRecord(recordId) {
    const response = await apiClient.delete(`/clear-records/${recordId}`);
    return response.data;
  },

  /**
   * クリア記録を作成または更新（UPSERT）
   * @param {Object} recordData - クリア記録データ
   * @returns {Promise<Object>} 作成/更新されたクリア記録
   */
  async createOrUpdateClearRecord(recordData) {
    const response = await apiClient.post('/clear-records/upsert', recordData);
    return response.data;
  },

  /**
   * 複数のクリア記録を一括で作成/更新
   * @param {Array<Object>} recordsData - クリア記録データの配列
   * @returns {Promise<Array>} 作成/更新されたクリア記録の配列
   */
  async batchCreateOrUpdateRecords(recordsData) {
    const response = await apiClient.post('/clear-records/batch', { records: recordsData });
    return response.data;
  },

  /**
   * 機体別条件式データを一括送信
   * タブ式UIから送信される複数の機体×条件の組み合わせを処理
   * @param {number} gameId - ゲームID
   * @param {string} difficulty - 難易度
   * @param {Object} difficultyData - 機体別条件データ
   * @param {Object} difficultyData.characters - 機体ごとの条件 {characterId: {cleared: bool, no_continue: bool, ...}}
   * @returns {Promise<Array>} 作成/更新されたクリア記録の配列
   */
  async submitIndividualConditions(gameId, difficulty, difficultyData) {
    const recordsData = [];
    
    // 機体ごとの条件データを個別レコードに変換
    Object.entries(difficultyData.characters || {}).forEach(([characterId, conditions]) => {
      if (conditions.cleared || conditions.no_continue || conditions.no_bomb || conditions.no_miss) {
        recordsData.push({
          game_id: gameId,
          character_id: parseInt(characterId),
          difficulty: difficulty,
          is_cleared: conditions.cleared || false,
          is_no_continue_clear: conditions.no_continue || false,
          is_no_bomb_clear: conditions.no_bomb || false,
          is_no_miss_clear: conditions.no_miss || false,
          cleared_at: conditions.cleared ? new Date().toISOString().split('T')[0] : null
        });
      }
    });

    if (recordsData.length === 0) {
      return [];
    }

    return await this.batchCreateOrUpdateRecords(recordsData);
  }
};