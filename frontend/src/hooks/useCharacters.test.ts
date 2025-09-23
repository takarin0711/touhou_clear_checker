import { renderHook, act, waitFor } from '@testing-library/react';
import { useCharacters } from './useCharacters';
import { characterApi } from '../services/characterApi';

// characterApiのモック
jest.mock('../services/characterApi');
const mockedCharacterApi = characterApi as jest.Mocked<typeof characterApi>;

const mockCharacters = [
  {
    id: 1,
    name: '博麗霊夢',
    character_name: '博麗霊夢',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '霧雨魔理沙',
    character_name: '霧雨魔理沙',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '十六夜咲夜',
    character_name: '十六夜咲夜',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
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

describe('useCharacters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期化時に全キャラクター一覧を取得する', async () => {
    mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

    const { result } = renderHook(() => useCharacters());

    // 初期状態の確認（useEffectが実行される前）
    expect(result.current.characters).toEqual([]);
    expect(result.current.error).toBeNull();

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedCharacterApi.getAllCharacters).toHaveBeenCalledTimes(1);
    expect(result.current.characters).toEqual(mockCharacters);
    expect(result.current.error).toBeNull();
  });

  it('gameIdを指定して初期化すると特定ゲームのキャラクターを取得する', async () => {
    const gameId = 1;
    const gameCharacters = [mockCharacters[0], mockCharacters[1]]; // 霊夢と魔理沙のみ
    mockedCharacterApi.getGameCharacters.mockResolvedValue(gameCharacters);

    const { result } = renderHook(() => useCharacters(gameId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedCharacterApi.getGameCharacters).toHaveBeenCalledWith(gameId);
    expect(result.current.characters).toEqual(gameCharacters);
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
    mockedCharacterApi.getAllCharacters.mockRejectedValue(error);

    const { result } = renderHook(() => useCharacters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.characters).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('キャラクター取得エラー:', error);
  });

  it('APIエラー時にresponse.data.detailがない場合はデフォルトメッセージを表示', async () => {
    const error = new Error('Network Error');
    mockedCharacterApi.getAllCharacters.mockRejectedValue(error);

    const { result } = renderHook(() => useCharacters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('キャラクターの取得に失敗しました');
  });

  describe('fetchCharacters', () => {
    it('fetchCharacters関数が正常に動作する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // fetchCharactersを再実行
      const newCharacters = [mockCharacters[0]];
      mockedCharacterApi.getAllCharacters.mockResolvedValue(newCharacters);

      await act(async () => {
        await result.current.fetchCharacters();
      });

      expect(mockedCharacterApi.getAllCharacters).toHaveBeenCalledTimes(2);
      expect(result.current.characters).toEqual(newCharacters);
    });

    it('gameId指定時のfetchCharactersが正常に動作する', async () => {
      const gameId = 1;
      mockedCharacterApi.getGameCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters(gameId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // fetchCharactersを再実行
      const newCharacters = [mockCharacters[2]];
      mockedCharacterApi.getGameCharacters.mockResolvedValue(newCharacters);

      await act(async () => {
        await result.current.fetchCharacters();
      });

      expect(mockedCharacterApi.getGameCharacters).toHaveBeenCalledTimes(2);
      expect(mockedCharacterApi.getGameCharacters).toHaveBeenCalledWith(gameId);
      expect(result.current.characters).toEqual(newCharacters);
    });
  });

  describe('createCharacter', () => {
    it('キャラクター作成が成功した場合、状態を更新する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newCharacter = {
        id: 4,
        name: '八雲紫',
        character_name: '八雲紫',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedCharacterApi.createCharacter.mockResolvedValue(newCharacter);

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createCharacter({ name: '八雲紫' });
      });

      expect(createResult).toEqual({ success: true, data: newCharacter });
      expect(result.current.characters).toHaveLength(4);
      expect(result.current.characters).toContain(newCharacter);
    });

    it('キャラクター作成が失敗した場合、エラー状態を設定する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue([]);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const errorMessage = '権限がありません';
      const error = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      };
      mockedCharacterApi.createCharacter.mockRejectedValue(error);

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createCharacter({ name: 'テスト' });
      });

      expect(createResult).toEqual({ success: false, error: errorMessage });
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.characters).toHaveLength(0);
    });

    it('エラーレスポンスがない場合はデフォルトメッセージを使用する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue([]);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const error = new Error('Network Error');
      mockedCharacterApi.createCharacter.mockRejectedValue(error);

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createCharacter({ name: 'テスト' });
      });

      expect(createResult.error).toBe('キャラクターの作成に失敗しました');
      expect(result.current.error).toBe('キャラクターの作成に失敗しました');
    });
  });

  describe('updateCharacter', () => {
    it('キャラクター更新が成功した場合、状態を更新する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedCharacter = {
        ...mockCharacters[0],
        name: '博麗霊夢（更新）',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedCharacterApi.updateCharacter.mockResolvedValue(updatedCharacter);

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateCharacter(1, { name: '博麗霊夢（更新）' });
      });

      expect(updateResult).toEqual({ success: true, data: updatedCharacter });
      expect(result.current.characters[0]).toEqual(updatedCharacter);
      expect(result.current.characters).toHaveLength(3);
    });

    it('キャラクター更新が失敗した場合、エラー状態を設定する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const errorMessage = 'キャラクターが見つかりません';
      const error = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      };
      mockedCharacterApi.updateCharacter.mockRejectedValue(error);

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateCharacter(999, { name: 'テスト' });
      });

      expect(updateResult).toEqual({ success: false, error: errorMessage });
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.characters).toEqual(mockCharacters); // 元の状態を維持
    });

    it('エラーレスポンスがない場合はデフォルトメッセージを使用する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const error = new Error('Network Error');
      mockedCharacterApi.updateCharacter.mockRejectedValue(error);

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateCharacter(1, { name: 'テスト' });
      });

      expect(updateResult.error).toBe('キャラクターの更新に失敗しました');
      expect(result.current.error).toBe('キャラクターの更新に失敗しました');
    });
  });

  describe('deleteCharacter', () => {
    it('キャラクター削除が成功した場合、状態を更新する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockedCharacterApi.deleteCharacter.mockResolvedValue({ message: 'Character deleted' });

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteCharacter(1);
      });

      expect(deleteResult).toEqual({ success: true });
      expect(result.current.characters).toHaveLength(2);
      expect(result.current.characters.find(char => char.id === 1)).toBeUndefined();
    });

    it('キャラクター削除が失敗した場合、エラー状態を設定する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const errorMessage = '関連データがあるため削除できません';
      const error = {
        response: {
          data: {
            detail: errorMessage,
          },
        },
      };
      mockedCharacterApi.deleteCharacter.mockRejectedValue(error);

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteCharacter(1);
      });

      expect(deleteResult).toEqual({ success: false, error: errorMessage });
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.characters).toEqual(mockCharacters); // 元の状態を維持
    });

    it('エラーレスポンスがない場合はデフォルトメッセージを使用する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const error = new Error('Network Error');
      mockedCharacterApi.deleteCharacter.mockRejectedValue(error);

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteCharacter(1);
      });

      expect(deleteResult.error).toBe('キャラクターの削除に失敗しました');
      expect(result.current.error).toBe('キャラクターの削除に失敗しました');
    });
  });

  describe('getCharacterById', () => {
    it('IDでキャラクターを検索する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const character = result.current.getCharacterById(1);
      expect(character).toEqual(mockCharacters[0]);
    });

    it('存在しないIDの場合はundefinedを返す', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const character = result.current.getCharacterById(999);
      expect(character).toBeUndefined();
    });
  });

  describe('searchCharactersByName', () => {
    it('名前で部分一致検索する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const results = result.current.searchCharactersByName('霊夢');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockCharacters[0]);
    });

    it('大文字小文字を区別しない検索が動作する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const results = result.current.searchCharactersByName('魔理沙');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockCharacters[1]);
    });

    it('複数の結果がマッチする場合は全て返す', async () => {
      const charactersWithSamePart = [
        ...mockCharacters,
        {
          id: 4,
          name: '八雲紫（魔理沙の友達）',
          character_name: '八雲紫（魔理沙の友達）',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      mockedCharacterApi.getAllCharacters.mockResolvedValue(charactersWithSamePart);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const results = result.current.searchCharactersByName('魔理沙');
      expect(results).toHaveLength(2);
    });

    it('マッチしない場合は空配列を返す', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const results = result.current.searchCharactersByName('存在しない');
      expect(results).toEqual([]);
    });

    it('空文字で検索すると全キャラクターを返す', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const results = result.current.searchCharactersByName('');
      expect(results).toEqual(mockCharacters);
    });
  });

  describe('refetch', () => {
    it('refetchが正常に動作する', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 新しいデータでrefetch
      const newCharacters = [mockCharacters[0]];
      mockedCharacterApi.getAllCharacters.mockResolvedValue(newCharacters);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.characters).toEqual(newCharacters);
      expect(mockedCharacterApi.getAllCharacters).toHaveBeenCalledTimes(2);
    });
  });

  describe('ローディング状態', () => {
    it('データ取得中はloadingがtrueになる', async () => {
      let resolvePromise: (value: any[]) => void;
      const promise = new Promise<any[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockedCharacterApi.getAllCharacters.mockReturnValue(promise);

      const { result } = renderHook(() => useCharacters());

      // useEffectが実行されてローディング状態になるまで待つ
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // APIレスポンスを解決
      await act(async () => {
        resolvePromise!(mockCharacters);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.characters).toEqual(mockCharacters);
    });
  });

  describe('gameIdの変更', () => {
    it('gameIdが変更されると適切なAPIが呼ばれる', async () => {
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);
      mockedCharacterApi.getGameCharacters.mockResolvedValue([mockCharacters[0]]);

      const { result, rerender } = renderHook(
        ({ gameId }: { gameId: number | null }) => useCharacters(gameId),
        { initialProps: { gameId: null as number | null } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockedCharacterApi.getAllCharacters).toHaveBeenCalledTimes(1);

      // gameIdを変更
      rerender({ gameId: 1 });

      await waitFor(() => {
        expect(mockedCharacterApi.getGameCharacters).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('エラー状態の回復', () => {
    it('エラー後に再度fetchCharactersを実行すると成功する', async () => {
      // 最初はエラー
      mockedCharacterApi.getAllCharacters.mockRejectedValueOnce(new Error('Network Error'));

      const { result } = renderHook(() => useCharacters());

      await waitFor(() => {
        expect(result.current.error).toBe('キャラクターの取得に失敗しました');
      });

      // 2回目は成功
      mockedCharacterApi.getAllCharacters.mockResolvedValue(mockCharacters);

      await act(async () => {
        await result.current.fetchCharacters();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.characters).toEqual(mockCharacters);
    });
  });
});