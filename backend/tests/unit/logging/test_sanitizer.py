"""
機密情報マスキング機能のテスト
"""
import pytest
from infrastructure.logging.sanitizer import SensitiveDataSanitizer


class TestSensitiveDataSanitizer:
    """SensitiveDataSanitizerのテストクラス"""

    def test_sanitize_dict_with_password(self):
        """パスワードキーが正しくマスキングされること"""
        data = {
            "username": "testuser",
            "password": "secret123",
            "email": "test@example.com"
        }
        result = SensitiveDataSanitizer.sanitize_dict(data)

        assert result["username"] == "testuser"
        assert result["password"] == SensitiveDataSanitizer.MASK_STRING
        assert result["email"] == SensitiveDataSanitizer.MASK_STRING  # メールアドレスもマスキング対象

    def test_sanitize_dict_with_token(self):
        """トークンキーが正しくマスキングされること"""
        data = {
            "user_id": 123,
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.abc123",
            "username": "testuser"
        }
        result = SensitiveDataSanitizer.sanitize_dict(data)

        assert result["user_id"] == 123
        assert result["access_token"] == SensitiveDataSanitizer.MASK_STRING
        assert result["username"] == "testuser"

    def test_sanitize_dict_with_nested_dict(self):
        """ネストされた辞書内の機密情報がマスキングされること"""
        data = {
            "user": {
                "username": "testuser",
                "password": "secret123"
            },
            "metadata": {
                "login_time": "2025-01-01 00:00:00"
            }
        }
        result = SensitiveDataSanitizer.sanitize_dict(data)

        assert result["user"]["username"] == "testuser"
        assert result["user"]["password"] == SensitiveDataSanitizer.MASK_STRING
        assert result["metadata"]["login_time"] == "2025-01-01 00:00:00"

    def test_sanitize_dict_with_list(self):
        """リスト内の辞書の機密情報がマスキングされること"""
        data = {
            "users": [
                {"username": "user1", "password": "pass1"},
                {"username": "user2", "api_key": "key123456"}
            ]
        }
        result = SensitiveDataSanitizer.sanitize_dict(data)

        assert result["users"][0]["username"] == "user1"
        assert result["users"][0]["password"] == SensitiveDataSanitizer.MASK_STRING
        assert result["users"][1]["username"] == "user2"
        assert result["users"][1]["api_key"] == SensitiveDataSanitizer.MASK_STRING

    def test_sanitize_value_with_jwt_token(self):
        """JWT形式のトークンが正しくマスキングされること"""
        jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        result = SensitiveDataSanitizer.sanitize_value(jwt_token)

        assert result == SensitiveDataSanitizer.MASK_STRING

    def test_sanitize_value_with_bearer_token(self):
        """Bearer トークンが正しくマスキングされること"""
        bearer_token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"
        result = SensitiveDataSanitizer.sanitize_value(bearer_token)

        assert result == SensitiveDataSanitizer.MASK_STRING

    def test_sanitize_value_with_api_key(self):
        """APIキー形式の文字列が正しくマスキングされること"""
        # 32文字以上の英数字文字列
        api_key = "1234567890abcdefghijklmnopqrstuvwxyzABCDEF"
        result = SensitiveDataSanitizer.sanitize_value(api_key)

        assert result == SensitiveDataSanitizer.MASK_STRING

    def test_sanitize_value_with_normal_string(self):
        """通常の文字列はマスキングされないこと"""
        normal_string = "This is a normal text"
        result = SensitiveDataSanitizer.sanitize_value(normal_string)

        assert result == normal_string

    def test_sanitize_value_with_non_string(self):
        """文字列以外の値はそのまま返されること"""
        assert SensitiveDataSanitizer.sanitize_value(123) == 123
        assert SensitiveDataSanitizer.sanitize_value(True) is True
        assert SensitiveDataSanitizer.sanitize_value(None) is None

    def test_sanitize_string_with_jwt_in_text(self):
        """テキスト中のJWTトークンが正しくマスキングされること"""
        text = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.abc123def456"
        result = SensitiveDataSanitizer.sanitize_string(text)

        assert SensitiveDataSanitizer.MASK_STRING in result
        assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in result

    def test_is_sensitive_key_with_various_keys(self):
        """各種機密情報キーが正しく判定されること"""
        # 機密情報キー
        assert SensitiveDataSanitizer._is_sensitive_key("password")
        assert SensitiveDataSanitizer._is_sensitive_key("Password")
        assert SensitiveDataSanitizer._is_sensitive_key("user_password")
        assert SensitiveDataSanitizer._is_sensitive_key("access_token")
        assert SensitiveDataSanitizer._is_sensitive_key("api_key")
        assert SensitiveDataSanitizer._is_sensitive_key("SECRET_KEY")
        assert SensitiveDataSanitizer._is_sensitive_key("jwt_token")
        assert SensitiveDataSanitizer._is_sensitive_key("email")
        assert SensitiveDataSanitizer._is_sensitive_key("email_address")
        assert SensitiveDataSanitizer._is_sensitive_key("user_email")

        # 通常のキー
        assert not SensitiveDataSanitizer._is_sensitive_key("username")
        assert not SensitiveDataSanitizer._is_sensitive_key("user_id")
        assert not SensitiveDataSanitizer._is_sensitive_key("timestamp")

    def test_sanitize_dict_with_mixed_case_keys(self):
        """大文字小文字混在のキーでも機密情報が検出されること"""
        data = {
            "Password": "secret123",
            "API_KEY": "key123456",
            "AccessToken": "token123"
        }
        result = SensitiveDataSanitizer.sanitize_dict(data)

        assert result["Password"] == SensitiveDataSanitizer.MASK_STRING
        assert result["API_KEY"] == SensitiveDataSanitizer.MASK_STRING
        assert result["AccessToken"] == SensitiveDataSanitizer.MASK_STRING

    def test_sanitize_value_with_email_address(self):
        """メールアドレスが正しくマスキングされること"""
        email = "test.user+tag@example.com"
        result = SensitiveDataSanitizer.sanitize_value(email)

        assert result == SensitiveDataSanitizer.MASK_STRING

    def test_sanitize_string_with_email_in_text(self):
        """テキスト中のメールアドレスが正しくマスキングされること"""
        text = "User registration: email=john.doe@example.com, username=johndoe"
        result = SensitiveDataSanitizer.sanitize_string(text)

        assert SensitiveDataSanitizer.MASK_STRING in result
        assert "john.doe@example.com" not in result
        assert "username=johndoe" in result  # メール以外は残る

    def test_sanitize_dict_does_not_modify_original(self):
        """元の辞書が変更されないこと（新しいオブジェクトを返す）"""
        original = {
            "username": "testuser",
            "password": "secret123"
        }
        original_copy = original.copy()
        result = SensitiveDataSanitizer.sanitize_dict(original)

        # 元の辞書は変更されていない
        assert original == original_copy
        # 新しい辞書が返される
        assert result is not original
        assert result["password"] == SensitiveDataSanitizer.MASK_STRING
