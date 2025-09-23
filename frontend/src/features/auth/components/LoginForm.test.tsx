import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authApi } from '../services/authApi';

// authApiのモック
jest.mock('../services/authApi');
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

// 共通コンポーネントのモック
jest.mock('../../../components/common/Button', () => {
  return function MockButton({ children, loading, disabled, type, onClick, ...props }: any) {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? '処理中...' : children}
      </button>
    );
  };
});

jest.mock('../../../components/common/Input', () => {
  return function MockInput({ label, name, type, value, onChange, error, disabled, required, ...props }: any) {
    return (
      <div>
        {label && <label htmlFor={name}>{label}{required && '*'}</label>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  is_active: true,
  is_admin: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockAuthResponse = {
  access_token: 'test-token',
  token_type: 'bearer',
  user: mockUser,
};

// テスト用のAuthProviderラッパー
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ログインフォームが正しく表示される', () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名*')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード*')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('新規登録')).toBeInTheDocument();
  });

  it('入力フィールドに値を入力できる', () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('パスワード*') as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('バリデーションエラーが表示される', async () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ユーザー名を入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });
  });

  it('ユーザー名のみのバリデーションエラーが表示される', async () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('パスワード*');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ユーザー名を入力してください')).toBeInTheDocument();
      expect(screen.queryByText('パスワードを入力してください')).not.toBeInTheDocument();
    });
  });

  it('パスワードのみのバリデーションエラーが表示される', async () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('ユーザー名を入力してください')).not.toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });
  });

  it('入力時にバリデーションエラーがクリアされる', async () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    // バリデーションエラーを発生させる
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ユーザー名を入力してください')).toBeInTheDocument();
    });

    // ユーザー名を入力してエラーをクリア
    const usernameInput = screen.getByLabelText('ユーザー名*');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    await waitFor(() => {
      expect(screen.queryByText('ユーザー名を入力してください')).not.toBeInTheDocument();
    });
  });

  it('ログイン成功時にonSuccessが呼ばれる', async () => {
    mockedAuthApi.login.mockResolvedValue(mockAuthResponse);

    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*');
    const passwordInput = screen.getByLabelText('パスワード*');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('ログイン失敗時にエラーメッセージが表示される', async () => {
    const errorMessage = 'ログインに失敗しました';
    const error = {
      response: {
        data: {
          detail: errorMessage,
        },
      },
    };
    mockedAuthApi.login.mockRejectedValue(error);

    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*');
    const passwordInput = screen.getByLabelText('パスワード*');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('新規登録ボタンクリック時にonSwitchToRegisterが呼ばれる', () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const registerButton = screen.getByText('新規登録');
    fireEvent.click(registerButton);

    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
  });

  it('ローディング状態中はフォームが無効化される', async () => {
    // ログインが解決されないPromiseを作成
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockedAuthApi.login.mockReturnValue(loginPromise);

    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('パスワード*') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'ログイン' }) as HTMLButtonElement;
    const registerButton = screen.getByText('新規登録') as HTMLButtonElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // ローディング状態を確認
    await waitFor(() => {
      expect(screen.getByText('処理中...')).toBeInTheDocument();
    });

    expect(usernameInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(registerButton.disabled).toBe(true);

    // ログインを完了
    resolveLogin!(mockAuthResponse);

    await waitFor(() => {
      expect(screen.queryByText('処理中...')).not.toBeInTheDocument();
    });
  });

  it('フォーム送信時にhandleSubmitが実行される', async () => {
    mockedAuthApi.login.mockResolvedValue(mockAuthResponse);

    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*');
    const passwordInput = screen.getByLabelText('パスワード*');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('空白のみのユーザー名はバリデーションエラーになる', async () => {
    render(
      <TestWrapper>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('ユーザー名*');
    const passwordInput = screen.getByLabelText('パスワード*');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: '   ' } }); // 空白のみ
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ユーザー名を入力してください')).toBeInTheDocument();
    });
  });

  it('onSuccessとonSwitchToRegisterが未定義でもエラーにならない', () => {
    expect(() => {
      render(
        <TestWrapper>
          <LoginForm onSwitchToRegister={mockOnSwitchToRegister} />
        </TestWrapper>
      );
    }).not.toThrow();

    expect(() => {
      render(
        <TestWrapper>
          <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
        </TestWrapper>
      );
    }).not.toThrow();
  });
});