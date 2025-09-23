import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { LoginCredentials } from '../../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
}

interface FormErrors {
  username?: string;
  password?: string;
}

/**
 * ログインフォームコンポーネント
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, resendVerificationEmail, emailVerificationState } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // フォーム入力の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'ユーザー名を入力してください';
    }
    
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      onSuccess?.();
    } else if (result.error?.includes('not verified')) {
      // メール未認証エラーの場合、ユーザー情報を取得してメール再送信を可能にする
      // 実際のアプリでは、ユーザー名からメールアドレスを取得するAPIが必要
      // 今回は簡易的にユーザー名をメールアドレスと仮定
      if (formData.username.includes('@')) {
        setUserEmail(formData.username);
      }
    }
  };

  // 認証メール再送信
  const handleResendEmail = async () => {
    if (!userEmail) return;
    
    const result = await resendVerificationEmail(userEmail);
    if (result.success) {
      // 成功メッセージは emailVerificationState.message に含まれる
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        ログイン
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ユーザー名"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="ユーザー名を入力"
          required
          error={formErrors.username}
          disabled={isLoading}
        />

        <Input
          label="パスワード"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="パスワードを入力"
          required
          error={formErrors.password}
          disabled={isLoading}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
            {/* メール未認証エラーの場合の追加情報 */}
            {error.includes('not verified') && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-600 mb-2">
                  メールアドレスの認証が完了していません。
                </p>
                {userEmail && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      認証メールを再送信できます: <strong>{userEmail}</strong>
                    </p>
                    <Button
                      onClick={handleResendEmail}
                      variant="secondary"
                      size="small"
                      disabled={emailVerificationState.isResending}
                      loading={emailVerificationState.isResending}
                    >
                      {emailVerificationState.isResending ? '送信中...' : '認証メールを再送信'}
                    </Button>
                  </div>
                )}
                {emailVerificationState.message && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-600">{emailVerificationState.message}</p>
                  </div>
                )}
                {emailVerificationState.error && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                    <p className="text-xs text-red-600">{emailVerificationState.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="large"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          ログイン
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          アカウントをお持ちでない方は{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-500 font-medium"
            disabled={isLoading}
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;