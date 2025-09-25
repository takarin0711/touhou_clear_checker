import pytest
from unittest.mock import Mock, patch
from application.services.email_service import EmailService, EmailSender, MockEmailSender


class TestEmailService:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_email_sender = Mock(spec=EmailSender)
        self.email_service = EmailService(self.mock_email_sender)
    
    def test_send_verification_email_success(self):
        """認証メール送信の成功ケース"""
        # Arrange
        to_email = "test@example.com"
        username = "test_user"
        verification_token = "test_token"
        self.mock_email_sender.send_email.return_value = True
        
        # Act
        result = self.email_service.send_verification_email(to_email, username, verification_token)
        
        # Assert
        assert result is True
        self.mock_email_sender.send_email.assert_called_once()
        
        call_args = self.mock_email_sender.send_email.call_args[0]
        assert call_args[0] == to_email
        assert "東方プロジェクト クリアチェッカー - メールアドレス認証" in call_args[1]
        assert username in call_args[2]
        assert "verify-email?token=test_token" in call_args[2]
    
    def test_send_verification_email_failure(self):
        """認証メール送信の失敗ケース"""
        # Arrange
        to_email = "test@example.com"
        username = "test_user"
        verification_token = "test_token"
        self.mock_email_sender.send_email.return_value = False
        
        # Act
        result = self.email_service.send_verification_email(to_email, username, verification_token)
        
        # Assert
        assert result is False
        self.mock_email_sender.send_email.assert_called_once()
    
    def test_verification_url_generation(self):
        """認証URLの生成テスト"""
        # Arrange
        to_email = "test@example.com"
        username = "test_user"
        verification_token = "special_token_123"
        self.mock_email_sender.send_email.return_value = True
        
        # Act
        self.email_service.send_verification_email(to_email, username, verification_token)
        
        # Assert
        call_args = self.mock_email_sender.send_email.call_args[0]
        text_body = call_args[2]
        html_body = call_args[3]
        
        expected_url = "http://localhost:3000/verify-email?token=special_token_123"
        assert expected_url in text_body
        assert expected_url in html_body
    
    @patch.dict('os.environ', {'BASE_URL': 'https://example.com'})
    def test_custom_base_url(self):
        """カスタムベースURLでの認証URL生成テスト"""
        # Arrange
        email_service = EmailService(self.mock_email_sender)
        to_email = "test@example.com"
        username = "test_user"
        verification_token = "test_token"
        self.mock_email_sender.send_email.return_value = True
        
        # Act
        email_service.send_verification_email(to_email, username, verification_token)
        
        # Assert
        call_args = self.mock_email_sender.send_email.call_args[0]
        text_body = call_args[2]
        
        expected_url = "https://example.com/verify-email?token=test_token"
        assert expected_url in text_body
    
    def test_email_content_includes_required_elements(self):
        """メール内容に必要な要素が含まれているかテスト"""
        # Arrange
        to_email = "test@example.com"
        username = "テストユーザー"
        verification_token = "test_token"
        self.mock_email_sender.send_email.return_value = True
        
        # Act
        self.email_service.send_verification_email(to_email, username, verification_token)
        
        # Assert
        call_args = self.mock_email_sender.send_email.call_args[0]
        subject = call_args[1]
        text_body = call_args[2]
        html_body = call_args[3]
        
        # 件名チェック
        assert "東方プロジェクト クリアチェッカー" in subject
        assert "メールアドレス認証" in subject
        
        # テキスト本文チェック
        assert username in text_body
        assert "メールアドレス認証" in text_body
        assert "24時間有効" in text_body
        assert "東方プロジェクト クリアチェッカー運営チーム" in text_body
        
        # HTML本文チェック
        assert username in html_body
        assert "<h2>メールアドレス認証</h2>" in html_body
        assert "24時間有効" in html_body
        assert "東方プロジェクト クリアチェッカー運営チーム" in html_body


class TestMockEmailSender:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_email_sender = MockEmailSender()
    
    def test_send_email_always_returns_true(self):
        """MockEmailSenderは常にTrueを返す"""
        # Arrange
        to_email = "test@example.com"
        subject = "Test Subject"
        text_body = "Test text body"
        html_body = "<p>Test html body</p>"
        
        # Act
        result = self.mock_email_sender.send_email(to_email, subject, text_body, html_body)
        
        # Assert
        assert result is True
    
    @patch('builtins.print')
    def test_send_email_prints_debug_info(self, mock_print):
        """MockEmailSenderはデバッグ情報を出力する"""
        # Arrange
        to_email = "test@example.com"
        subject = "Test Subject"
        text_body = "Test text body"
        html_body = "<p>Test html body</p>"
        
        # Act
        self.mock_email_sender.send_email(to_email, subject, text_body, html_body)
        
        # Assert
        # print が呼ばれていることを確認
        assert mock_print.call_count > 0
        
        # print されている内容を確認
        print_calls = [call[0][0] for call in mock_print.call_args_list]
        print_text = " ".join(print_calls)
        
        assert to_email in print_text
        assert subject in print_text
        assert text_body in print_text