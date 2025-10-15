"""
カスタム例外のテスト
"""
import pytest
from unittest.mock import patch, MagicMock
from infrastructure.logging.exceptions import (
    ApplicationException,
    NotFoundException,
    ValidationException,
    DuplicateException,
    AuthenticationException,
    AuthorizationException,
    DatabaseException,
    ExternalServiceException
)


class TestApplicationException:
    """ApplicationExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_application_exception_basic(self, mock_logger):
        """基本的な例外の作成とログ記録"""
        exc = ApplicationException("Test error message")

        assert exc.message == "Test error message"
        assert exc.error_code is None
        assert exc.details == {}
        mock_logger.error.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_application_exception_with_details(self, mock_logger):
        """詳細情報付きの例外"""
        details = {"field": "value", "count": 42}
        exc = ApplicationException(
            "Test error",
            error_code="TEST_ERROR",
            details=details
        )

        assert exc.message == "Test error"
        assert exc.error_code == "TEST_ERROR"
        assert exc.details == details
        mock_logger.error.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_application_exception_warning_level(self, mock_logger):
        """警告レベルの例外"""
        exc = ApplicationException("Warning message", log_level="warning")

        mock_logger.warning.assert_called_once()
        mock_logger.error.assert_not_called()


class TestNotFoundException:
    """NotFoundExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_not_found_with_id(self, mock_logger):
        """IDありのNotFound例外"""
        exc = NotFoundException("User", resource_id=123)

        assert "User not found" in exc.message
        assert "id=123" in exc.message
        assert exc.error_code == "NOT_FOUND"
        assert exc.details["resource_type"] == "User"
        assert exc.details["resource_id"] == 123
        mock_logger.warning.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_not_found_without_id(self, mock_logger):
        """IDなしのNotFound例外"""
        exc = NotFoundException("Game")

        assert "Game not found" in exc.message
        assert exc.error_code == "NOT_FOUND"
        assert exc.details["resource_type"] == "Game"
        assert exc.details["resource_id"] is None

    @patch("infrastructure.logging.exceptions.logger")
    def test_not_found_custom_message(self, mock_logger):
        """カスタムメッセージのNotFound例外"""
        exc = NotFoundException("User", resource_id=123, message="Custom not found message")

        assert exc.message == "Custom not found message"


class TestValidationException:
    """ValidationExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_validation_exception_basic(self, mock_logger):
        """基本的なバリデーションエラー"""
        exc = ValidationException("Invalid email format")

        assert exc.message == "Invalid email format"
        assert exc.error_code == "VALIDATION_ERROR"
        mock_logger.warning.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_validation_exception_with_field(self, mock_logger):
        """フィールド情報付きのバリデーションエラー"""
        exc = ValidationException(
            "Invalid value",
            field_name="email",
            invalid_value="invalid-email"
        )

        assert exc.details["field_name"] == "email"
        assert exc.details["invalid_value"] == "invalid-email"


class TestDuplicateException:
    """DuplicateExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_duplicate_exception_basic(self, mock_logger):
        """基本的な重複エラー"""
        exc = DuplicateException("User", "username", "john_doe")

        assert "User already exists" in exc.message
        assert "username=john_doe" in exc.message
        assert exc.error_code == "DUPLICATE_ERROR"
        assert exc.details["resource_type"] == "User"
        assert exc.details["field_name"] == "username"
        assert exc.details["duplicate_value"] == "john_doe"
        mock_logger.warning.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_duplicate_exception_custom_message(self, mock_logger):
        """カスタムメッセージの重複エラー"""
        exc = DuplicateException("Game", "title", "Touhou 1", message="Custom duplicate message")

        assert exc.message == "Custom duplicate message"


class TestAuthenticationException:
    """AuthenticationExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_authentication_exception_basic(self, mock_logger):
        """基本的な認証エラー"""
        exc = AuthenticationException()

        assert exc.message == "Authentication failed"
        assert exc.error_code == "AUTHENTICATION_ERROR"
        mock_logger.warning.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_authentication_exception_with_username(self, mock_logger):
        """ユーザー名付きの認証エラー"""
        exc = AuthenticationException("Invalid credentials", username="john_doe")

        assert exc.message == "Invalid credentials"
        assert exc.details["username"] == "john_doe"


class TestAuthorizationException:
    """AuthorizationExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_authorization_exception_basic(self, mock_logger):
        """基本的な認可エラー"""
        exc = AuthorizationException()

        assert exc.message == "Permission denied"
        assert exc.error_code == "AUTHORIZATION_ERROR"
        mock_logger.warning.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_authorization_exception_with_details(self, mock_logger):
        """詳細情報付きの認可エラー"""
        exc = AuthorizationException(
            "Admin permission required",
            user_id=123,
            required_permission="admin"
        )

        assert exc.message == "Admin permission required"
        assert exc.details["user_id"] == 123
        assert exc.details["required_permission"] == "admin"


class TestDatabaseException:
    """DatabaseExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_database_exception_basic(self, mock_logger):
        """基本的なデータベースエラー"""
        exc = DatabaseException("Connection failed")

        assert exc.message == "Connection failed"
        assert exc.error_code == "DATABASE_ERROR"
        mock_logger.error.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_database_exception_with_operation(self, mock_logger):
        """操作情報付きのデータベースエラー"""
        exc = DatabaseException(
            "Insert failed",
            operation="INSERT",
            table_name="users"
        )

        assert exc.details["operation"] == "INSERT"
        assert exc.details["table_name"] == "users"


class TestExternalServiceException:
    """ExternalServiceExceptionのテスト"""

    @patch("infrastructure.logging.exceptions.logger")
    def test_external_service_exception_basic(self, mock_logger):
        """基本的な外部サービスエラー"""
        exc = ExternalServiceException("SMTP connection failed", "SMTP")

        assert exc.message == "SMTP connection failed"
        assert exc.error_code == "EXTERNAL_SERVICE_ERROR"
        assert exc.details["service_name"] == "SMTP"
        mock_logger.error.assert_called_once()

    @patch("infrastructure.logging.exceptions.logger")
    def test_external_service_exception_with_status_code(self, mock_logger):
        """ステータスコード付きの外部サービスエラー"""
        exc = ExternalServiceException(
            "API request failed",
            "ExternalAPI",
            status_code=503
        )

        assert exc.details["service_name"] == "ExternalAPI"
        assert exc.details["status_code"] == 503
