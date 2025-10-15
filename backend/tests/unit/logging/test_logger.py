"""
ロガー設定のテスト
"""
import logging
import json
import pytest
from pathlib import Path
from infrastructure.logging.logger import LoggerFactory, JSONFormatter, SecurityLogger
from infrastructure.logging.constants import LoggingConstants


class TestLoggerFactory:
    """LoggerFactoryのテストクラス"""

    def test_get_logger_returns_logger_instance(self):
        """get_loggerがLoggerインスタンスを返すこと"""
        logger = LoggerFactory.get_logger("test_logger")
        assert isinstance(logger, logging.Logger)
        assert logger.name == "test_logger"

    def test_setup_logging_creates_log_directory(self, tmp_path, monkeypatch):
        """setup_loggingがログディレクトリを作成すること"""
        test_log_dir = tmp_path / "test_logs"
        monkeypatch.setattr(LoggingConstants, "LOG_DIR", str(test_log_dir))

        # 初期化フラグをリセット
        LoggerFactory._initialized = False

        LoggerFactory.setup_logging()

        assert test_log_dir.exists()
        assert test_log_dir.is_dir()

    def test_get_logger_initializes_logging_system(self):
        """get_loggerが初回呼び出し時にロギングシステムを初期化すること"""
        # 初期化フラグをリセット
        LoggerFactory._initialized = False

        logger = LoggerFactory.get_logger("test_logger")

        # ロギングシステムが初期化されている
        assert LoggerFactory._initialized is True
        assert isinstance(logger, logging.Logger)


class TestJSONFormatter:
    """JSONFormatterのテストクラス"""

    def test_format_creates_valid_json(self):
        """formatメソッドが有効なJSONを生成すること"""
        formatter = JSONFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None
        )

        formatted = formatter.format(record)
        data = json.loads(formatted)  # JSON パース成功

        assert LoggingConstants.JSON_KEY_MESSAGE in data
        assert data[LoggingConstants.JSON_KEY_MESSAGE] == "Test message"
        assert data[LoggingConstants.JSON_KEY_LEVEL] == "INFO"
        assert data[LoggingConstants.JSON_KEY_LOGGER] == "test"

    def test_format_includes_extra_data(self):
        """formatメソッドがextraデータを含むこと"""
        formatter = JSONFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None
        )
        # extra データを追加
        setattr(record, LoggingConstants.JSON_KEY_EXTRA, {"user_id": 123})

        formatted = formatter.format(record)
        data = json.loads(formatted)

        assert LoggingConstants.JSON_KEY_EXTRA in data
        assert data[LoggingConstants.JSON_KEY_EXTRA]["user_id"] == 123

    def test_format_sanitizes_sensitive_data_in_extra(self):
        """formatメソッドがextraデータ内の機密情報をマスキングすること"""
        formatter = JSONFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None
        )
        # 機密情報を含むextraデータ
        setattr(record, LoggingConstants.JSON_KEY_EXTRA, {
            "username": "testuser",
            "password": "secret123"
        })

        formatted = formatter.format(record)
        data = json.loads(formatted)

        # パスワードがマスキングされている
        assert data[LoggingConstants.JSON_KEY_EXTRA]["username"] == "testuser"
        assert data[LoggingConstants.JSON_KEY_EXTRA]["password"] == "***REDACTED***"


class TestSecurityLogger:
    """SecurityLoggerのテストクラス"""

    def test_security_logger_initialization(self, tmp_path, monkeypatch):
        """SecurityLoggerが正しく初期化されること"""
        test_log_dir = tmp_path / "test_logs"
        monkeypatch.setattr(LoggingConstants, "LOG_DIR", str(test_log_dir))

        security_logger = SecurityLogger()

        assert security_logger.logger.name == "security"
        assert test_log_dir.exists()

    def test_log_security_event_creates_log_entry(self, tmp_path, monkeypatch):
        """log_security_eventがログエントリを作成すること"""
        test_log_dir = tmp_path / "test_logs"
        monkeypatch.setattr(LoggingConstants, "LOG_DIR", str(test_log_dir))

        security_logger = SecurityLogger()
        security_logger.log_security_event(
            event_type=LoggingConstants.EVENT_TYPE_LOGIN_SUCCESS,
            user_id=123,
            username="testuser",
            ip_address="192.168.1.1",
            status_code=200,
            message="User logged in"
        )

        # ログファイルが作成されている
        log_file = test_log_dir / LoggingConstants.LOG_FILE_SECURITY
        assert log_file.exists()

    def test_log_security_event_sanitizes_sensitive_data(self, tmp_path, monkeypatch):
        """log_security_eventが機密情報をマスキングすること"""
        test_log_dir = tmp_path / "test_logs"
        monkeypatch.setattr(LoggingConstants, "LOG_DIR", str(test_log_dir))

        security_logger = SecurityLogger()
        security_logger.log_security_event(
            event_type=LoggingConstants.EVENT_TYPE_LOGIN_SUCCESS,
            username="testuser",
            extra={
                "username": "testuser",
                "password": "secret123"  # この機密情報はマスキングされるべき
            }
        )

        # ログファイルを読み取り
        log_file = test_log_dir / LoggingConstants.LOG_FILE_SECURITY
        assert log_file.exists()

        # ログ内容を確認（パスワードがマスキングされている）
        log_content = log_file.read_text()
        assert "secret123" not in log_content
        assert "***REDACTED***" in log_content
