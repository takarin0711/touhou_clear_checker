import React, { useEffect, useState } from 'react';
import { authApi } from '../services/authApi';
import Button from '../../../components/common/Button';

interface VerificationState {
  isVerifying: boolean;
  success: boolean | null;
  message: string;
  error: string | null;
}

const EmailVerificationPage: React.FC = () => {
  const [state, setState] = useState<VerificationState>({
    isVerifying: false,
    success: null,
    message: '',
    error: null
  });

  useEffect(() => {
    const verifyEmailFromURL = async () => {
      // URLクエリパラメータからトークンを取得
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setState({
          isVerifying: false,
          success: false,
          message: '',
          error: '認証トークンが見つかりません。'
        });
        return;
      }

      setState(prev => ({ ...prev, isVerifying: true, error: null }));

      try {
        const response = await authApi.verifyEmail(token);
        setState({
          isVerifying: false,
          success: true,
          message: response.message || 'メールアドレスの認証が完了しました。',
          error: null
        });
      } catch (error: any) {
        setState({
          isVerifying: false,
          success: false,
          message: '',
          error: error.response?.data?.detail || 'メール認証に失敗しました。'
        });
      }
    };

    verifyEmailFromURL();
  }, []);

  const handleGoToLogin = () => {
    window.location.href = '/';
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (state.isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              メール認証中...
            </h2>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">
                認証処理を実行しています。しばらくお待ちください。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {state.success ? (
            <>
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                認証完了
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {state.message}
              </p>
              <p className="mt-4 text-sm text-gray-600">
                これでログインできるようになりました。
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleGoToLogin}
                  variant="primary"
                  size="medium"
                  className="w-full"
                >
                  ログインページへ
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="secondary"
                  size="medium"
                  className="w-full"
                >
                  ホームに戻る
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-red-600 text-6xl mb-4">✗</div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                認証失敗
              </h2>
              <p className="mt-2 text-sm text-red-600">
                {state.error}
              </p>
              <p className="mt-4 text-sm text-gray-600">
                認証リンクが無効または期限切れの可能性があります。
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleGoToLogin}
                  variant="primary"
                  size="medium"
                  className="w-full"
                >
                  ログインページへ
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="secondary"
                  size="medium"
                  className="w-full"
                >
                  ホームに戻る
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;