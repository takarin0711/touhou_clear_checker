import { renderHook, act, waitFor } from '@testing-library/react';
import { useClearRecords } from './useClearRecords';
import { clearRecordApi } from '../services/clearRecordApi';
import { ClearRecord } from '../types/clearRecord';

// clearRecordApiのモック
jest.mock('../services/clearRecordApi');
const mockedClearRecordApi = clearRecordApi as jest.Mocked<typeof clearRecordApi>;

const mockClearRecords: ClearRecord[] = [
  {
    id: 1,
    user_id: 1,
    game_id: 1,
    character_id: 1,
    difficulty: 'Easy',
    is_cleared: true,
    is_no_continue_clear: false,
    is_no_bomb_clear: false,
    is_no_miss_clear: false,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    game_id: 1,
    character_id: 2,
    difficulty: 'Normal',
    is_cleared: true,
    is_no_continue_clear: false,
    is_no_bomb_clear: false,
    is_no_miss_clear: true,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
    created_at: '2024-01-01T00:00:00Z',
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

describe('useClearRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期化時にクリア記録一覧を取得する', async () => {
    mockedClearRecordApi.getMyClearRecords.mockResolvedValue(mockClearRecords);

    const { result } = renderHook(() => useClearRecords());

    // 初期状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.clearRecords).toEqual([]);
    expect(result.current.error).toBeNull();

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedClearRecordApi.getMyClearRecords).toHaveBeenCalledTimes(1);
    expect(result.current.clearRecords).toEqual(mockClearRecords);
    expect(result.current.error).toBeNull();
  });

  it('特定ゲームIDを指定して初期化する', async () => {
    const gameId = 1;
    const gameRecords = [mockClearRecords[0]];
    mockedClearRecordApi.getMyClearRecordsByGame.mockResolvedValue(gameRecords);

    const { result } = renderHook(() => useClearRecords(gameId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedClearRecordApi.getMyClearRecordsByGame).toHaveBeenCalledWith(gameId);
    expect(result.current.clearRecords).toEqual(gameRecords);
  });

  it('fetchClearRecords関数が正常に動作する', async () => {
    mockedClearRecordApi.getMyClearRecords.mockResolvedValue(mockClearRecords);

    const { result } = renderHook(() => useClearRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // fetchClearRecordsを再実行
    const newRecords = [mockClearRecords[0]];
    mockedClearRecordApi.getMyClearRecords.mockResolvedValue(newRecords);

    await act(async () => {
      await result.current.fetchClearRecords();
    });

    expect(mockedClearRecordApi.getMyClearRecords).toHaveBeenCalledTimes(2);
    expect(result.current.clearRecords).toEqual(newRecords);
  });

  it('APIエラー時にエラー状態が設定される（全記録取得）', async () => {
    const errorMessage = 'アクセスが拒否されました';
    const error = {
      response: {
        data: {
          detail: errorMessage,
        },
      },
    };
    mockedClearRecordApi.getMyClearRecords.mockRejectedValue(error);

    const { result } = renderHook(() => useClearRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.clearRecords).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('クリア記録取得エラー:', error);
  });

  it('APIエラー時にresponse.data.detailがない場合はデフォルトメッセージを表示', async () => {
    const error = new Error('Network Error');
    mockedClearRecordApi.getMyClearRecords.mockRejectedValue(error);

    const { result } = renderHook(() => useClearRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('クリア記録の取得に失敗しました');
  });

  describe('submitIndividualConditions', () => {
    it('機体別条件送信が正常に動作する', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue([]);
      
      const newRecords = [mockClearRecords[0]];
      mockedClearRecordApi.submitIndividualConditions.mockResolvedValue(newRecords);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = { some: 'data' };
      const characters = { character1: true };
      const mode = 'normal';

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitIndividualConditions(
          gameId,
          difficulty,
          difficultyData,
          characters,
          mode
        );
      });

      expect(mockedClearRecordApi.submitIndividualConditions).toHaveBeenCalledWith(
        gameId,
        difficulty,
        difficultyData,
        characters,
        mode
      );
      expect(submitResult).toEqual({ success: true, data: newRecords });
      expect(result.current.clearRecords).toEqual(newRecords);
    });

    it('既存記録を更新する', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue(mockClearRecords);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 既存記録を更新
      const updatedRecord = {
        ...mockClearRecords[0],
        no_miss: true,
        updated_at: '2024-01-02T00:00:00Z',
      };
      
      mockedClearRecordApi.submitIndividualConditions.mockResolvedValue([updatedRecord]);

      await act(async () => {
        await result.current.submitIndividualConditions(1, 'Easy', {}, {});
      });

      expect(result.current.clearRecords).toHaveLength(2);
      expect(result.current.clearRecords[0]).toEqual(updatedRecord);
      expect(result.current.clearRecords[1]).toEqual(mockClearRecords[1]);
    });

    it('新規記録を追加する', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue([mockClearRecords[0]]);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 新規記録を追加
      const newRecord = {
        id: 3,
        game_id: 2,
        character_id: 1,
        difficulty: 'Hard',
        cleared: true,
        no_miss: false,
        no_bomb: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };
      
      mockedClearRecordApi.submitIndividualConditions.mockResolvedValue([newRecord]);

      await act(async () => {
        await result.current.submitIndividualConditions(2, 'Hard', {}, {});
      });

      expect(result.current.clearRecords).toHaveLength(2);
      expect(result.current.clearRecords).toContain(mockClearRecords[0]);
      expect(result.current.clearRecords).toContain(newRecord);
    });

    it('エラー時にエラー状態が設定される', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue([]);
      
      const errorMessage = '保存に失敗しました';
      const error = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      };
      mockedClearRecordApi.submitIndividualConditions.mockRejectedValue(error);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitIndividualConditions(1, 'Easy', {}, {});
      });

      expect(submitResult).toEqual({ success: false, error: errorMessage });
      expect(result.current.error).toBe(errorMessage);
    });

    it('複雑なエラーレスポンスを処理する', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue([]);
      
      const error = {
        response: {
          data: { field1: 'error1', field2: 'error2' },
        },
      };
      mockedClearRecordApi.submitIndividualConditions.mockRejectedValue(error);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitIndividualConditions(1, 'Easy', {}, {});
      });

      expect(submitResult.success).toBe(false);
      expect(submitResult.error).toContain('field1');
      expect(submitResult.error).toContain('error1');
    });

    it('デフォルトモードパラメーターが正しく設定される', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue([]);
      mockedClearRecordApi.submitIndividualConditions.mockResolvedValue([]);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.submitIndividualConditions(1, 'Easy', {}, {});
      });

      expect(mockedClearRecordApi.submitIndividualConditions).toHaveBeenCalledWith(
        1,
        'Easy',
        {},
        {},
        'normal'
      );
    });
  });

  describe('clearError', () => {
    it('エラーをクリアする', async () => {
      const error = new Error('Test Error');
      mockedClearRecordApi.getMyClearRecords.mockRejectedValue(error);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.error).toBe('クリア記録の取得に失敗しました');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('refetch', () => {
    it('refetchが正常に動作する', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue(mockClearRecords);

      const { result } = renderHook(() => useClearRecords());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 新しいデータでrefetch
      const newRecords = [mockClearRecords[0]];
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue(newRecords);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.clearRecords).toEqual(newRecords);
      expect(mockedClearRecordApi.getMyClearRecords).toHaveBeenCalledTimes(2);
    });
  });

  describe('ローディング状態', () => {
    it('データ取得中はloadingがtrueになる', async () => {
      let resolvePromise: (value: ClearRecord[]) => void;
      const promise = new Promise<ClearRecord[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockedClearRecordApi.getMyClearRecords.mockReturnValue(promise);

      const { result } = renderHook(() => useClearRecords());

      // 最初はloading状態ではない（useEffectがまだ実行されていない）
      expect(result.current.loading).toBe(false);

      // useEffectが実行されるのを待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // この時点でローディング中
      expect(result.current.loading).toBe(true);

      // APIレスポンスを解決
      await act(async () => {
        resolvePromise!(mockClearRecords);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.clearRecords).toEqual(mockClearRecords);
    });
  });

  describe('gameIdの変更', () => {
    it('gameIdが変更されると適切なAPIが呼ばれる', async () => {
      mockedClearRecordApi.getMyClearRecords.mockResolvedValue(mockClearRecords);
      mockedClearRecordApi.getMyClearRecordsByGame.mockResolvedValue([mockClearRecords[0]]);

      const { result, rerender } = renderHook(
        ({ gameId }: { gameId: number | null }) => useClearRecords(gameId),
        { initialProps: { gameId: null as number | null } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockedClearRecordApi.getMyClearRecords).toHaveBeenCalledTimes(1);

      // gameIdを変更
      rerender({ gameId: 1 });

      await waitFor(() => {
        expect(mockedClearRecordApi.getMyClearRecordsByGame).toHaveBeenCalledWith(1);
      });
    });
  });
});