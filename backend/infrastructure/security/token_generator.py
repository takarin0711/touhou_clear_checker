import secrets
import string
from datetime import datetime, timedelta, UTC
from typing import Tuple

from .constants import SecurityConstants


class TokenGenerator:
    """認証トークン生成クラス"""
    
    @staticmethod
    def generate_verification_token() -> str:
        """メール認証用トークンを生成"""
        # URLセーフな文字列を使用
        alphabet = string.ascii_letters + string.digits + "-_"
        return ''.join(secrets.choice(alphabet) for _ in range(SecurityConstants.EMAIL_TOKEN_LENGTH))
    
    @staticmethod
    def generate_token_with_expiry(hours: int = SecurityConstants.EMAIL_TOKEN_EXPIRE_HOURS) -> Tuple[str, datetime]:
        """トークンと有効期限をセットで生成"""
        token = TokenGenerator.generate_verification_token()
        expires_at = datetime.now(UTC) + timedelta(hours=hours)
        return token, expires_at
    
    @staticmethod
    def is_token_expired(expires_at: datetime) -> bool:
        """トークンが期限切れかチェック"""
        return datetime.now(UTC) > expires_at