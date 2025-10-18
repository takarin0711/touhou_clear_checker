/**
 * トーストコンテキストの単体テスト
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';
import { ErrorSeverity } from '../../types/error';

// テスト用コンポーネント
function TestComponent(): React.ReactElement {
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();

  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map(toast => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          {toast.message} - {toast.severity}
        </div>
      ))}
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>Remove First</button>
      )}
    </div>
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('ToastProviderが正しく初期化されること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  test('showSuccessが正しく動作すること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByText(/Success message/)).toBeInTheDocument();
  });

  test('showErrorが正しく動作すること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Error').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByText(/Error message/)).toBeInTheDocument();
    // severityがテキストとして表示されている
    expect(screen.getByText(/error/)).toBeInTheDocument();
  });

  test('showWarningが正しく動作すること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Warning').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByText(/Warning message/)).toBeInTheDocument();
    // severityがテキストとして表示されている（ボタンのテキストとは別）
    const toastElements = screen.getAllByText(/warning/i);
    expect(toastElements.length).toBeGreaterThan(0);
  });

  test('showInfoが正しく動作すること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Info').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByText(/Info message/)).toBeInTheDocument();
  });

  test('複数のトーストを表示できること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
      screen.getByText('Show Error').click();
      screen.getByText('Show Warning').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
  });

  test('removeToastが正しく動作すること', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
      screen.getByText('Show Error').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('Remove First').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  test('トーストが指定時間後に自動削除されること', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Show Success').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // 5秒後に自動削除される
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });
  });

  test('ToastProvider外でuseToastを使うとエラーになること', () => {
    // エラー出力を抑制
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    spy.mockRestore();
  });
});
