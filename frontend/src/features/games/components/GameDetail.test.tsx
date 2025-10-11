import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameDetail from './GameDetail';
import { Game, GAME_TYPES } from '../../../types/game';

// モック設定
jest.mock('../../../hooks/useClearRecords');
jest.mock('../../../hooks/useGameMemo');
jest.mock('../hooks/useGameCharacters');
jest.mock('../../../components/common/Badge', () => {
  return function MockBadge({ children }: any) {
    return <span>{children}</span>;
  };
});
jest.mock('../../../components/common/Button', () => {
  return function MockButton({ children, onClick, variant, size, ...props }: any) {
    return (
      <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
        {children}
      </button>
    );
  };
});
jest.mock('../../clearRecords/components/IndividualTabClearForm', () => {
  return function MockIndividualTabClearForm({ onClose, onSuccess }: any) {
    return (
      <div data-testid="individual-form">
        <button onClick={onClose}>フォーム閉じる</button>
        <button onClick={onSuccess}>フォーム成功</button>
      </div>
    );
  };
});

const { useClearRecords } = require('../../../hooks/useClearRecords');
const { useGameMemo } = require('../../../hooks/useGameMemo');
const { useGameCharacters } = require('../hooks/useGameCharacters');

// テスト用のモックゲームデータ
const mockGame: Game = {
  id: 1,
  title: '東方紅魔郷',
  series_number: 6,
  release_year: 2002,
  game_type: GAME_TYPES.MAIN_SERIES,
};

const mockGameKishin: Game = {
  id: 11,
  title: '東方紺珠伝',
  series_number: 15,
  release_year: 2015,
  game_type: GAME_TYPES.MAIN_SERIES,
};

const mockClearRecords = [
  {
    id: 1,
    game_id: 1,
    difficulty: 'Easy',
    character_name: '霊夢',
    mode: 'normal',
    is_cleared: true,
    is_no_continue_clear: false,
    is_no_bomb_clear: false,
    is_no_miss_clear: false,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
  },
  {
    id: 2,
    game_id: 1,
    difficulty: 'Normal',
    character_name: '魔理沙',
    mode: 'normal',
    is_cleared: true,
    is_no_continue_clear: true,
    is_no_bomb_clear: false,
    is_no_miss_clear: false,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
  },
  {
    id: 3,
    game_id: 1,
    difficulty: 'Hard',
    character_name: '咲夜',
    mode: 'normal',
    is_cleared: true,
    is_no_continue_clear: false,
    is_no_bomb_clear: true,
    is_no_miss_clear: false,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
  },
];

const mockKishinClearRecords = [
  {
    id: 4,
    game_id: 11,
    difficulty: 'Easy',
    character_name: '霊夢',
    mode: 'pointdevice',
    is_cleared: true,
    is_no_continue_clear: false,
    is_no_bomb_clear: false,
    is_no_miss_clear: false,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
  },
  {
    id: 5,
    game_id: 11,
    difficulty: 'Normal',
    character_name: '魔理沙',
    mode: 'legacy',
    is_cleared: true,
    is_no_continue_clear: false,
    is_no_bomb_clear: false,
    is_no_miss_clear: false,
    is_full_spell_card: false,
    is_special_clear_1: false,
    is_special_clear_2: false,
    is_special_clear_3: false,
  },
];

const mockCharacters = [
  { id: 1, game_id: 1, character_name: '霊夢' },
  { id: 2, game_id: 1, character_name: '魔理沙' },
];

describe('GameDetail', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモック設定
    useClearRecords.mockReturnValue({
      clearRecords: [],
      loading: false,
      error: null,
      fetchClearRecords: jest.fn(),
      submitIndividualConditions: jest.fn(),
      clearError: jest.fn(),
      refetch: jest.fn(),
    });

    useGameMemo.mockReturnValue({
      memo: null,
      loading: false,
      error: null,
      saving: false,
      saveMemo: jest.fn(),
      getMemoText: jest.fn(() => ''),
      hasMemo: jest.fn(() => false),
    });

    useGameCharacters.mockReturnValue({
      characters: mockCharacters,
      loading: false,
      error: null,
    });
  });

  describe('基本表示', () => {
    it('ゲーム情報が正しく表示される', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('東方紅魔郷')).toBeInTheDocument();
      expect(screen.getByText(/第6作/)).toBeInTheDocument();
      expect(screen.getByText(/2002年/)).toBeInTheDocument();
    });

    it('戻るボタンがクリック可能', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      const backButton = screen.getByText('← ゲーム一覧に戻る');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('クリア記録登録ボタンが表示される', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('クリア記録登録')).toBeInTheDocument();
    });
  });

  describe('クリア記録が無い場合', () => {
    it('クリア記録が無いメッセージが表示される', () => {
      useClearRecords.mockReturnValue({
        clearRecords: [],
        loading: false,
        error: null,
        fetchClearRecords: jest.fn(),
        submitIndividualConditions: jest.fn(),
        clearError: jest.fn(),
        refetch: jest.fn(),
      });

      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('まだクリア記録が登録されていません')).toBeInTheDocument();
    });
  });

  describe('クリア記録がある場合', () => {
    beforeEach(() => {
      useClearRecords.mockReturnValue({
        clearRecords: mockClearRecords,
        loading: false,
        error: null,
        fetchClearRecords: jest.fn(),
        submitIndividualConditions: jest.fn(),
        clearError: jest.fn(),
        refetch: jest.fn(),
      });
    });

    it('難易度タブが表示される', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      // タブとして表示される難易度ボタンを確認
      const tabs = screen.getAllByRole('button');
      const tabTexts = tabs.map(tab => tab.textContent);

      expect(tabTexts).toContain('Easy');
      expect(tabTexts).toContain('Normal');
      expect(tabTexts).toContain('Hard');
      expect(tabTexts).toContain('Lunatic');
      expect(tabTexts).toContain('Extra');
    });

    it('難易度タブをクリックすると表示が切り替わる', async () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      // デフォルトでEasyタブが選択されている
      await waitFor(() => {
        expect(screen.getByText('霊夢')).toBeInTheDocument();
      });

      // Normalタブをクリック（複数あるのでボタンだけを対象にする）
      const tabs = screen.getAllByRole('button');
      const normalTab = tabs.find(tab => tab.textContent === 'Normal');
      fireEvent.click(normalTab!);

      await waitFor(() => {
        expect(screen.getByText('魔理沙')).toBeInTheDocument();
      });
    });

    it('クリアバッジが表示される', async () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('クリア')).toBeInTheDocument();
      });
    });

    it('条件達成バッジが表示される', async () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      // Normalタブに切り替え
      const tabs = screen.getAllByRole('button');
      const normalTab = tabs.find(tab => tab.textContent === 'Normal');
      fireEvent.click(normalTab!);

      await waitFor(() => {
        expect(screen.getByText('ノーコン')).toBeInTheDocument();
      });
    });
  });

  describe('紺珠伝（モード対応ゲーム）', () => {
    beforeEach(() => {
      useClearRecords.mockReturnValue({
        clearRecords: mockKishinClearRecords,
        loading: false,
        error: null,
        fetchClearRecords: jest.fn(),
        submitIndividualConditions: jest.fn(),
        clearError: jest.fn(),
        refetch: jest.fn(),
      });
    });

    it('モードタブが表示される', () => {
      render(<GameDetail game={mockGameKishin} onBack={mockOnBack} />);

      // モードタブはクリア記録がある場合に表示される
      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(btn => btn.textContent);
      expect(buttonTexts).toContain('完全無欠モード');
      expect(buttonTexts).toContain('レガシーモード');
    });

    it('モード説明が表示される', () => {
      render(<GameDetail game={mockGameKishin} onBack={mockOnBack} />);

      expect(screen.getByText('紺珠伝では2つのモードが選択可能です：')).toBeInTheDocument();
    });

    it('モードタブをクリックすると表示が切り替わる', () => {
      render(<GameDetail game={mockGameKishin} onBack={mockOnBack} />);

      // ボタンから完全無欠モードとレガシーモードを取得
      const buttons = screen.getAllByRole('button');
      const pointdeviceTab = buttons.find(btn => btn.textContent === '完全無欠モード');
      const legacyTab = buttons.find(btn => btn.textContent === 'レガシーモード');

      // デフォルトで完全無欠モードが選択されている
      expect(pointdeviceTab?.className).toContain('border-blue-500');

      // レガシーモードタブをクリック
      fireEvent.click(legacyTab!);

      // レガシーモードが選択される
      expect(legacyTab?.className).toContain('border-orange-500');
    });
  });

  describe('クリア記録登録フォーム', () => {
    it('クリア記録登録ボタンをクリックするとフォームが表示される', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      const registerButton = screen.getByText('クリア記録登録');
      fireEvent.click(registerButton);

      expect(screen.getByTestId('individual-form')).toBeInTheDocument();
    });

    it('フォームを閉じるとフォームが非表示になる', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      // フォームを表示
      const registerButton = screen.getByText('クリア記録登録');
      fireEvent.click(registerButton);

      // フォームを閉じる
      const closeButton = screen.getByText('フォーム閉じる');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('individual-form')).not.toBeInTheDocument();
    });

    it('フォーム成功時にクリア記録が再取得される', () => {
      const mockFetchClearRecords = jest.fn();
      useClearRecords.mockReturnValue({
        clearRecords: [],
        loading: false,
        error: null,
        fetchClearRecords: mockFetchClearRecords,
        submitIndividualConditions: jest.fn(),
        clearError: jest.fn(),
        refetch: jest.fn(),
      });

      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      // フォームを表示
      const registerButton = screen.getByText('クリア記録登録');
      fireEvent.click(registerButton);

      // フォーム成功
      const successButton = screen.getByText('フォーム成功');
      fireEvent.click(successButton);

      expect(mockFetchClearRecords).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('individual-form')).not.toBeInTheDocument();
    });
  });

  describe('ゲームメモ機能', () => {
    it('メモを追加ボタンが表示される', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('メモを追加')).toBeInTheDocument();
    });

    it('メモが無い場合のメッセージが表示される', () => {
      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('まだメモが登録されていません')).toBeInTheDocument();
    });

    it('メモがある場合は編集ボタンが表示される', () => {
      useGameMemo.mockReturnValue({
        memo: { id: 1, game_id: 1, user_id: 1, memo_text: 'テストメモ' },
        loading: false,
        error: null,
        saving: false,
        saveMemo: jest.fn(),
        getMemoText: jest.fn(() => 'テストメモ'),
        hasMemo: jest.fn(() => true),
      });

      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('メモを編集')).toBeInTheDocument();
      expect(screen.getByText('テストメモ')).toBeInTheDocument();
    });
  });

  describe('ローディング状態', () => {
    it('クリア記録ローディング中はスピナーが表示される', () => {
      useClearRecords.mockReturnValue({
        clearRecords: [],
        loading: true,
        error: null,
        fetchClearRecords: jest.fn(),
        submitIndividualConditions: jest.fn(),
        clearError: jest.fn(),
        refetch: jest.fn(),
      });

      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('クリア記録を読み込み中...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('クリア記録取得エラーが表示される', () => {
      useClearRecords.mockReturnValue({
        clearRecords: [],
        loading: false,
        error: 'クリア記録の取得に失敗しました',
        fetchClearRecords: jest.fn(),
        submitIndividualConditions: jest.fn(),
        clearError: jest.fn(),
        refetch: jest.fn(),
      });

      render(<GameDetail game={mockGame} onBack={mockOnBack} />);

      expect(screen.getByText('クリア記録の取得に失敗しました')).toBeInTheDocument();
    });
  });
});
