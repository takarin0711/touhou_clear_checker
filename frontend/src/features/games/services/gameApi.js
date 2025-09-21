import api from '../../../services/api';

/**
 * ゲームAPI関連の関数
 */
export const gameApi = {
  /**
   * ゲーム一覧取得
   * @param {import('../../../types/game').GameFilter} filters - フィルター条件
   * @returns {Promise<import('../../../types/game').Game[]>}
   */
  getGames: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.series_number !== null && filters.series_number !== undefined) {
      params.append('series_number', filters.series_number.toString());
    }
    
    if (filters.game_type) {
      params.append('game_type', filters.game_type);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/games?${queryString}` : '/games';
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * 特定シリーズ番号のゲーム取得
   * @param {number} seriesNumber - シリーズ番号
   * @returns {Promise<import('../../../types/game').Game|null>}
   */
  getGameBySeriesNumber: async (seriesNumber) => {
    const games = await gameApi.getGames({ series_number: seriesNumber });
    return games.length > 0 ? games[0] : null;
  },

  /**
   * 本編STGのゲーム一覧取得
   * @returns {Promise<import('../../../types/game').Game[]>}
   */
  getMainSeriesGames: async () => {
    return await gameApi.getGames({ game_type: 'main_series' });
  },

  /**
   * タイトル検索（フロントエンド側フィルタリング）
   * @param {import('../../../types/game').Game[]} games - ゲーム一覧
   * @param {string} searchTerm - 検索語句
   * @returns {import('../../../types/game').Game[]}
   */
  filterGamesByTitle: (games, searchTerm) => {
    if (!searchTerm) return games;
    
    const term = searchTerm.toLowerCase();
    return games.filter(game => 
      game.title.toLowerCase().includes(term) ||
      game.series_number.toString().includes(term)
    );
  },
};