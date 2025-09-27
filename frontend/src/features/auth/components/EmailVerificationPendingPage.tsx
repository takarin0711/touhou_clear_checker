import React, { useState } from 'react';
import { authApi } from '../services/authApi';
import Button from '../../../components/common/Button';
import { TIME_CONSTANTS } from '../../../constants/timeConstants';

interface EmailVerificationPendingPageProps {
  email: string;
  onBackToAuth?: () => void;
}

const EmailVerificationPendingPage: React.FC<EmailVerificationPendingPageProps> = ({
  email,
  onBackToAuth
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setResendError(null);
    setResendMessage(null);

    try {
      const response = await authApi.resendVerificationEmail(email);
      setResendMessage(response.message || '認証メールを再送信しました。');
      
      // 再送信制限
      setCanResend(false);
      setCountdown(TIME_CONSTANTS.EMAIL_RESEND_COOLDOWN_SECONDS);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, TIME_CONSTANTS.TIMER_INTERVAL_MS);
      
    } catch (error: any) {
      setResendError(
        error.response?.data?.detail || 'メールの再送信に失敗しました。'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToAuth = () => {
    if (onBackToAuth) {
      onBackToAuth();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-blue-600 text-6xl mb-4">📧</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            メール認証が必要です
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            <strong>{email}</strong> に認証メールを送信しました。
          </p>
          <p className="mt-4 text-sm text-gray-600">
            メール内のリンクをクリックして、アカウントの認証を完了してください。
          </p>
          
          {/* メール確認のヒント */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-2">📝 確認のポイント</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 迷惑メールフォルダもご確認ください</li>
              <li>• メールが届くまで数分かかる場合があります</li>
              <li>• 認証リンクの有効期限は24時間です</li>
            </ul>
          </div>

          {/* 再送信機能 */}
          <div className="mt-6">
            {resendMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{resendMessage}</p>
              </div>
            )}
            
            {resendError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{resendError}</p>
              </div>
            )}

            <Button
              onClick={handleResendEmail}
              variant="secondary"
              size="medium"
              className="w-full mb-3"
              disabled={!canResend || isResending}
            >
              {isResending
                ? '送信中...'
                : canResend
                ? 'メールを再送信'
                : `再送信まで ${countdown}秒`
              }
            </Button>
          </div>

          {/* ナビゲーションボタン */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={handleBackToAuth}
              variant="primary"
              size="medium"
              className="w-full"
            >
              ログインページに戻る
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
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPendingPage;