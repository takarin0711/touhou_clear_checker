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
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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