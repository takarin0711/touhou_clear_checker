import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './features/auth/components/AuthPage';
import './App.css';

/**
 * メインアプリケーションコンポーネント（認証後）
 */
const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-xl font-semibold text-gray-900">
              東方クリアチェッカー
            </h1>
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
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                ダッシュボード
              </h2>
              <p className="text-gray-600">
                ゲーム一覧とクリア状況管理機能を実装予定
              </p>
            </div>
          </div>
        </div>
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

  // 初期化時に認証状態をチェック
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    initAuth();
  }, [checkAuth]);

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

  // 認証状態に応じて表示を切り替え
  return user ? <MainApp /> : <AuthPage onAuthSuccess={() => {}} />;
};

/**
 * App component
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;