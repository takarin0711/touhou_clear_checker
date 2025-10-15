"""
機密情報マスキング機能

ログ出力時にパスワード、トークン、APIキー等の機密情報を自動的にマスキングします。
"""
import re
from typing import Any, Dict, List, Pattern


class SensitiveDataSanitizer:
    """機密情報のマスキングを行うクラス"""

    # マスキング文字列
    MASK_STRING = "***REDACTED***"

    # 機密情報を含む可能性のあるキー名（小文字）
    SENSITIVE_KEYS = [
        "password",
        "passwd",
        "pwd",
        "secret",
        "token",
        "api_key",
        "apikey",
        "access_token",
        "refresh_token",
        "authorization",
        "auth",
        "jwt",
        "session_id",
        "sessionid",
        "credit_card",
        "card_number",
        "cvv",
        "ssn",
        "private_key",
        "privatekey",
        "email",
        "email_address",
        "mail",
    ]

    # 機密情報パターン（正規表現）
    SENSITIVE_PATTERNS: List[Pattern] = [
        # JWT トークン形式
        re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
        # Bearer トークン
        re.compile(r"Bearer\s+[A-Za-z0-9_\-\.]{20,}", re.IGNORECASE),
        # API キー形式（32文字以上の英数字）
        re.compile(r"\b[A-Za-z0-9]{32,}\b"),
        # メールアドレス形式
        re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    ]

    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        辞書内の機密情報をマスキングする

        Args:
            data: マスキング対象の辞書

        Returns:
            マスキング後の辞書（新しいオブジェクト）
        """
        if not isinstance(data, dict):
            return data

        sanitized = {}
        for key, value in data.items():
            # キー名が機密情報を示す場合
            if cls._is_sensitive_key(key):
                sanitized[key] = cls.MASK_STRING
            # 値が辞書の場合は再帰的に処理
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_dict(value)
            # 値がリストの場合
            elif isinstance(value, list):
                sanitized[key] = [
                    cls.sanitize_dict(item) if isinstance(item, dict) else cls.sanitize_value(item)
                    for item in value
                ]
            # 文字列値の場合はパターンマッチング
            else:
                sanitized[key] = cls.sanitize_value(value)

        return sanitized

    @classmethod
    def sanitize_value(cls, value: Any) -> Any:
        """
        値が機密情報パターンに一致する場合はマスキングする

        Args:
            value: マスキング対象の値

        Returns:
            マスキング後の値
        """
        if not isinstance(value, str):
            return value

        # パターンマッチングでマスキング
        for pattern in cls.SENSITIVE_PATTERNS:
            if pattern.search(value):
                return cls.MASK_STRING

        return value

    @classmethod
    def sanitize_string(cls, text: str) -> str:
        """
        文字列内の機密情報パターンをマスキングする

        Args:
            text: マスキング対象の文字列

        Returns:
            マスキング後の文字列
        """
        if not isinstance(text, str):
            return text

        sanitized = text
        for pattern in cls.SENSITIVE_PATTERNS:
            sanitized = pattern.sub(cls.MASK_STRING, sanitized)

        return sanitized

    @classmethod
    def _is_sensitive_key(cls, key: str) -> bool:
        """
        キー名が機密情報を示すかどうかを判定

        Args:
            key: チェック対象のキー名

        Returns:
            機密情報キーの場合True
        """
        key_lower = key.lower()
        return any(sensitive in key_lower for sensitive in cls.SENSITIVE_KEYS)
