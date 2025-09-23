import { clearRecordApi } from './clearRecordApi';
import apiClient from './api';

// apiClientのモック
jest.mock('./api');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockClearRecord = {
  id: 1,
  game_id: 1,
  character_id: 1,
  character_name: '霊夢',
  difficulty: 'Easy',
  mode: 'normal',
  is_cleared: true,
  is_no_continue_clear: false,
  is_no_bomb_clear: false,
  is_no_miss_clear: false,
  is_full_spell_card: false,
  is_special_clear_1: false,
  is_special_clear_2: false,
  is_special_clear_3: false,
  cleared_at: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockCharacters = [
  { id: 1, character_name: '霊夢', name: '霊夢' },
  { id: 2, character_name: '魔理沙', name: '魔理沙' },
  { id: 3, character_name: 'サニー', name: 'サニー' },
];

describe('clearRecordApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyClearRecords', () => {
    it('ユーザーのクリア記録一覧を取得する', async () => {
      const mockRecords = [mockClearRecord];
      mockedApiClient.get.mockResolvedValue({ data: mockRecords });

      const result = await clearRecordApi.getMyClearRecords();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/clear-records');
      expect(result).toEqual(mockRecords);
    });

    it('APIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Network Error');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(clearRecordApi.getMyClearRecords()).rejects.toThrow('Network Error');
    });
  });

  describe('getMyClearRecordsByGame', () => {
    it('特定ゲームのクリア記録を取得する', async () => {
      const gameId = 1;
      const mockRecords = [mockClearRecord];
      mockedApiClient.get.mockResolvedValue({ data: mockRecords });

      const result = await clearRecordApi.getMyClearRecordsByGame(gameId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/clear-records?game_id=1');
      expect(result).toEqual(mockRecords);
    });

    it('異なるゲームIDでも正しく動作する', async () => {
      const gameId = 999;
      mockedApiClient.get.mockResolvedValue({ data: [] });

      await clearRecordApi.getMyClearRecordsByGame(gameId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/clear-records?game_id=999');
    });
  });

  describe('createClearRecord', () => {
    it('クリア記録を作成する', async () => {
      const recordData = {
        game_id: 1,
        character_id: 1,
        difficulty: 'Easy',
        is_cleared: true,
        is_no_continue_clear: false,
        is_no_bomb_clear: false,
        is_no_miss_clear: false,
      };

      mockedApiClient.post.mockResolvedValue({ data: mockClearRecord });

      const result = await clearRecordApi.createClearRecord(recordData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records', recordData);
      expect(result).toEqual(mockClearRecord);
    });

    it('特殊クリア条件を含むレコードを作成する', async () => {
      const recordData = {
        game_id: 1,
        character_id: 1,
        difficulty: 'Lunatic',
        is_cleared: true,
        is_no_continue_clear: true,
        is_no_bomb_clear: true,
        is_no_miss_clear: true,
        is_special_clear_1: true,
        is_special_clear_2: false,
        is_special_clear_3: false,
        cleared_at: '2024-01-01',
      };

      const responseRecord = { ...mockClearRecord, ...recordData };
      mockedApiClient.post.mockResolvedValue({ data: responseRecord });

      const result = await clearRecordApi.createClearRecord(recordData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records', recordData);
      expect(result).toEqual(responseRecord);
    });
  });

  describe('updateClearRecord', () => {
    it('クリア記録を更新する', async () => {
      const recordId = 1;
      const updateData = {
        is_no_miss_clear: true,
        is_no_bomb_clear: true,
      };

      const updatedRecord = { ...mockClearRecord, ...updateData };
      mockedApiClient.put.mockResolvedValue({ data: updatedRecord });

      const result = await clearRecordApi.updateClearRecord(recordId, updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith('/clear-records/1', updateData);
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('deleteClearRecord', () => {
    it('クリア記録を削除する', async () => {
      const recordId = 1;
      const deleteMessage = { message: 'Record deleted successfully' };
      mockedApiClient.delete.mockResolvedValue({ data: deleteMessage });

      const result = await clearRecordApi.deleteClearRecord(recordId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/clear-records/1');
      expect(result).toEqual(deleteMessage);
    });
  });

  describe('createOrUpdateClearRecord', () => {
    it('クリア記録をUPSERTする', async () => {
      const recordData = {
        game_id: 1,
        character_id: 1,
        difficulty: 'Normal',
        is_cleared: true,
      };

      mockedApiClient.post.mockResolvedValue({ data: mockClearRecord });

      const result = await clearRecordApi.createOrUpdateClearRecord(recordData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records/upsert', recordData);
      expect(result).toEqual(mockClearRecord);
    });
  });

  describe('batchCreateOrUpdateRecords', () => {
    it('複数のクリア記録を一括処理する', async () => {
      const recordsData = [
        {
          game_id: 1,
          character_id: 1,
          difficulty: 'Easy',
          is_cleared: true,
        },
        {
          game_id: 1,
          character_id: 2,
          difficulty: 'Easy',
          is_cleared: false,
        },
      ];

      const mockBatchResponse = [
        { ...mockClearRecord, id: 1 },
        { ...mockClearRecord, id: 2, character_id: 2, is_cleared: false },
      ];

      mockedApiClient.post.mockResolvedValue({ data: mockBatchResponse });

      const result = await clearRecordApi.batchCreateOrUpdateRecords(recordsData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records/batch', {
        records: recordsData,
      });
      expect(result).toEqual(mockBatchResponse);
    });

    it('空の配列でも正しく処理する', async () => {
      const recordsData: any[] = [];
      mockedApiClient.post.mockResolvedValue({ data: [] });

      const result = await clearRecordApi.batchCreateOrUpdateRecords(recordsData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records/batch', {
        records: [],
      });
      expect(result).toEqual([]);
    });
  });

  describe('submitIndividualConditions', () => {
    it('機体別条件データを正しく変換して送信する', async () => {
      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = {
        characters: {
          '1': {
            cleared: true,
            no_continue: false,
            no_bomb: false,
            no_miss: false,
          },
          '2': {
            cleared: false,
            no_continue: false,
            no_bomb: true,
            no_miss: false,
          },
        },
      };

      const expectedRecordsData = [
        {
          game_id: 1,
          character_name: '霊夢',
          difficulty: 'Easy',
          mode: 'normal',
          is_cleared: true,
          is_no_continue_clear: false,
          is_no_bomb_clear: false,
          is_no_miss_clear: false,
          is_full_spell_card: false,
          is_special_clear_1: false,
          is_special_clear_2: false,
          is_special_clear_3: false,
          cleared_at: expect.any(String),
        },
        {
          game_id: 1,
          character_name: '魔理沙',
          difficulty: 'Easy',
          mode: 'normal',
          is_cleared: false,
          is_no_continue_clear: false,
          is_no_bomb_clear: true,
          is_no_miss_clear: false,
          is_full_spell_card: false,
          is_special_clear_1: false,
          is_special_clear_2: false,
          is_special_clear_3: false,
          cleared_at: null,
        },
      ];

      mockedApiClient.post.mockResolvedValue({ data: [] });

      const result = await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        mockCharacters as any
      );

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records/batch', {
        records: expectedRecordsData,
      });
    });

    it('特殊クリア条件を含む条件データを正しく処理する', async () => {
      const gameId = 1;
      const difficulty = 'Lunatic';
      const difficultyData = {
        characters: {
          '1': {
            cleared: true,
            no_continue: true,
            no_bomb: true,
            no_miss: true,
            full_spell_card: true,
            special_clear_1: true,
            special_clear_2: false,
            special_clear_3: true,
          },
        },
      };

      const expectedRecordData = {
        game_id: 1,
        character_name: '霊夢',
        difficulty: 'Lunatic',
        mode: 'normal',
        is_cleared: true,
        is_no_continue_clear: true,
        is_no_bomb_clear: true,
        is_no_miss_clear: true,
        is_full_spell_card: true,
        is_special_clear_1: true,
        is_special_clear_2: false,
        is_special_clear_3: true,
        cleared_at: expect.any(String),
      };

      mockedApiClient.post.mockResolvedValue({ data: [] });

      await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        mockCharacters as any
      );

      expect(mockedApiClient.post).toHaveBeenCalledWith('/clear-records/batch', {
        records: [expectedRecordData],
      });
    });

    it('カスタムモードを指定して送信する', async () => {
      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = {
        characters: {
          '1': { cleared: true },
        },
      };
      const mode = 'legacy';

      mockedApiClient.post.mockResolvedValue({ data: [] });

      await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        mockCharacters as any,
        mode
      );

      const expectedCall = mockedApiClient.post.mock.calls[0][1] as any;
      expect(expectedCall.records[0].mode).toBe('legacy');
    });

    it('キャラクター情報がない場合はデフォルト名を使用する', async () => {
      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = {
        characters: {
          '999': { cleared: true }, // 存在しないキャラクターID
        },
      };

      mockedApiClient.post.mockResolvedValue({ data: [] });

      await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        mockCharacters as any
      );

      const expectedCall = mockedApiClient.post.mock.calls[0][1] as any;
      expect(expectedCall.records[0].character_name).toBe('霊夢');
    });

    it('条件が空の場合は空配列を返す', async () => {
      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = {
        characters: {},
      };

      const result = await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        mockCharacters as any
      );

      expect(result).toEqual([]);
      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });

    it('difficultyData.charactersがundefinedの場合は空配列を返す', async () => {
      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = {};

      const result = await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        mockCharacters as any
      );

      expect(result).toEqual([]);
      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });

    it('cleared_atが正しく設定される', async () => {
      const gameId = 1;
      const difficulty = 'Easy';
      const currentDate = new Date().toISOString().split('T')[0];

      // クリア済みの場合
      const clearedData = {
        characters: {
          '1': { cleared: true },
        },
      };

      // 未クリアの場合
      const notClearedData = {
        characters: {
          '2': { cleared: false },
        },
      };

      mockedApiClient.post.mockResolvedValue({ data: [] });

      // クリア済みケース
      await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        clearedData,
        mockCharacters as any
      );

      let expectedCall = mockedApiClient.post.mock.calls[0][1] as any;
      expect(expectedCall.records[0].cleared_at).toBe(currentDate);

      // 未クリアケース
      await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        notClearedData,
        mockCharacters as any
      );

      expectedCall = mockedApiClient.post.mock.calls[1][1] as any;
      expect(expectedCall.records[0].cleared_at).toBeNull();
    });

    it('character_nameとnameの両方をサポートする', async () => {
      const charactersWithName = [
        { id: 1, name: '霊夢A' }, // character_nameがない場合
        { id: 2, character_name: '魔理沙B', name: '魔理沙C' }, // 両方ある場合
      ];

      const gameId = 1;
      const difficulty = 'Easy';
      const difficultyData = {
        characters: {
          '1': { cleared: true },
          '2': { cleared: true },
        },
      };

      mockedApiClient.post.mockResolvedValue({ data: [] });

      await clearRecordApi.submitIndividualConditions(
        gameId,
        difficulty,
        difficultyData,
        charactersWithName as any
      );

      const expectedCall = mockedApiClient.post.mock.calls[0][1] as any;
      expect(expectedCall.records[0].character_name).toBe('霊夢A'); // nameを使用
      expect(expectedCall.records[1].character_name).toBe('魔理沙B'); // character_nameを優先
    });
  });

  describe('エラーハンドリング', () => {
    it('各メソッドでAPIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('API Error');

      // getMyClearRecords
      mockedApiClient.get.mockRejectedValue(error);
      await expect(clearRecordApi.getMyClearRecords()).rejects.toThrow('API Error');

      // createClearRecord
      mockedApiClient.post.mockRejectedValue(error);
      await expect(clearRecordApi.createClearRecord({})).rejects.toThrow('API Error');

      // updateClearRecord
      mockedApiClient.put.mockRejectedValue(error);
      await expect(clearRecordApi.updateClearRecord(1, {})).rejects.toThrow('API Error');

      // deleteClearRecord
      mockedApiClient.delete.mockRejectedValue(error);
      await expect(clearRecordApi.deleteClearRecord(1)).rejects.toThrow('API Error');
    });

    it('submitIndividualConditionsでAPIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Batch API Error');
      mockedApiClient.post.mockRejectedValue(error);

      const difficultyData = {
        characters: {
          '1': { cleared: true },
        },
      };

      await expect(
        clearRecordApi.submitIndividualConditions(1, 'Easy', difficultyData, mockCharacters as any)
      ).rejects.toThrow('Batch API Error');
    });
  });
});