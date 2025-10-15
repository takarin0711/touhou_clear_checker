"""
アプリケーション全体のログ設定

構造化ログ（JSON形式）、ファイルローテーション、機密情報マスキングに対応したロガーを提供します。
"""
import json
import logging
import logging.handlers
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from infrastructure.logging.constants import LoggingConstants
from infrastructure.logging.sanitizer import SensitiveDataSanitizer


def get_request_context() -> Dict[str, Any]:
    """
    現在のリクエストコンテキストを取得

    Returns:
        コンテキスト情報の辞書
    """
    try:
        from infrastructure.logging.context import RequestContext
        context = {}

        request_id = RequestContext.get_request_id()
        if request_id:
            context[LoggingConstants.JSON_KEY_REQUEST_ID] = request_id

        user_id = RequestContext.get_user_id()
        if user_id:
            context[LoggingConstants.JSON_KEY_USER_ID] = user_id

        username = RequestContext.get_username()
        if username:
            context[LoggingConstants.JSON_KEY_USERNAME] = username

        return context
    except ImportError:
        # コンテキストモジュールがインポートできない場合は空を返す
        return {}


class JSONFormatter(logging.Formatter):
    """JSON形式でログを出力するフォーマッター"""

    def format(self, record: logging.LogRecord) -> str:
        """
        ログレコードをJSON形式に変換

        Args:
            record: ログレコード

        Returns:
            JSON形式のログ文字列
        """
        log_data: Dict[str, Any] = {
            LoggingConstants.JSON_KEY_TIMESTAMP: datetime.fromtimestamp(
                record.created
            ).strftime(LoggingConstants.DATE_FORMAT),
            LoggingConstants.JSON_KEY_LEVEL: record.levelname,
            LoggingConstants.JSON_KEY_LOGGER: record.name,
            LoggingConstants.JSON_KEY_MESSAGE: record.getMessage(),
            LoggingConstants.JSON_KEY_MODULE: record.module,
            LoggingConstants.JSON_KEY_FUNCTION: record.funcName,
            LoggingConstants.JSON_KEY_LINE: record.lineno,
        }

        # リクエストコンテキスト情報を取得して追加
        context_data = get_request_context()
        if context_data:
            log_data.update(context_data)

        # 追加の情報があれば含める
        if hasattr(record, LoggingConstants.JSON_KEY_EXTRA):
            extra_data = getattr(record, LoggingConstants.JSON_KEY_EXTRA)
            # 機密情報をマスキング
            if isinstance(extra_data, dict):
                extra_data = SensitiveDataSanitizer.sanitize_dict(extra_data)
            log_data[LoggingConstants.JSON_KEY_EXTRA] = extra_data

        # 例外情報があれば含める
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data, ensure_ascii=False)


class LoggerFactory:
    """ロガーを作成するファクトリクラス"""

    _initialized = False

    @classmethod
    def setup_logging(cls) -> None:
        """
        ロギングシステムの初期設定を行う

        アプリケーション起動時に一度だけ呼び出してください。
        """
        if cls._initialized:
            return

        # ログディレクトリの作成
        log_dir = Path(LoggingConstants.LOG_DIR)
        log_dir.mkdir(exist_ok=True)

        # ルートロガーの設定
        root_logger = logging.getLogger()
        root_logger.setLevel(LoggingConstants.DEFAULT_LOG_LEVEL)

        # 既存のハンドラーをクリア
        root_logger.handlers.clear()

        # コンソール出力ハンドラー
        console_handler = logging.StreamHandler()
        console_handler.setLevel(LoggingConstants.DEFAULT_LOG_LEVEL)

        if LoggingConstants.DEFAULT_LOG_FORMAT == LoggingConstants.LOG_FORMAT_JSON:
            console_handler.setFormatter(JSONFormatter())
        else:
            console_handler.setFormatter(
                logging.Formatter(
                    LoggingConstants.TEXT_LOG_FORMAT,
                    datefmt=LoggingConstants.DATE_FORMAT
                )
            )
        root_logger.addHandler(console_handler)

        # アプリケーションログファイルハンドラー（全レベル）
        app_file_handler = cls._create_rotating_file_handler(
            log_dir / LoggingConstants.LOG_FILE_APP,
            LoggingConstants.DEFAULT_LOG_LEVEL
        )
        root_logger.addHandler(app_file_handler)

        # エラーログファイルハンドラー（ERROR以上）
        error_file_handler = cls._create_rotating_file_handler(
            log_dir / LoggingConstants.LOG_FILE_ERROR,
            LoggingConstants.LOG_LEVEL_ERROR
        )
        root_logger.addHandler(error_file_handler)

        cls._initialized = True

    @classmethod
    def _create_rotating_file_handler(
        cls, filepath: Path, level: str
    ) -> logging.handlers.RotatingFileHandler:
        """
        ローテーション機能付きファイルハンドラーを作成

        Args:
            filepath: ログファイルパス
            level: ログレベル

        Returns:
            RotatingFileHandlerインスタンス
        """
        handler = logging.handlers.RotatingFileHandler(
            filepath,
            maxBytes=LoggingConstants.LOG_MAX_BYTES,
            backupCount=LoggingConstants.LOG_BACKUP_COUNT,
            encoding="utf-8"
        )
        handler.setLevel(level)

        if LoggingConstants.DEFAULT_LOG_FORMAT == LoggingConstants.LOG_FORMAT_JSON:
            handler.setFormatter(JSONFormatter())
        else:
            handler.setFormatter(
                logging.Formatter(
                    LoggingConstants.TEXT_LOG_FORMAT,
                    datefmt=LoggingConstants.DATE_FORMAT
                )
            )

        return handler

    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        """
        指定された名前のロガーを取得

        Args:
            name: ロガー名（通常は __name__ を使用）

        Returns:
            Loggerインスタンス
        """
        if not cls._initialized:
            cls.setup_logging()

        return logging.getLogger(name)


class SecurityLogger:
    """セキュリティイベント専用のロガー"""

    def __init__(self):
        """セキュリティロガーを初期化"""
        log_dir = Path(LoggingConstants.LOG_DIR)
        log_dir.mkdir(exist_ok=True)

        self.logger = logging.getLogger("security")
        self.logger.setLevel(LoggingConstants.LOG_LEVEL_INFO)
        self.logger.propagate = False  # ルートロガーへの伝播を無効化

        # セキュリティログ専用のファイルハンドラー
        security_handler = logging.handlers.RotatingFileHandler(
            log_dir / LoggingConstants.LOG_FILE_SECURITY,
            maxBytes=LoggingConstants.LOG_MAX_BYTES,
            backupCount=LoggingConstants.LOG_BACKUP_COUNT,
            encoding="utf-8"
        )
        security_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(security_handler)

    def log_security_event(
        self,
        event_type: str,
        user_id: Optional[int] = None,
        username: Optional[str] = None,
        ip_address: Optional[str] = None,
        status_code: Optional[int] = None,
        message: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        セキュリティイベントをログに記録

        Args:
            event_type: イベント種別（LOGIN_SUCCESS等）
            user_id: ユーザーID
            username: ユーザー名
            ip_address: IPアドレス
            status_code: HTTPステータスコード
            message: 追加メッセージ
            extra: その他の追加情報
        """
        event_data = {
            LoggingConstants.JSON_KEY_EVENT_TYPE: event_type,
        }

        if user_id is not None:
            event_data[LoggingConstants.JSON_KEY_USER_ID] = user_id
        if username:
            event_data[LoggingConstants.JSON_KEY_USERNAME] = username
        if ip_address:
            event_data[LoggingConstants.JSON_KEY_IP_ADDRESS] = ip_address
        if status_code is not None:
            event_data[LoggingConstants.JSON_KEY_STATUS_CODE] = status_code
        if extra:
            # 機密情報をマスキング
            event_data.update(SensitiveDataSanitizer.sanitize_dict(extra))

        log_message = message or f"Security event: {event_type}"

        # LogRecordにextra情報を追加
        self.logger.info(
            log_message,
            extra={LoggingConstants.JSON_KEY_EXTRA: event_data}
        )


# グローバルなセキュリティロガーインスタンス
security_logger = SecurityLogger()
