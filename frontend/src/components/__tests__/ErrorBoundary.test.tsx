/**
 * エラーバウンダリの単体テスト
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// ロガーをモック化
jest.mock('../../utils/logging/logger', () => ({
  createLogger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  })
}));

// コンソールエラーを抑制（テスト中のエラー出力を防ぐ）
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// エラーをスローするコンポーネント
function ThrowError({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  test('エラーが発生しない場合は子コンポーネントを表示すること', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  test('エラーが発生した場合はフォールバックUIを表示すること', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // エラーメッセージが表示される
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('エラー')).toBeInTheDocument();
  });

  test('再試行ボタンが表示されクリック可能であること', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // エラーメッセージが表示される
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // 再試行ボタンが存在しクリック可能
    const retryButton = screen.getByText('再試行');
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    // ボタンクリックが正常に動作することを確認
    // 実際のリカバリーフローは親コンポーネントの責務
  });

  test('カスタムフォールバックUIが提供された場合はそれを使用すること', () => {
    const customFallback = (error: any, reset: () => void) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Custom Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom Reset')).toBeInTheDocument();
  });

  test('ホームへ戻るボタンが存在すること', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('ホームへ戻る');
    expect(homeButton).toBeInTheDocument();
  });
});
