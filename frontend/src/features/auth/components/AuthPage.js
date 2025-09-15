import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

/**
 * 認証ページ（ログイン・登録の切り替え）
 */
const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          東方クリアチェッカー
        </h1>
        
        {isLogin ? (
          <LoginForm 
            onSuccess={onAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm 
            onSuccess={onAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          東方プロジェクトシリーズのクリア状況を管理できます
        </p>
      </div>
    </div>
  );
};

export default AuthPage;