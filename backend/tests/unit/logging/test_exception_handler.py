"""
例外ハンドラーミドルウェアのテスト
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.testclient import TestClient
from infrastructure.logging.exception_handler import ExceptionHandlerMiddleware
from infrastructure.logging.exceptions import (
    NotFoundException,
    ValidationException,
    DuplicateException,
    AuthenticationException,
    AuthorizationException,
    DatabaseException,
    ExternalServiceException
)


class TestExceptionHandlerMiddleware:
    """ExceptionHandlerMiddlewareのテスト"""

    def setup_method(self):
        """テストセットアップ"""
        self.app = FastAPI()
        self.app.add_middleware(ExceptionHandlerMiddleware)

        # テスト用エンドポイント
        @self.app.get("/test/not-found")
        async def test_not_found():
            raise NotFoundException("User", resource_id=123)

        @self.app.get("/test/validation")
        async def test_validation():
            raise ValidationException("Invalid input", field_name="email")

        @self.app.get("/test/duplicate")
        async def test_duplicate():
            raise DuplicateException("User", "username", "john_doe")

        @self.app.get("/test/authentication")
        async def test_authentication():
            raise AuthenticationException("Invalid credentials")

        @self.app.get("/test/authorization")
        async def test_authorization():
            raise AuthorizationException("Permission denied")

        @self.app.get("/test/database")
        async def test_database():
            raise DatabaseException("Connection failed")

        @self.app.get("/test/external-service")
        async def test_external_service():
            raise ExternalServiceException("API failed", "ExternalAPI")

        @self.app.get("/test/value-error")
        async def test_value_error():
            raise ValueError("Invalid value")

        @self.app.get("/test/unexpected")
        async def test_unexpected():
            raise RuntimeError("Unexpected error")

        @self.app.get("/test/success")
        async def test_success():
            return {"message": "success"}

        self.client = TestClient(self.app)

    @patch("infrastructure.logging.exceptions.logger")
    def test_not_found_exception_handling(self, mock_logger):
        """NotFoundException のハンドリング"""
        response = self.client.get("/test/not-found")

        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "Not Found"
        assert "User not found" in data["message"]
        assert data["error_code"] == "NOT_FOUND"

    @patch("infrastructure.logging.exceptions.logger")
    def test_validation_exception_handling(self, mock_logger):
        """ValidationException のハンドリング"""
        response = self.client.get("/test/validation")

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "Validation Error"
        assert data["error_code"] == "VALIDATION_ERROR"

    @patch("infrastructure.logging.exceptions.logger")
    def test_duplicate_exception_handling(self, mock_logger):
        """DuplicateException のハンドリング"""
        response = self.client.get("/test/duplicate")

        assert response.status_code == 409
        data = response.json()
        assert data["error"] == "Duplicate Error"
        assert data["error_code"] == "DUPLICATE_ERROR"

    @patch("infrastructure.logging.exceptions.logger")
    def test_authentication_exception_handling(self, mock_logger):
        """AuthenticationException のハンドリング"""
        response = self.client.get("/test/authentication")

        assert response.status_code == 401
        data = response.json()
        assert data["error"] == "Authentication Error"
        assert data["error_code"] == "AUTHENTICATION_ERROR"

    @patch("infrastructure.logging.exceptions.logger")
    def test_authorization_exception_handling(self, mock_logger):
        """AuthorizationException のハンドリング"""
        response = self.client.get("/test/authorization")

        assert response.status_code == 403
        data = response.json()
        assert data["error"] == "Authorization Error"
        assert data["error_code"] == "AUTHORIZATION_ERROR"

    @patch("infrastructure.logging.exceptions.logger")
    def test_database_exception_handling(self, mock_logger):
        """DatabaseException のハンドリング"""
        response = self.client.get("/test/database")

        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Database Error"
        assert data["error_code"] == "DATABASE_ERROR"

    @patch("infrastructure.logging.exceptions.logger")
    def test_external_service_exception_handling(self, mock_logger):
        """ExternalServiceException のハンドリング"""
        response = self.client.get("/test/external-service")

        assert response.status_code == 502
        data = response.json()
        assert data["error"] == "External Service Error"
        assert data["error_code"] == "EXTERNAL_SERVICE_ERROR"

    @patch("infrastructure.logging.exception_handler.logger")
    def test_value_error_handling(self, mock_logger):
        """ValueError のハンドリング"""
        response = self.client.get("/test/value-error")

        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "Bad Request"
        assert data["error_code"] == "VALUE_ERROR"
        mock_logger.warning.assert_called()

    @patch("infrastructure.logging.exception_handler.logger")
    def test_unexpected_exception_handling(self, mock_logger):
        """予期しない例外のハンドリング"""
        response = self.client.get("/test/unexpected")

        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Internal Server Error"
        assert data["error_code"] == "INTERNAL_SERVER_ERROR"
        # エラーログが記録されることを確認
        mock_logger.error.assert_called()

    @patch("infrastructure.logging.exceptions.logger")
    def test_successful_request(self, mock_logger):
        """正常なリクエストの処理"""
        response = self.client.get("/test/success")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "success"
