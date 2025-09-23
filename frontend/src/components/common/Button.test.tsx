import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button', () => {
  it('基本的なボタンが正しく表示される', () => {
    render(<Button>テストボタン</Button>);
    
    const button = screen.getByRole('button', { name: 'テストボタン' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('テストボタン');
  });

  it('type属性が正しく設定される', () => {
    render(<Button type="submit">送信</Button>);
    
    const button = screen.getByRole('button', { name: '送信' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('デフォルトではtype="button"が設定される', () => {
    render(<Button>ボタン</Button>);
    
    const button = screen.getByRole('button', { name: 'ボタン' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('onClick イベントが正しく発火する', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    
    const button = screen.getByRole('button', { name: 'クリック' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態のボタンはクリックできない', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        無効なボタン
      </Button>
    );
    
    const button = screen.getByRole('button', { name: '無効なボタン' });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('loading状態のボタンは"処理中..."と表示される', () => {
    render(<Button loading>ローディング</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('処理中...');
  });

  it('loading状態のボタンはクリックできない', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} loading>
        ローディング
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  describe('variant スタイル', () => {
    it('primary variant のクラスが適用される', () => {
      render(<Button variant="primary">プライマリ</Button>);
      
      const button = screen.getByRole('button', { name: 'プライマリ' });
      expect(button).toHaveClass('bg-blue-600');
    });

    it('secondary variant のクラスが適用される', () => {
      render(<Button variant="secondary">セカンダリ</Button>);
      
      const button = screen.getByRole('button', { name: 'セカンダリ' });
      expect(button).toHaveClass('bg-gray-600');
    });

    it('danger variant のクラスが適用される', () => {
      render(<Button variant="danger">危険</Button>);
      
      const button = screen.getByRole('button', { name: '危険' });
      expect(button).toHaveClass('bg-red-600');
    });

    it('outline variant のクラスが適用される', () => {
      render(<Button variant="outline">アウトライン</Button>);
      
      const button = screen.getByRole('button', { name: 'アウトライン' });
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-white');
    });
  });

  describe('size スタイル', () => {
    it('small size のクラスが適用される', () => {
      render(<Button size="small">小</Button>);
      
      const button = screen.getByRole('button', { name: '小' });
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('medium size のクラスが適用される', () => {
      render(<Button size="medium">中</Button>);
      
      const button = screen.getByRole('button', { name: '中' });
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-sm');
    });

    it('large size のクラスが適用される', () => {
      render(<Button size="large">大</Button>);
      
      const button = screen.getByRole('button', { name: '大' });
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-base');
    });
  });

  it('カスタムクラス名が追加される', () => {
    render(<Button className="custom-class">カスタム</Button>);
    
    const button = screen.getByRole('button', { name: 'カスタム' });
    expect(button).toHaveClass('custom-class');
  });

  it('その他のHTML属性が正しく渡される', () => {
    render(<Button data-testid="test-button">テスト</Button>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
  });
});