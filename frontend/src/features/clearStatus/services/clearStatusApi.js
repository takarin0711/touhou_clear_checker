import api from '../../../services/api';

/**
 * クリア状況API関連の関数
 */
export const clearStatusApi = {
  /**
   * 現在のユーザーのクリア状況一覧取得
   * @returns {Promise<import('../../../types/clearStatus').ClearStatus[]>}
   */
  getMyClearStatus: async () => {
    const response = await api.get('/clear-status/');
    return response.data;
  },

  /**
   * 現在のユーザーの特定ゲームのクリア状況取得
   * @param {number} gameId - ゲームID
   * @returns {Promise<import('../../../types/clearStatus').ClearStatus[]>}
   */
  getMyClearStatusByGame: async (gameId) => {
    const response = await api.get(`/clear-status/game/${gameId}`);
    return response.data;
  },

  /**
   * クリア状況の作成
   * @param {import('../../../types/clearStatus').ClearStatusCreate} clearStatusData 
   * @returns {Promise<import('../../../types/clearStatus').ClearStatus>}
   */
  createClearStatus: async (clearStatusData) => {
    const response = await api.post('/clear-status/', clearStatusData);
    return response.data;
  },

  /**
   * クリア状況の更新
   * @param {number} clearStatusId - クリア状況ID
   * @param {import('../../../types/clearStatus').ClearStatusUpdate} clearStatusData 
   * @returns {Promise<import('../../../types/clearStatus').ClearStatus>}
   */
  updateClearStatus: async (clearStatusId, clearStatusData) => {
    const response = await api.put(`/clear-status/${clearStatusId}`, clearStatusData);
    return response.data;
  },

  /**
   * クリア状況の削除
   * @param {number} clearStatusId - クリア状況ID
   * @returns {Promise<void>}
   */
  deleteClearStatus: async (clearStatusId) => {
    await api.delete(`/clear-status/${clearStatusId}`);
  },

  /**
   * ゲームを指定難易度でクリア済みとしてマーク
   * @param {number} gameId - ゲームID
   * @param {'Easy'|'Normal'|'Hard'|'Lunatic'|'Extra'|'Phantasm'} difficulty - 難易度
   * @returns {Promise<import('../../../types/clearStatus').ClearStatus>}
   */
  markAsCleared: async (gameId, difficulty) => {
    const response = await api.post(`/clear-status/mark-cleared/${gameId}/${difficulty}`);
    return response.data;
  }
};