from passlib.context import CryptContext

from .constants import SecurityConstants


class PasswordHasher:
    def __init__(self):
        # Argon2を使用（bcryptとの後方互換性を保持）
        self.pwd_context = CryptContext(
            schemes=["argon2", "bcrypt"], 
            deprecated="auto",
            # Argon2設定（セキュリティと性能のバランス）
            argon2__memory_cost=SecurityConstants.ARGON2_MEMORY_COST,
            argon2__time_cost=SecurityConstants.ARGON2_TIME_COST,
            argon2__parallelism=SecurityConstants.ARGON2_PARALLELISM,
            # bcrypt設定（既存ハッシュ用）
            bcrypt__rounds=SecurityConstants.BCRYPT_ROUNDS
        )

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)