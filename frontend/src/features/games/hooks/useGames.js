import { useState, useEffect, useCallback } from 'react';
import { gameApi } from '../services/gameApi';

/**
 * ゲーム一覧管理のカスタムフック
 */
export const useGames = (initialFilters = {}) => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // ゲーム一覧の取得
  const fetchGames = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameApi.getGames(filterParams);
      setGames(data);
      setFilteredGames(data);
    } catch (err) {
      console.error('ゲーム一覧の取得に失敗:', err);
      setError(err.response?.data?.detail || 'ゲーム一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // フィルターの適用
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    
    // タイトル検索はフロントエンド側でフィルタリング
    let filtered = games;
    if (newFilters.search) {
      filtered = gameApi.filterGamesByTitle(games, newFilters.search);
    }
    
    setFilteredGames(filtered);
  }, [games]);

  // サーバー側フィルターの適用（series_number, game_type）
  const applyServerFilters = useCallback(async (serverFilters) => {
    await fetchGames(serverFilters);
  }, [fetchGames]);

  // フィルターのリセット
  const resetFilters = useCallback(() => {
    setFilters({});
    fetchGames();
  }, [fetchGames]);

  // 初期データの取得
  useEffect(() => {
    fetchGames(initialFilters);
  }, [fetchGames]); // initialFiltersを依存配列から削除

  return {
    games: filteredGames,
    allGames: games,
    loading,
    error,
    filters,
    fetchGames,
    applyFilters,
    applyServerFilters,
    resetFilters,
    refetch: () => fetchGames(filters),
  };
};