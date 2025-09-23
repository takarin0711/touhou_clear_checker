import secrets
import string
from datetime import datetime, timedelta
from typing import Tuple


class TokenGenerator:
    """認証トークン生成クラス"""
    
    @staticmethod
    def generate_verification_token() -> str:
        """メール認証用トークンを生成"""
        # URLセーフな文字列を使用（64文字）
        alphabet = string.ascii_letters + string.digits + "-_"
        return ''.join(secrets.choice(alphabet) for _ in range(64))
    
    @staticmethod
    def generate_token_with_expiry(hours: int = 24) -> Tuple[str, datetime]:
        """トークンと有効期限をセットで生成"""
        token = TokenGenerator.generate_verification_token()
        expires_at = datetime.utcnow() + timedelta(hours=hours)
        return token, expires_at
    
    @staticmethod
    def is_token_expired(expires_at: datetime) -> bool:
        """トークンが期限切れかチェック"""
        return datetime.utcnow() > expires_at