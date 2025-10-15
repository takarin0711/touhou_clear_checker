"""
ロギング関連の定数定義

マジックナンバー禁止原則に従い、ログ設定値を定数として管理します。
"""
import os
from typing import Final


class LoggingConstants:
    """ログ設定定数"""

    # ログレベル
    LOG_LEVEL_DEBUG: Final[str] = "DEBUG"
    LOG_LEVEL_INFO: Final[str] = "INFO"
    LOG_LEVEL_WARNING: Final[str] = "WARNING"
    LOG_LEVEL_ERROR: Final[str] = "ERROR"
    LOG_LEVEL_CRITICAL: Final[str] = "CRITICAL"

    # デフォルトログレベル（環境変数で上書き可能）
    DEFAULT_LOG_LEVEL: Final[str] = os.getenv("LOG_LEVEL", LOG_LEVEL_INFO)

    # ログ出力先
    LOG_DIR: Final[str] = os.getenv("LOG_DIR", "logs")
    LOG_FILE_APP: Final[str] = "app.log"
    LOG_FILE_ERROR: Final[str] = "error.log"
    LOG_FILE_SECURITY: Final[str] = "security.log"

    # ログローテーション設定
    LOG_MAX_BYTES: Final[int] = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT: Final[int] = 5  # 5世代保持

    # ログフォーマット
    LOG_FORMAT_JSON: Final[str] = "json"
    LOG_FORMAT_TEXT: Final[str] = "text"
    DEFAULT_LOG_FORMAT: Final[str] = os.getenv("LOG_FORMAT", LOG_FORMAT_JSON)

    # テキスト形式のログフォーマット
    TEXT_LOG_FORMAT: Final[str] = (
        "%(asctime)s - %(name)s - %(levelname)s - "
        "%(funcName)s:%(lineno)d - %(message)s"
    )

    # 日付フォーマット
    DATE_FORMAT: Final[str] = "%Y-%m-%d %H:%M:%S"

    # JSON ログのキー名
    JSON_KEY_TIMESTAMP: Final[str] = "timestamp"
    JSON_KEY_LEVEL: Final[str] = "level"
    JSON_KEY_LOGGER: Final[str] = "logger"
    JSON_KEY_MESSAGE: Final[str] = "message"
    JSON_KEY_FUNCTION: Final[str] = "function"
    JSON_KEY_LINE: Final[str] = "line"
    JSON_KEY_MODULE: Final[str] = "module"
    JSON_KEY_EXTRA: Final[str] = "extra"

    # リクエストトレーシング用キー
    JSON_KEY_REQUEST_PATH: Final[str] = "request_path"
    JSON_KEY_REQUEST_METHOD: Final[str] = "request_method"
    JSON_KEY_RESPONSE_TIME: Final[str] = "response_time_ms"

    # セキュリティログ用キー
    JSON_KEY_EVENT_TYPE: Final[str] = "event_type"
    JSON_KEY_USER_ID: Final[str] = "user_id"
    JSON_KEY_USERNAME: Final[str] = "username"
    JSON_KEY_IP_ADDRESS: Final[str] = "ip_address"
    JSON_KEY_REQUEST_ID: Final[str] = "request_id"
    JSON_KEY_STATUS_CODE: Final[str] = "status_code"

    # セキュリティイベント種別
    EVENT_TYPE_LOGIN_SUCCESS: Final[str] = "login_success"
    EVENT_TYPE_LOGIN_FAILURE: Final[str] = "login_failure"
    EVENT_TYPE_LOGOUT: Final[str] = "logout"
    EVENT_TYPE_TOKEN_REFRESH: Final[str] = "token_refresh"
    EVENT_TYPE_PASSWORD_CHANGE: Final[str] = "password_change"
    EVENT_TYPE_UNAUTHORIZED_ACCESS: Final[str] = "unauthorized_access"
    EVENT_TYPE_REGISTRATION: Final[str] = "user_registration"
    EVENT_TYPE_EMAIL_VERIFICATION: Final[str] = "email_verification"
