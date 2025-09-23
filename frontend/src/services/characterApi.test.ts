import { characterApi } from './characterApi';
import apiClient from './api';

// apiClientのモック
jest.mock('./api');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockCharacter = {
  id: 1,
  name: '博麗霊夢',
  character_name: '博麗霊夢',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockCharacters = [
  mockCharacter,
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

describe('characterApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCharacters', () => {
    it('全キャラクター一覧を取得する', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockCharacters });

      const result = await characterApi.getAllCharacters();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/characters');
      expect(result).toEqual(mockCharacters);
    });

    it('空の配列が返される場合も正しく処理する', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] });

      const result = await characterApi.getAllCharacters();

      expect(result).toEqual([]);
    });

    it('APIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Network Error');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(characterApi.getAllCharacters()).rejects.toThrow('Network Error');
    });
  });

  describe('getCharacterById', () => {
    it('IDでキャラクターを取得する', async () => {
      const characterId = 1;
      mockedApiClient.get.mockResolvedValue({ data: mockCharacter });

      const result = await characterApi.getCharacterById(characterId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/characters/1');
      expect(result).toEqual(mockCharacter);
    });

    it('異なるIDでも正しく動作する', async () => {
      const characterId = 999;
      const notFoundCharacter = null;
      mockedApiClient.get.mockResolvedValue({ data: notFoundCharacter });

      const result = await characterApi.getCharacterById(characterId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/characters/999');
      expect(result).toBeNull();
    });

    it('存在しないIDの場合はAPIエラーを再投出する', async () => {
      const characterId = 999;
      const error = new Error('Character not found');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(characterApi.getCharacterById(characterId)).rejects.toThrow('Character not found');
    });
  });

  describe('getGameCharacters', () => {
    it('特定ゲームのキャラクター一覧を取得する', async () => {
      const gameId = 1;
      const gameCharacters = [mockCharacters[0], mockCharacters[1]]; // 霊夢と魔理沙のみ
      mockedApiClient.get.mockResolvedValue({ data: gameCharacters });

      const result = await characterApi.getGameCharacters(gameId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/games/1/characters');
      expect(result).toEqual(gameCharacters);
    });

    it('異なるゲームIDでも正しく動作する', async () => {
      const gameId = 6; // 東方紅魔郷
      mockedApiClient.get.mockResolvedValue({ data: mockCharacters });

      const result = await characterApi.getGameCharacters(gameId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/games/6/characters');
      expect(result).toEqual(mockCharacters);
    });

    it('キャラクターがいないゲームの場合は空配列を返す', async () => {
      const gameId = 999;
      mockedApiClient.get.mockResolvedValue({ data: [] });

      const result = await characterApi.getGameCharacters(gameId);

      expect(result).toEqual([]);
    });

    it('APIエラーが発生した場合はエラーを再投出する', async () => {
      const gameId = 1;
      const error = new Error('Game not found');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(characterApi.getGameCharacters(gameId)).rejects.toThrow('Game not found');
    });
  });

  describe('createCharacter', () => {
    it('新しいキャラクターを作成する', async () => {
      const characterData = {
        name: '八雲紫',
        character_name: '八雲紫',
      };

      const createdCharacter = {
        id: 4,
        ...characterData,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({ data: createdCharacter });

      const result = await characterApi.createCharacter(characterData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/characters', characterData);
      expect(result).toEqual(createdCharacter);
    });

    it('最小限のデータでキャラクターを作成する', async () => {
      const characterData = {
        name: 'テストキャラ',
      };

      const createdCharacter = {
        id: 5,
        name: 'テストキャラ',
        character_name: 'テストキャラ',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({ data: createdCharacter });

      const result = await characterApi.createCharacter(characterData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/characters', characterData);
      expect(result).toEqual(createdCharacter);
    });

    it('権限不足の場合はAPIエラーを再投出する', async () => {
      const characterData = { name: 'テスト' };
      const error = new Error('Insufficient permissions');
      mockedApiClient.post.mockRejectedValue(error);

      await expect(characterApi.createCharacter(characterData)).rejects.toThrow('Insufficient permissions');
    });

    it('バリデーションエラーの場合はAPIエラーを再投出する', async () => {
      const characterData = { name: '' }; // 空の名前
      const error = new Error('Name is required');
      mockedApiClient.post.mockRejectedValue(error);

      await expect(characterApi.createCharacter(characterData)).rejects.toThrow('Name is required');
    });
  });

  describe('updateCharacter', () => {
    it('キャラクター情報を更新する', async () => {
      const characterId = 1;
      const updateData = {
        name: '博麗霊夢（更新）',
        character_name: '博麗霊夢（更新）',
      };

      const updatedCharacter = {
        ...mockCharacter,
        ...updateData,
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedApiClient.put.mockResolvedValue({ data: updatedCharacter });

      const result = await characterApi.updateCharacter(characterId, updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith('/characters/1', updateData);
      expect(result).toEqual(updatedCharacter);
    });

    it('部分的な更新も正しく処理する', async () => {
      const characterId = 1;
      const updateData = {
        name: '新しい名前',
      };

      const updatedCharacter = {
        ...mockCharacter,
        name: '新しい名前',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedApiClient.put.mockResolvedValue({ data: updatedCharacter });

      const result = await characterApi.updateCharacter(characterId, updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith('/characters/1', updateData);
      expect(result).toEqual(updatedCharacter);
    });

    it('存在しないキャラクターの更新時はAPIエラーを再投出する', async () => {
      const characterId = 999;
      const updateData = { name: 'テスト' };
      const error = new Error('Character not found');
      mockedApiClient.put.mockRejectedValue(error);

      await expect(characterApi.updateCharacter(characterId, updateData)).rejects.toThrow('Character not found');
    });

    it('権限不足の場合はAPIエラーを再投出する', async () => {
      const characterId = 1;
      const updateData = { name: 'テスト' };
      const error = new Error('Insufficient permissions');
      mockedApiClient.put.mockRejectedValue(error);

      await expect(characterApi.updateCharacter(characterId, updateData)).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('deleteCharacter', () => {
    it('キャラクターを削除する', async () => {
      const characterId = 1;
      const deleteMessage = { message: 'Character deleted successfully' };
      mockedApiClient.delete.mockResolvedValue({ data: deleteMessage });

      const result = await characterApi.deleteCharacter(characterId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/characters/1');
      expect(result).toEqual(deleteMessage);
    });

    it('異なるIDのキャラクターも削除できる', async () => {
      const characterId = 999;
      const deleteMessage = { message: 'Character deleted successfully' };
      mockedApiClient.delete.mockResolvedValue({ data: deleteMessage });

      const result = await characterApi.deleteCharacter(characterId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/characters/999');
      expect(result).toEqual(deleteMessage);
    });

    it('存在しないキャラクターの削除時はAPIエラーを再投出する', async () => {
      const characterId = 999;
      const error = new Error('Character not found');
      mockedApiClient.delete.mockRejectedValue(error);

      await expect(characterApi.deleteCharacter(characterId)).rejects.toThrow('Character not found');
    });

    it('権限不足の場合はAPIエラーを再投出する', async () => {
      const characterId = 1;
      const error = new Error('Insufficient permissions');
      mockedApiClient.delete.mockRejectedValue(error);

      await expect(characterApi.deleteCharacter(characterId)).rejects.toThrow('Insufficient permissions');
    });

    it('関連データがある場合のAPIエラーを再投出する', async () => {
      const characterId = 1;
      const error = new Error('Cannot delete character with existing clear records');
      mockedApiClient.delete.mockRejectedValue(error);

      await expect(characterApi.deleteCharacter(characterId)).rejects.toThrow('Cannot delete character with existing clear records');
    });
  });

  describe('エラーハンドリング', () => {
    it('ネットワークエラーが発生した場合はエラーを再投出する', async () => {
      const networkError = new Error('Network Error');
      
      // 各メソッドでネットワークエラーをテスト
      mockedApiClient.get.mockRejectedValue(networkError);
      await expect(characterApi.getAllCharacters()).rejects.toThrow('Network Error');
      await expect(characterApi.getCharacterById(1)).rejects.toThrow('Network Error');
      await expect(characterApi.getGameCharacters(1)).rejects.toThrow('Network Error');

      mockedApiClient.post.mockRejectedValue(networkError);
      await expect(characterApi.createCharacter({ name: 'test' })).rejects.toThrow('Network Error');

      mockedApiClient.put.mockRejectedValue(networkError);
      await expect(characterApi.updateCharacter(1, { name: 'test' })).rejects.toThrow('Network Error');

      mockedApiClient.delete.mockRejectedValue(networkError);
      await expect(characterApi.deleteCharacter(1)).rejects.toThrow('Network Error');
    });

    it('サーバーエラーが発生した場合はエラーを再投出する', async () => {
      const serverError = new Error('Internal Server Error');
      
      mockedApiClient.get.mockRejectedValue(serverError);
      await expect(characterApi.getAllCharacters()).rejects.toThrow('Internal Server Error');
    });

    it('認証エラーが発生した場合はエラーを再投出する', async () => {
      const authError = new Error('Unauthorized');
      
      mockedApiClient.post.mockRejectedValue(authError);
      await expect(characterApi.createCharacter({ name: 'test' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('パラメータのエッジケース', () => {
    it('数値以外のIDでも正しくAPIコールする', async () => {
      const characterId = '1' as any; // 文字列のID
      mockedApiClient.get.mockResolvedValue({ data: mockCharacter });

      await characterApi.getCharacterById(characterId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/characters/1');
    });

    it('0のIDでも正しくAPIコールする', async () => {
      const characterId = 0;
      mockedApiClient.get.mockResolvedValue({ data: null });

      await characterApi.getCharacterById(characterId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/characters/0');
    });

    it('負の数のIDでも正しくAPIコールする', async () => {
      const characterId = -1;
      mockedApiClient.get.mockRejectedValue(new Error('Invalid ID'));

      await expect(characterApi.getCharacterById(characterId)).rejects.toThrow('Invalid ID');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/characters/-1');
    });

    it('空のオブジェクトでキャラクターを作成できる', async () => {
      const characterData = {};
      const error = new Error('Name is required');
      mockedApiClient.post.mockRejectedValue(error);

      await expect(characterApi.createCharacter(characterData)).rejects.toThrow('Name is required');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/characters', {});
    });

    it('空のオブジェクトでキャラクターを更新できる', async () => {
      const characterId = 1;
      const updateData = {};
      mockedApiClient.put.mockResolvedValue({ data: mockCharacter });

      const result = await characterApi.updateCharacter(characterId, updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith('/characters/1', {});
      expect(result).toEqual(mockCharacter);
    });
  });
});