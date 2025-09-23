import { renderHook, act, waitFor } from '@testing-library/react';
import { useGames } from './useGames';
import { gameApi } from '../services/gameApi';
import { Game, GAME_TYPES } from '../../../types/game';

// gameApiのモック
jest.mock('../services/gameApi');
const mockedGameApi = gameApi as jest.Mocked<typeof gameApi>;

const mockGames: Game[] = [
  {
    id: 1,
    title: '東方紅魔郷',
    series_number: 6,
    release_year: 2002,
    game_type: GAME_TYPES.MAIN_SERIES,
  },
  {
    id: 2,
    title: '東方妖々夢',
    series_number: 7,
    release_year: 2003,
    game_type: GAME_TYPES.MAIN_SERIES,
  },
  {
    id: 3,
    title: '東方萃夢想',
    series_number: 7.5,
    release_year: 2004,
    game_type: GAME_TYPES.FIGHTING,
  },
];

// console.errorをモック
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('useGames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期化時にゲーム一覧を取得する', async () => {
    mockedGameApi.getGames.mockResolvedValue(mockGames);

    const { result } = renderHook(() => useGames());

    // 初期状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.games).toEqual([]);
    expect(result.current.allGames).toEqual([]);
    expect(result.current.error).toBeNull();

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGameApi.getGames).toHaveBeenCalledWith({});
    expect(result.current.games).toEqual(mockGames);
    expect(result.current.allGames).toEqual(mockGames);
    expect(result.current.error).toBeNull();
  });

  it('初期フィルターを指定して初期化する', async () => {
    const initialFilters = { series_number: 6 };
    mockedGameApi.getGames.mockResolvedValue([mockGames[0]]);

    const { result } = renderHook(() => useGames(initialFilters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGameApi.getGames).toHaveBeenCalledWith(initialFilters);
    expect(result.current.filters).toEqual(initialFilters);
  });

  it('fetchGames関数が正常に動作する', async () => {
    mockedGameApi.getGames.mockResolvedValue(mockGames);

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // fetchGamesを再実行
    const newFilters = { game_type: GAME_TYPES.MAIN_SERIES };
    mockedGameApi.getGames.mockResolvedValue([mockGames[0], mockGames[1]]);

    await act(async () => {
      await result.current.fetchGames(newFilters);
    });

    expect(mockedGameApi.getGames).toHaveBeenCalledWith(newFilters);
    expect(result.current.games).toEqual([mockGames[0], mockGames[1]]);
  });

  it('APIエラー時にエラー状態が設定される', async () => {
    const errorMessage = 'ネットワークエラー';
    const error = {
      response: {
        data: {
          detail: errorMessage,
        },
      },
    };
    mockedGameApi.getGames.mockRejectedValue(error);

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.games).toEqual([]);
  });

  it('APIエラー時にresponse.data.detailがない場合はデフォルトメッセージを表示', async () => {
    const error = new Error('Network Error');
    mockedGameApi.getGames.mockRejectedValue(error);

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('ゲーム一覧の取得に失敗しました');
    expect(console.error).toHaveBeenCalledWith('ゲーム一覧の取得に失敗:', error);
  });

  describe('applyFilters', () => {
    beforeEach(async () => {
      mockedGameApi.getGames.mockResolvedValue(mockGames);
      mockedGameApi.filterGamesByTitle.mockImplementation((games, search) => {
        if (!search) return games;
        return games.filter(game => game.title.includes(search));
      });
    });

    it('検索フィルターが正常に動作する', async () => {
      const { result } = renderHook(() => useGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.applyFilters({ search: '紅魔郷' });
      });

      expect(mockedGameApi.filterGamesByTitle).toHaveBeenCalledWith(mockGames, '紅魔郷');
      expect(result.current.filters).toEqual({ search: '紅魔郷' });
    });

    it('検索語句がない場合は全ゲームを表示', async () => {
      const { result } = renderHook(() => useGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.applyFilters({});
      });

      expect(result.current.games).toEqual(mockGames);
    });
  });

  describe('applyServerFilters', () => {
    it('サーバー側フィルターが正常に動作する', async () => {
      mockedGameApi.getGames.mockResolvedValue(mockGames);

      const { result } = renderHook(() => useGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const serverFilters = { series_number: 6 };
      mockedGameApi.getGames.mockResolvedValue([mockGames[0]]);

      await act(async () => {
        await result.current.applyServerFilters(serverFilters);
      });

      expect(mockedGameApi.getGames).toHaveBeenCalledWith(serverFilters);
      expect(result.current.games).toEqual([mockGames[0]]);
    });
  });

  describe('resetFilters', () => {
    it('フィルターのリセットが正常に動作する', async () => {
      mockedGameApi.getGames.mockResolvedValue(mockGames);

      const { result } = renderHook(() => useGames({ series_number: 6 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // フィルターを適用
      act(() => {
        result.current.applyFilters({ search: '紅魔郷' });
      });

      expect(result.current.filters).toEqual({ search: '紅魔郷' });

      // フィルターをリセット
      await act(async () => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({});
      expect(mockedGameApi.getGames).toHaveBeenCalledWith();
    });
  });

  describe('refetch', () => {
    it('現在のフィルターでデータを再取得する', async () => {
      mockedGameApi.getGames.mockResolvedValue(mockGames);

      const { result } = renderHook(() => useGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // フィルターを設定
      act(() => {
        result.current.applyFilters({ search: 'test' });
      });

      // refetchを実行
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockedGameApi.getGames).toHaveBeenCalledWith({ search: 'test' });
    });
  });

  describe('ローディング状態', () => {
    it('データ取得中はloadingがtrueになる', async () => {
      let resolvePromise: (value: Game[]) => void;
      const promise = new Promise<Game[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockedGameApi.getGames.mockReturnValue(promise);

      const { result } = renderHook(() => useGames());

      // 最初はloading状態ではない（useEffectがまだ実行されていない）
      expect(result.current.loading).toBe(false);

      // useEffectが実行されるのを待つ
      await act(async () => {
        // 少し待つことでuseEffectが実行される
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // この時点でローディング中
      expect(result.current.loading).toBe(true);

      // APIレスポンスを解決
      await act(async () => {
        resolvePromise!(mockGames);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('エラー状態の回復', () => {
    it('エラー後に再度fetchGamesを実行すると成功する', async () => {
      // 最初はエラー
      mockedGameApi.getGames.mockRejectedValueOnce(new Error('Network Error'));

      const { result } = renderHook(() => useGames());

      await waitFor(() => {
        expect(result.current.error).toBe('ゲーム一覧の取得に失敗しました');
      });

      // 2回目は成功
      mockedGameApi.getGames.mockResolvedValue(mockGames);

      await act(async () => {
        await result.current.fetchGames();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.games).toEqual(mockGames);
    });
  });
});