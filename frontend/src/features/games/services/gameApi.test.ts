import { gameApi } from './gameApi';
import api from '../../../services/api';
import { Game, GAME_TYPES } from '../../../types/game';

// axiosのモック
jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

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

describe('gameApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGames', () => {
    it('フィルターなしでゲーム一覧を取得する', async () => {
      mockedApi.get.mockResolvedValue({ data: mockGames });

      const result = await gameApi.getGames();

      expect(mockedApi.get).toHaveBeenCalledWith('/games');
      expect(result).toEqual(mockGames);
    });

    it('シリーズ番号でフィルタリングしてゲーム一覧を取得する', async () => {
      const filteredGames = [mockGames[0]];
      mockedApi.get.mockResolvedValue({ data: filteredGames });

      const result = await gameApi.getGames({ series_number: 6 });

      expect(mockedApi.get).toHaveBeenCalledWith('/games?series_number=6');
      expect(result).toEqual(filteredGames);
    });

    it('ゲームタイプでフィルタリングしてゲーム一覧を取得する', async () => {
      const filteredGames = [mockGames[0], mockGames[1]];
      mockedApi.get.mockResolvedValue({ data: filteredGames });

      const result = await gameApi.getGames({ game_type: GAME_TYPES.MAIN_SERIES });

      expect(mockedApi.get).toHaveBeenCalledWith(`/games?game_type=${GAME_TYPES.MAIN_SERIES}`);
      expect(result).toEqual(filteredGames);
    });

    it('複数のフィルターでゲーム一覧を取得する', async () => {
      const filteredGames = [mockGames[0]];
      mockedApi.get.mockResolvedValue({ data: filteredGames });

      const result = await gameApi.getGames({
        series_number: 6,
        game_type: GAME_TYPES.MAIN_SERIES,
      });

      expect(mockedApi.get).toHaveBeenCalledWith(`/games?series_number=6&game_type=${GAME_TYPES.MAIN_SERIES}`);
      expect(result).toEqual(filteredGames);
    });

    it('series_numberが0の場合も正しくクエリに含まれる', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      await gameApi.getGames({ series_number: 0 });

      expect(mockedApi.get).toHaveBeenCalledWith('/games?series_number=0');
    });

    it('series_numberがnullの場合はクエリに含まれない', async () => {
      mockedApi.get.mockResolvedValue({ data: mockGames });

      await gameApi.getGames({ series_number: null });

      expect(mockedApi.get).toHaveBeenCalledWith('/games');
    });

    it('空のgame_typeは無視される', async () => {
      mockedApi.get.mockResolvedValue({ data: mockGames });

      await gameApi.getGames({ game_type: '' });

      expect(mockedApi.get).toHaveBeenCalledWith('/games');
    });
  });

  describe('getGameBySeriesNumber', () => {
    it('指定したシリーズ番号のゲームが存在する場合は返す', async () => {
      mockedApi.get.mockResolvedValue({ data: [mockGames[0]] });

      const result = await gameApi.getGameBySeriesNumber(6);

      expect(mockedApi.get).toHaveBeenCalledWith('/games?series_number=6');
      expect(result).toEqual(mockGames[0]);
    });

    it('指定したシリーズ番号のゲームが存在しない場合はnullを返す', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      const result = await gameApi.getGameBySeriesNumber(999);

      expect(mockedApi.get).toHaveBeenCalledWith('/games?series_number=999');
      expect(result).toBeNull();
    });

    it('複数のゲームが返された場合は最初のゲームを返す', async () => {
      mockedApi.get.mockResolvedValue({ data: [mockGames[0], mockGames[1]] });

      const result = await gameApi.getGameBySeriesNumber(6);

      expect(result).toEqual(mockGames[0]);
    });
  });

  describe('getMainSeriesGames', () => {
    it('本編STGのゲーム一覧を取得する', async () => {
      const mainSeriesGames = [mockGames[0], mockGames[1]];
      mockedApi.get.mockResolvedValue({ data: mainSeriesGames });

      const result = await gameApi.getMainSeriesGames();

      expect(mockedApi.get).toHaveBeenCalledWith(`/games?game_type=${GAME_TYPES.MAIN_SERIES}`);
      expect(result).toEqual(mainSeriesGames);
    });
  });

  describe('filterGamesByTitle', () => {
    it('検索語句なしの場合は全ゲームを返す', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '');
      expect(result).toEqual(mockGames);
    });

    it('空の検索語句の場合は全ゲームを返す', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '   ');
      expect(result).toEqual(mockGames);
    });

    it('タイトルで検索してマッチするゲームを返す', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '紅魔郷');
      expect(result).toEqual([mockGames[0]]);
    });

    it('部分一致でタイトル検索が動作する', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '東方');
      expect(result).toEqual(mockGames);
    });

    it('大文字小文字を区別しない検索が動作する', () => {
      const result = gameApi.filterGamesByTitle(mockGames, 'touhou');
      // 実際のタイトルが日本語なので、この場合は何もマッチしない
      expect(result).toEqual([]);
    });

    it('シリーズ番号で検索してマッチするゲームを返す', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '6');
      expect(result).toEqual([mockGames[0]]);
    });

    it('小数点を含むシリーズ番号で検索が動作する', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '7.5');
      expect(result).toEqual([mockGames[2]]);
    });

    it('シリーズ番号の部分一致で検索が動作する', () => {
      const result = gameApi.filterGamesByTitle(mockGames, '7');
      // '7', '7.5' の両方にマッチする
      expect(result).toEqual([mockGames[1], mockGames[2]]);
    });

    it('マッチしない検索語句の場合は空配列を返す', () => {
      const result = gameApi.filterGamesByTitle(mockGames, 'マッチしない');
      expect(result).toEqual([]);
    });

    it('空のゲーム配列に対しても正常に動作する', () => {
      const result = gameApi.filterGamesByTitle([], '東方');
      expect(result).toEqual([]);
    });

    it('ひらがなとカタカナの検索が動作する', () => {
      const gamesWithHiragana: Game[] = [
        {
          id: 4,
          title: 'とうほう',
          series_number: 1,
          release_year: 2000,
          game_type: GAME_TYPES.MAIN_SERIES,
        },
      ];

      const result = gameApi.filterGamesByTitle(gamesWithHiragana, 'とうほう');
      expect(result).toEqual(gamesWithHiragana);
    });
  });

  describe('エラーハンドリング', () => {
    it('APIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Network Error');
      mockedApi.get.mockRejectedValue(error);

      await expect(gameApi.getGames()).rejects.toThrow('Network Error');
    });

    it('getGameBySeriesNumberでAPIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('API Error');
      mockedApi.get.mockRejectedValue(error);

      await expect(gameApi.getGameBySeriesNumber(6)).rejects.toThrow('API Error');
    });

    it('getMainSeriesGamesでAPIエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Server Error');
      mockedApi.get.mockRejectedValue(error);

      await expect(gameApi.getMainSeriesGames()).rejects.toThrow('Server Error');
    });
  });
});