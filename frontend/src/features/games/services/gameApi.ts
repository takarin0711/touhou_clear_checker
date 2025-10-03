import api from '../../../services/api';
import { Game, GameFilter } from '../../../types/game';

/**
 * ゲームAPI関連の関数
 */
export const gameApi = {
  /**
   * ゲーム一覧取得
   * @param filters - フィルター条件
   * @returns ゲーム一覧
   */
  getGames: async (filters: GameFilter = {}): Promise<Game[]> => {
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
   * @param seriesNumber - シリーズ番号
   * @returns ゲーム情報またはnull
   */
  getGameBySeriesNumber: async (seriesNumber: number): Promise<Game | null> => {
    const games = await gameApi.getGames({ series_number: seriesNumber });
    return games.length > 0 ? games[0] : null;
  },

  /**
   * 本編STGのゲーム一覧取得
   * @returns 本編STGゲーム一覧
   */
  getMainSeriesGames: async (): Promise<Game[]> => {
    return await gameApi.getGames({ game_type: 'main_series' });
  },

  /**
   * タイトル検索（フロントエンド側フィルタリング）
   * @param games - ゲーム一覧
   * @param searchTerm - 検索語句
   * @returns フィルタリング後のゲーム一覧
   */
  filterGamesByTitle: (games: Game[], searchTerm: string): Game[] => {
    if (!searchTerm || !searchTerm.trim()) return games;
    
    const term = searchTerm.toLowerCase().trim();
    return games.filter(game => 
      game.title.toLowerCase().includes(term) ||
      game.series_number.toString().includes(term)
    );
  },
};