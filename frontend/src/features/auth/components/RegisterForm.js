import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

/**
 * ユーザー登録フォームコンポーネント
 */
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // フォーム入力の処理
  const handleChange = (e) => {
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
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 3) {
      errors.username = 'ユーザー名は3文字以上で入力してください';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '正しいメールアドレスを入力してください';
    }
    
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'パスワード確認を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        新規登録
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ユーザー名"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="ユーザー名を入力（3文字以上）"
          required
          error={formErrors.username}
          disabled={isLoading}
        />

        <Input
          label="メールアドレス"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="メールアドレスを入力"
          required
          error={formErrors.email}
          disabled={isLoading}
        />

        <Input
          label="パスワード"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="パスワードを入力（6文字以上）"
          required
          error={formErrors.password}
          disabled={isLoading}
        />

        <Input
          label="パスワード確認"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="パスワードを再入力"
          required
          error={formErrors.confirmPassword}
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
          登録
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          既にアカウントをお持ちの方は{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
            disabled={isLoading}
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;