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
});