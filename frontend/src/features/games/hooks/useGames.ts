import { useState, useEffect, useCallback } from 'react';
import { gameApi } from '../services/gameApi';
import { Game, GameFilter } from '../../../types/game';

interface UseGamesReturn {
  games: Game[];
  allGames: Game[];
  loading: boolean;
  error: string | null;
  filters: GameFilter;
  fetchGames: (filterParams?: any) => Promise<void>;
  applyFilters: (newFilters: GameFilter) => void;
  applyServerFilters: (serverFilters: any) => Promise<void>;
  resetFilters: () => void;
  refetch: () => Promise<void>;
}

/**
 * ゲーム一覧管理のカスタムフック
 */
export const useGames = (initialFilters: GameFilter = {}): UseGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GameFilter>(initialFilters);

  // ゲーム一覧の取得
  const fetchGames = useCallback(async (filterParams: any = {}): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameApi.getGames(filterParams);
      setGames(data);
      setFilteredGames(data);
    } catch (err) {
      console.error('ゲーム一覧の取得に失敗:', err);
      setError((err as any).response?.data?.detail || 'ゲーム一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // フィルターの適用
  const applyFilters = useCallback((newFilters: GameFilter): void => {
    setFilters(newFilters);
    
    // タイトル検索はフロントエンド側でフィルタリング
    let filtered = games;
    if (newFilters.search) {
      filtered = gameApi.filterGamesByTitle(games, newFilters.search);
    }
    
    setFilteredGames(filtered);
  }, [games]);

  // サーバー側フィルターの適用（series_number, game_type）
  const applyServerFilters = useCallback(async (serverFilters: any): Promise<void> => {
    await fetchGames(serverFilters);
  }, [fetchGames]);

  // フィルターのリセット
  const resetFilters = useCallback((): void => {
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