from passlib.context import CryptContext


class PasswordHasher:
    def __init__(self):
        # Argon2を使用（bcryptとの後方互換性を保持）
        self.pwd_context = CryptContext(
            schemes=["argon2", "bcrypt"], 
            deprecated="auto",
            # Argon2設定（セキュリティと性能のバランス）
            argon2__memory_cost=65536,    # 64MB メモリ使用
            argon2__time_cost=3,          # 3回反復
            argon2__parallelism=1,        # 1並列処理
            # bcrypt設定（既存ハッシュ用）
            bcrypt__rounds=12
        )

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)