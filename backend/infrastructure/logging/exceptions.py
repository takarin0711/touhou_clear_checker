"""
カスタム例外クラス（ログ機能付き）
"""
from typing import Optional, Dict, Any
from infrastructure.logging.logger import LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class ApplicationException(Exception):
    """アプリケーション共通の基底例外クラス"""

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        log_level: str = "error"
    ):
        """
        Args:
            message: エラーメッセージ
            error_code: エラーコード（オプション）
            details: 追加詳細情報（オプション）
            log_level: ログレベル（error, warning, info等）
        """
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}

        # 例外発生時に自動的にログを記録
        self._log_exception(log_level)

    def _log_exception(self, log_level: str) -> None:
        """例外をログに記録"""
        extra_data = {
            "error_code": self.error_code,
            "error_type": self.__class__.__name__,
        }
        if self.details:
            extra_data["error_details"] = self.details

        log_message = f"{self.__class__.__name__}: {self.message}"

        if log_level == "error":
            logger.error(log_message, extra={"extra": extra_data})
        elif log_level == "warning":
            logger.warning(log_message, extra={"extra": extra_data})
        elif log_level == "info":
            logger.info(log_message, extra={"extra": extra_data})
        else:
            logger.debug(log_message, extra={"extra": extra_data})


class NotFoundException(ApplicationException):
    """リソースが見つからない場合の例外"""

    def __init__(
        self,
        resource_type: str,
        resource_id: Optional[Any] = None,
        message: Optional[str] = None
    ):
        """
        Args:
            resource_type: リソースタイプ（例: "User", "Game", "ClearRecord"）
            resource_id: リソースID（オプション）
            message: カスタムメッセージ（オプション）
        """
        if message is None:
            if resource_id is not None:
                message = f"{resource_type} not found: id={resource_id}"
            else:
                message = f"{resource_type} not found"

        details = {
            "resource_type": resource_type,
            "resource_id": resource_id
        }

        super().__init__(
            message=message,
            error_code="NOT_FOUND",
            details=details,
            log_level="warning"
        )


class ValidationException(ApplicationException):
    """バリデーションエラーの例外"""

    def __init__(
        self,
        message: str,
        field_name: Optional[str] = None,
        invalid_value: Optional[Any] = None
    ):
        """
        Args:
            message: エラーメッセージ
            field_name: フィールド名（オプション）
            invalid_value: 不正な値（オプション）
        """
        details = {}
        if field_name:
            details["field_name"] = field_name
        if invalid_value is not None:
            details["invalid_value"] = str(invalid_value)

        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details=details,
            log_level="warning"
        )


class DuplicateException(ApplicationException):
    """重複エラーの例外"""

    def __init__(
        self,
        resource_type: str,
        field_name: str,
        value: Any,
        message: Optional[str] = None
    ):
        """
        Args:
            resource_type: リソースタイプ（例: "User", "Game"）
            field_name: 重複フィールド名
            value: 重複した値
            message: カスタムメッセージ（オプション）
        """
        if message is None:
            message = f"{resource_type} already exists: {field_name}={value}"

        details = {
            "resource_type": resource_type,
            "field_name": field_name,
            "duplicate_value": str(value)
        }

        super().__init__(
            message=message,
            error_code="DUPLICATE_ERROR",
            details=details,
            log_level="warning"
        )


class AuthenticationException(ApplicationException):
    """認証エラーの例外"""

    def __init__(
        self,
        message: str = "Authentication failed",
        username: Optional[str] = None
    ):
        """
        Args:
            message: エラーメッセージ
            username: ユーザー名（オプション）
        """
        details = {}
        if username:
            details["username"] = username

        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            details=details,
            log_level="warning"
        )


class AuthorizationException(ApplicationException):
    """認可エラーの例外"""

    def __init__(
        self,
        message: str = "Permission denied",
        user_id: Optional[int] = None,
        required_permission: Optional[str] = None
    ):
        """
        Args:
            message: エラーメッセージ
            user_id: ユーザーID（オプション）
            required_permission: 必要な権限（オプション）
        """
        details = {}
        if user_id:
            details["user_id"] = user_id
        if required_permission:
            details["required_permission"] = required_permission

        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            details=details,
            log_level="warning"
        )


class DatabaseException(ApplicationException):
    """データベース操作エラーの例外"""

    def __init__(
        self,
        message: str,
        operation: Optional[str] = None,
        table_name: Optional[str] = None
    ):
        """
        Args:
            message: エラーメッセージ
            operation: データベース操作（例: "INSERT", "UPDATE", "DELETE"）
            table_name: テーブル名（オプション）
        """
        details = {}
        if operation:
            details["operation"] = operation
        if table_name:
            details["table_name"] = table_name

        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            details=details,
            log_level="error"
        )


class ExternalServiceException(ApplicationException):
    """外部サービス連携エラーの例外"""

    def __init__(
        self,
        message: str,
        service_name: str,
        status_code: Optional[int] = None
    ):
        """
        Args:
            message: エラーメッセージ
            service_name: サービス名（例: "SMTP", "AWS"）
            status_code: HTTPステータスコード（オプション）
        """
        details = {
            "service_name": service_name
        }
        if status_code:
            details["status_code"] = status_code

        super().__init__(
            message=message,
            error_code="EXTERNAL_SERVICE_ERROR",
            details=details,
            log_level="error"
        )
