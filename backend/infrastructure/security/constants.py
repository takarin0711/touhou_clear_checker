"""
セキュリティ関連の定数定義
"""


class SecurityConstants:
    """セキュリティ設定の定数クラス"""
    
    # JWT設定
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
    JWT_ALGORITHM = "HS256"
    JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
    
    # メール認証トークン設定
    EMAIL_TOKEN_LENGTH = 64
    EMAIL_TOKEN_EXPIRE_HOURS = 24
    
    # パスワードハッシュ設定（Argon2）
    ARGON2_MEMORY_COST = 65536  # 64MB メモリ使用
    ARGON2_TIME_COST = 3        # 3回反復
    ARGON2_PARALLELISM = 1      # 1並列処理
    
    # パスワードハッシュ設定（bcrypt）
    BCRYPT_ROUNDS = 12
    
    # SMTP設定
    SMTP_DEFAULT_PORT = 587