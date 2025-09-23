import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './features/auth/components/AuthPage';
import EmailVerificationPage from './features/auth/components/EmailVerificationPage';
import { GameList } from './features/games/components';
import './App.css';

/**
 * ゲーム一覧ページコンポーネント
 */
const GameListPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <GameList />
    </div>
  );
};

/**
 * メインアプリケーションコンポーネント（認証後）
 */
const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full flex justify-center">
          <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="東方クリアチェッカー" className="h-8 w-8" />
                <h1 className="text-xl font-semibold text-gray-900">
                  東方クリアチェッカー
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  こんにちは、{user?.username}さん
                  {user?.is_admin && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      管理者
                    </span>
                  )}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 w-full" style={{ display: 'block' }}>
        <GameListPage />
      </main>
    </div>
  );
};

/**
 * アプリケーションのルート
 */
const AppContent = () => {
  const { user, checkAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'verify-email' | 'main'>('auth');

  // 初期化時に認証状態をチェック
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    initAuth();
  }, [checkAuth]);

  // URL に基づいてページを決定
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.includes('verify-email') || params.get('token')) {
      setCurrentPage('verify-email');
    } else if (user) {
      setCurrentPage('main');
    } else {
      setCurrentPage('auth');
    }
  }, [user]);

  // 初期化中はローディング表示
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ページ内容を決定
  const renderContent = () => {
    switch (currentPage) {
      case 'verify-email':
        return <EmailVerificationPage />;
      case 'main':
        return user ? <MainApp /> : <AuthPage onAuthSuccess={() => setCurrentPage('main')} />;
      case 'auth':
      default:
        return user ? <MainApp /> : <AuthPage onAuthSuccess={() => setCurrentPage('main')} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
};

/**
 * App component
 */
function App() {
  return (
    <div className="w-full h-full">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;