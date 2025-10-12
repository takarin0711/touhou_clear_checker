import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndividualTabClearForm from './IndividualTabClearForm';
import { useClearRecords } from '../../../hooks/useClearRecords';
import { useGameCharacters } from '../../games/hooks/useGameCharacters';

// モック
jest.mock('../../../hooks/useClearRecords');
jest.mock('../../games/hooks/useGameCharacters');

const mockedUseClearRecords = useClearRecords as jest.MockedFunction<typeof useClearRecords>;
const mockedUseGameCharacters = useGameCharacters as jest.MockedFunction<typeof useGameCharacters>;

// 通常のゲーム（東方紅魔郷）
const normalGame = {
  id: 1,
  title: '東方紅魔郷',
  series_number: 6.0,
  release_year: 2002,
  game_type: 'main_series'
};

// 妖精大戦争
const fairyWarsGame = {
  id: 8,
  title: '妖精大戦争',
  series_number: 12.8,
  release_year: 2010,
  game_type: 'spin_off_stg'
};

// 錦上京（特殊クリア条件1を持つゲーム）
const kinjokyoGame = {
  id: 16,
  title: '東方錦上京',
  series_number: 20.0,
  release_year: 2025,
  game_type: 'main_series'
};

// 鬼形獣（特殊クリア条件1と2を持つゲーム）
const kikeijuGame = {
  id: 13,
  title: '東方鬼形獣',
  series_number: 17.0,
  release_year: 2019,
  game_type: 'main_series'
};

// 通常のキャラクター（東方紅魔郷）
const normalCharacters = [
  { id: 1, game_id: 1, character_name: '霊夢A', sort_order: 1 },
  { id: 2, game_id: 1, character_name: '霊夢B', sort_order: 2 },
  { id: 3, game_id: 1, character_name: '魔理沙A', sort_order: 3 },
  { id: 4, game_id: 1, character_name: '魔理沙B', sort_order: 4 },
];

// 妖精大戦争のキャラクター
const fairyWarsCharacters = [
  { id: 21, game_id: 8, character_name: 'チルノ（Route A1）', sort_order: 1 },
  { id: 22, game_id: 8, character_name: 'チルノ（Route A2）', sort_order: 2 },
  { id: 23, game_id: 8, character_name: 'チルノ（Route B1）', sort_order: 3 },
  { id: 24, game_id: 8, character_name: 'チルノ（Route B2）', sort_order: 4 },
  { id: 25, game_id: 8, character_name: 'チルノ（Route C1）', sort_order: 5 },
  { id: 26, game_id: 8, character_name: 'チルノ（Route C2）', sort_order: 6 },
  { id: 27, game_id: 8, character_name: 'チルノ（Extra）', sort_order: 7 },
];

// 錦上京のキャラクター（霊夢・魔理沙×8異変石）
const kinjokyoCharacters = [
  { id: 101, game_id: 16, character_name: '霊夢（スカーレットデビル）', sort_order: 1 },
  { id: 102, game_id: 16, character_name: '霊夢（クリーチャーレッド）', sort_order: 2 },
  { id: 103, game_id: 16, character_name: '魔理沙（スカーレットデビル）', sort_order: 9 },
  { id: 104, game_id: 16, character_name: '魔理沙（クリーチャーレッド）', sort_order: 10 },
];

// 鬼形獣のキャラクター（霊夢・魔理沙・妖夢×3アニマル）
const kikeijuCharacters = [
  { id: 81, game_id: 13, character_name: '霊夢（オオカミ）', sort_order: 1 },
  { id: 82, game_id: 13, character_name: '霊夢（カワウソ）', sort_order: 2 },
  { id: 83, game_id: 13, character_name: '魔理沙（オオカミ）', sort_order: 4 },
  { id: 84, game_id: 13, character_name: '妖夢（オオカミ）', sort_order: 7 },
];

const defaultMockClearRecords = {
  clearRecords: [],
  loading: false,
  error: null,
  fetchClearRecords: jest.fn(),
  submitIndividualConditions: jest.fn(),
  clearError: jest.fn(),
  refetch: jest.fn(),
};

const defaultMockGameCharacters = {
  characters: [],
  loading: false,
  error: null,
  fetchCharacters: jest.fn(),
  createCharacter: jest.fn(),
  updateCharacter: jest.fn(),
  deleteCharacter: jest.fn(),
  clearError: jest.fn(),
};

describe('IndividualTabClearForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseClearRecords.mockReturnValue(defaultMockClearRecords);
    mockedUseGameCharacters.mockReturnValue(defaultMockGameCharacters);
  });

  describe('通常のゲーム', () => {
    beforeEach(() => {
      mockedUseGameCharacters.mockReturnValue({
        ...defaultMockGameCharacters,
        characters: normalCharacters,
      });
    });

    it('機体別条件登録と表示される', () => {
      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('機体別条件登録')).toBeInTheDocument();
    });

    it('機体列ヘッダーが表示される', () => {
      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('機体')).toBeInTheDocument();
    });

    it('機体別条件設定タイトルが表示される', () => {
      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('Easy - 機体別条件設定')).toBeInTheDocument();
    });

    it('全ての機体が表示される', () => {
      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('霊夢A')).toBeInTheDocument();
      expect(screen.getByText('霊夢B')).toBeInTheDocument();
      expect(screen.getByText('魔理沙A')).toBeInTheDocument();
      expect(screen.getByText('魔理沙B')).toBeInTheDocument();
    });
  });

  describe('妖精大戦争の特殊表示', () => {
    beforeEach(() => {
      mockedUseGameCharacters.mockReturnValue({
        ...defaultMockGameCharacters,
        characters: fairyWarsCharacters,
      });
    });

    it('ルート別条件登録と表示される', () => {
      render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('ルート別条件登録')).toBeInTheDocument();
      expect(screen.queryByText('機体別条件登録')).not.toBeInTheDocument();
    });

    it('ルート列ヘッダーが表示される', () => {
      render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('ルート')).toBeInTheDocument();
      expect(screen.queryByText('機体')).not.toBeInTheDocument();
    });

    it('ルート別条件設定タイトルが表示される', () => {
      render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      expect(screen.getByText('Easy - ルート別条件設定')).toBeInTheDocument();
      expect(screen.queryByText('Easy - 機体別条件設定')).not.toBeInTheDocument();
    });

    describe('Easy/Normal/Hard/Lunaticタブでの表示', () => {
      const testDifficulties = ['Easy', 'Normal', 'Hard', 'Lunatic'];

      testDifficulties.forEach(difficulty => {
        it(`${difficulty}タブではRoute A1〜C2のみ表示される`, () => {
          render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
          
          // 該当する難易度タブをクリック
          if (difficulty !== 'Easy') {
            fireEvent.click(screen.getByText(difficulty));
          }
          
          // Route A1〜C2が表示されている
          expect(screen.getByText('チルノ（Route A1）')).toBeInTheDocument();
          expect(screen.getByText('チルノ（Route A2）')).toBeInTheDocument();
          expect(screen.getByText('チルノ（Route B1）')).toBeInTheDocument();
          expect(screen.getByText('チルノ（Route B2）')).toBeInTheDocument();
          expect(screen.getByText('チルノ（Route C1）')).toBeInTheDocument();
          expect(screen.getByText('チルノ（Route C2）')).toBeInTheDocument();
          
          // Extraは表示されない
          expect(screen.queryByText('チルノ（Extra）')).not.toBeInTheDocument();
        });
      });
    });

    describe('Extraタブでの表示', () => {
      it('ExtraタブではExtraのみ表示される', () => {
        render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
        
        // Extraタブをクリック
        fireEvent.click(screen.getByText('Extra'));
        
        // Extraのみが表示されている
        expect(screen.getByText('チルノ（Extra）')).toBeInTheDocument();
        
        // Route A1〜C2は表示されない
        expect(screen.queryByText('チルノ（Route A1）')).not.toBeInTheDocument();
        expect(screen.queryByText('チルノ（Route A2）')).not.toBeInTheDocument();
        expect(screen.queryByText('チルノ（Route B1）')).not.toBeInTheDocument();
        expect(screen.queryByText('チルノ（Route B2）')).not.toBeInTheDocument();
        expect(screen.queryByText('チルノ（Route C1）')).not.toBeInTheDocument();
        expect(screen.queryByText('チルノ（Route C2）')).not.toBeInTheDocument();
      });

      it('Extraタブでもルート別条件設定と表示される', () => {
        render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
        
        fireEvent.click(screen.getByText('Extra'));
        
        expect(screen.getByText('Extra - ルート別条件設定')).toBeInTheDocument();
      });
    });

    describe('タブ切り替え動作', () => {
      it('タブ切り替えによってキャラクター表示が正しく変わる', () => {
        render(<IndividualTabClearForm game={fairyWarsGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
        
        // 初期状態（Easy）ではRoute A1〜C2が表示
        expect(screen.getByText('チルノ（Route A1）')).toBeInTheDocument();
        expect(screen.queryByText('チルノ（Extra）')).not.toBeInTheDocument();
        
        // Extraタブに切り替え
        fireEvent.click(screen.getByText('Extra'));
        
        // ExtraのみがByText('チルノ（Extra）')).toBeInTheDocument();
        expect(screen.queryByText('チルノ（Route A1）')).not.toBeInTheDocument();
        
        // Hardタブに切り替え
        fireEvent.click(screen.getByText('Hard'));
        
        // 再びRoute A1〜C2が表示
        expect(screen.getByText('チルノ（Route A1）')).toBeInTheDocument();
        expect(screen.queryByText('チルノ（Extra）')).not.toBeInTheDocument();
      });
    });
  });

  describe('基本機能', () => {
    beforeEach(() => {
      mockedUseGameCharacters.mockReturnValue({
        ...defaultMockGameCharacters,
        characters: normalCharacters,
      });
    });

    it('閉じるボタンが機能する', () => {
      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      fireEvent.click(screen.getByText('閉じる'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('難易度タブが正しく表示される', () => {
      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Lunatic')).toBeInTheDocument();
      expect(screen.getByText('Extra')).toBeInTheDocument();
    });

    it('ローディング状態が正しく表示される', () => {
      mockedUseGameCharacters.mockReturnValue({
        ...defaultMockGameCharacters,
        loading: true,
      });

      render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('機体情報を読み込み中...')).toBeInTheDocument();
    });
  });

  describe('特殊クリア条件の表示', () => {
    describe('錦上京（特殊クリア条件1のみ）', () => {
      beforeEach(() => {
        mockedUseGameCharacters.mockReturnValue({
          ...defaultMockGameCharacters,
          characters: kinjokyoCharacters,
        });
      });

      it('ノー霊撃列ヘッダーが表示される', () => {
        render(<IndividualTabClearForm game={kinjokyoGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('ノー霊撃')).toBeInTheDocument();
      });

      it('基本クリア条件列が表示される', () => {
        render(<IndividualTabClearForm game={kinjokyoGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('クリア')).toBeInTheDocument();
        expect(screen.getByText('ノーコン')).toBeInTheDocument();
        expect(screen.getByText('ノーミス')).toBeInTheDocument();
        expect(screen.getByText('ノーボム')).toBeInTheDocument();
        expect(screen.getByText('フルスペカ')).toBeInTheDocument();
      });

      it('特殊クリア条件2の列は表示されない', () => {
        render(<IndividualTabClearForm game={kinjokyoGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // 鬼形獣の「ノー霊撃」は特殊条件2なので、錦上京では表示されるべきは「ノー霊撃」（特殊条件1）のみ
        const noReigekiHeaders = screen.getAllByText('ノー霊撃');
        expect(noReigekiHeaders).toHaveLength(1); // ヘッダーのみ
      });

      it('機体別条件登録と表示される', () => {
        render(<IndividualTabClearForm game={kinjokyoGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('機体別条件登録')).toBeInTheDocument();
      });
    });

    describe('鬼形獣（特殊クリア条件1と2）', () => {
      beforeEach(() => {
        mockedUseGameCharacters.mockReturnValue({
          ...defaultMockGameCharacters,
          characters: kikeijuCharacters,
        });
      });

      it('ノー暴走列ヘッダーが表示される', () => {
        render(<IndividualTabClearForm game={kikeijuGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('ノー暴走')).toBeInTheDocument();
      });

      it('ノー霊撃列ヘッダーが表示される', () => {
        render(<IndividualTabClearForm game={kikeijuGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('ノー霊撃')).toBeInTheDocument();
      });

      it('両方の特殊条件が表示される', () => {
        render(<IndividualTabClearForm game={kikeijuGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        // ノー暴走（special_clear_1）
        expect(screen.getByText('ノー暴走')).toBeInTheDocument();
        // ノー霊撃（special_clear_2）
        expect(screen.getByText('ノー霊撃')).toBeInTheDocument();
      });

      it('基本クリア条件列も表示される', () => {
        render(<IndividualTabClearForm game={kikeijuGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('クリア')).toBeInTheDocument();
        expect(screen.getByText('ノーコン')).toBeInTheDocument();
        expect(screen.getByText('ノーミス')).toBeInTheDocument();
        expect(screen.getByText('ノーボム')).toBeInTheDocument();
        expect(screen.getByText('フルスペカ')).toBeInTheDocument();
      });
    });

    describe('通常ゲーム（特殊クリア条件なし）', () => {
      beforeEach(() => {
        mockedUseGameCharacters.mockReturnValue({
          ...defaultMockGameCharacters,
          characters: normalCharacters,
        });
      });

      it('特殊クリア条件列は表示されない', () => {
        render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.queryByText('ノー霊撃')).not.toBeInTheDocument();
        expect(screen.queryByText('ノー暴走')).not.toBeInTheDocument();
        expect(screen.queryByText('ノーアイス')).not.toBeInTheDocument();
      });

      it('基本クリア条件列のみ表示される', () => {
        render(<IndividualTabClearForm game={normalGame} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

        expect(screen.getByText('クリア')).toBeInTheDocument();
        expect(screen.getByText('ノーコン')).toBeInTheDocument();
        expect(screen.getByText('ノーミス')).toBeInTheDocument();
        expect(screen.getByText('ノーボム')).toBeInTheDocument();
        expect(screen.getByText('フルスペカ')).toBeInTheDocument();
      });
    });
  });
});