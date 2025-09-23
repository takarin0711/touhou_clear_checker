import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameCard from './GameCard';
import { Game, GAME_TYPES } from '../../../types/game';

// Badgeコンポーネントのモック
jest.mock('../../../components/common/Badge', () => {
  return function MockBadge({ children, variant, size, className }: any) {
    const variantClasses = {
      primary: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      success: 'bg-green-100 text-green-800',
      default: 'bg-gray-100 text-gray-800',
    };
    
    const sizeClasses = {
      small: 'px-2 py-0.5 text-xs',
      medium: 'px-2.5 py-1 text-sm',
      large: 'px-3 py-1.5 text-base',
    };
    
    return (
      <span 
        className={`${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      >
        {children}
      </span>
    );
  };
});

const mockGame: Game = {
  id: 1,
  title: '東方紅魔郷',
  series_number: 6,
  release_year: 2002,
  game_type: GAME_TYPES.MAIN_SERIES,
};

describe('GameCard', () => {
  it('ゲーム情報が正しく表示される', () => {
    render(<GameCard game={mockGame} />);
    
    expect(screen.getByText('東方紅魔郷')).toBeInTheDocument();
    expect(screen.getByText('第6作 • 2002年')).toBeInTheDocument();
    expect(screen.getByText('本編STG')).toBeInTheDocument();
    expect(screen.getByText('クリア状況を編集 →')).toBeInTheDocument();
  });

  it('小数点を含むシリーズ番号が正しく表示される', () => {
    const gameWithDecimalSeries: Game = {
      ...mockGame,
      series_number: 6.5,
    };
    
    render(<GameCard game={gameWithDecimalSeries} />);
    
    expect(screen.getByText('第6.5作 • 2002年')).toBeInTheDocument();
  });

  it('整数のシリーズ番号が正しく表示される', () => {
    const gameWithIntegerSeries: Game = {
      ...mockGame,
      series_number: 7,
    };
    
    render(<GameCard game={gameWithIntegerSeries} />);
    
    expect(screen.getByText('第7作 • 2002年')).toBeInTheDocument();
  });

  it('onClick イベントがカードクリック時に発火する', () => {
    const handleClick = jest.fn();
    render(<GameCard game={mockGame} onClick={handleClick} />);
    
    // data-testidを使用しないで、適切な要素を取得
    const titleElement = screen.getByText('東方紅魔郷');
    const card = titleElement.closest('[class*="bg-white"]');
    fireEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockGame);
  });

  it('編集ボタンクリック時にonClickイベントが発火する', () => {
    const handleClick = jest.fn();
    render(<GameCard game={mockGame} onClick={handleClick} />);
    
    const editButton = screen.getByText('クリア状況を編集 →');
    fireEvent.click(editButton);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockGame);
  });

  it('編集ボタンクリック時にonClickイベントが発火する（編集ボタン専用テスト）', () => {
    const handleClick = jest.fn();
    render(<GameCard game={mockGame} onClick={handleClick} />);
    
    const editButton = screen.getByText('クリア状況を編集 →');
    fireEvent.click(editButton);
    
    // 編集ボタンクリックでもonClickが呼ばれることを確認
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockGame);
  });

  describe('ゲームタイプのバッジスタイル', () => {
    it('本編STGは primary バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: GAME_TYPES.MAIN_SERIES }} />);
      
      const badge = screen.getByText('本編STG');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('外伝STGは warning バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: GAME_TYPES.SPIN_OFF_STG }} />);
      
      const badge = screen.getByText('外伝STG');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('格闘ゲームは danger バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: GAME_TYPES.FIGHTING }} />);
      
      const badge = screen.getByText('格闘ゲーム');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('撮影STGは warning バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: GAME_TYPES.PHOTOGRAPHY }} />);
      
      const badge = screen.getByText('撮影STG');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('格闘+STGは purple バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: GAME_TYPES.MIXED }} />);
      
      const badge = screen.getByText('格闘+STG');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('対戦型STGは success バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: GAME_TYPES.VERSUS }} />);
      
      const badge = screen.getByText('対戦型STG');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('未知のゲームタイプは default バッジで表示される', () => {
      render(<GameCard game={{ ...mockGame, game_type: 'unknown' }} />);
      
      const badge = screen.getByText('unknown');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  it('カスタムクラス名が追加される', () => {
    render(<GameCard game={mockGame} className="custom-card" />);
    
    // 最上位のdivを取得（カードのルート要素）
    const card = screen.getByText('東方紅魔郷').closest('[class*="bg-white"]');
    expect(card).toHaveClass('custom-card');
  });

  it('onClickが未定義でもエラーにならない', () => {
    render(<GameCard game={mockGame} />);
    
    const card = screen.getByText('東方紅魔郷').closest('[class*="bg-white"]');
    expect(() => fireEvent.click(card!)).not.toThrow();
    
    const editButton = screen.getByText('クリア状況を編集 →');
    expect(() => fireEvent.click(editButton)).not.toThrow();
  });

  it('カードにホバー効果のクラスが適用される', () => {
    render(<GameCard game={mockGame} />);
    
    // 最上位のdivを取得（カードのルート要素）
    const card = screen.getByText('東方紅魔郷').closest('[class*="bg-white"]');
    expect(card).toHaveClass('hover:shadow-lg', 'hover:border-blue-300', 'cursor-pointer');
  });

  it('バッジのサイズがsmallに設定される', () => {
    render(<GameCard game={mockGame} />);
    
    const badge = screen.getByText('本編STG');
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
  });
});