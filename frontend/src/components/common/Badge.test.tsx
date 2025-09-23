import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from './Badge';

describe('Badge', () => {
  it('基本的なバッジが正しく表示される', () => {
    render(<Badge>テストバッジ</Badge>);
    
    const badge = screen.getByText('テストバッジ');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('inline-flex', 'items-center', 'font-medium', 'rounded-full');
  });

  it('子要素が正しく表示される', () => {
    render(<Badge>バッジテキスト</Badge>);
    
    const badge = screen.getByText('バッジテキスト');
    expect(badge).toHaveTextContent('バッジテキスト');
  });

  describe('variant スタイル', () => {
    it('default variant のクラスが適用される', () => {
      render(<Badge variant="default">デフォルト</Badge>);
      
      const badge = screen.getByText('デフォルト');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('primary variant のクラスが適用される', () => {
      render(<Badge variant="primary">プライマリ</Badge>);
      
      const badge = screen.getByText('プライマリ');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('success variant のクラスが適用される', () => {
      render(<Badge variant="success">成功</Badge>);
      
      const badge = screen.getByText('成功');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('warning variant のクラスが適用される', () => {
      render(<Badge variant="warning">警告</Badge>);
      
      const badge = screen.getByText('警告');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('danger variant のクラスが適用される', () => {
      render(<Badge variant="danger">危険</Badge>);
      
      const badge = screen.getByText('危険');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('purple variant のクラスが適用される', () => {
      render(<Badge variant="purple">紫</Badge>);
      
      const badge = screen.getByText('紫');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });
  });

  describe('size スタイル', () => {
    it('small size のクラスが適用される', () => {
      render(<Badge size="small">小</Badge>);
      
      const badge = screen.getByText('小');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('medium size のクラスが適用される', () => {
      render(<Badge size="medium">中</Badge>);
      
      const badge = screen.getByText('中');
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
    });

    it('large size のクラスが適用される', () => {
      render(<Badge size="large">大</Badge>);
      
      const badge = screen.getByText('大');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
    });
  });

  it('デフォルト値が正しく適用される', () => {
    render(<Badge>デフォルト</Badge>);
    
    const badge = screen.getByText('デフォルト');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800'); // default variant
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm'); // medium size
  });

  it('カスタムクラス名が追加される', () => {
    render(<Badge className="custom-badge">カスタム</Badge>);
    
    const badge = screen.getByText('カスタム');
    expect(badge).toHaveClass('custom-badge');
  });

  it('その他のHTML属性が正しく渡される', () => {
    render(<Badge data-testid="test-badge">テスト</Badge>);
    
    const badge = screen.getByTestId('test-badge');
    expect(badge).toBeInTheDocument();
  });

  it('複数のvariantとsizeの組み合わせが正しく動作する', () => {
    render(<Badge variant="success" size="large">成功・大</Badge>);
    
    const badge = screen.getByText('成功・大');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800'); // success variant
    expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base'); // large size
  });

  it('React要素も子要素として受け入れる', () => {
    render(
      <Badge>
        <span>アイコン</span>
        <span>テキスト</span>
      </Badge>
    );
    
    const badge = screen.getByText('アイコン');
    expect(badge.parentElement).toHaveTextContent('アイコンテキスト');
  });
});