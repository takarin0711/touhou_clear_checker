"""
バリデーション関連の定数定義
"""


class ValidationConstants:
    """バリデーション設定の定数クラス"""
    
    # ユーザー名バリデーション
    USERNAME_MIN_LENGTH = 3
    USERNAME_MAX_LENGTH = 50
    
    # パスワードバリデーション
    PASSWORD_MIN_LENGTH = 6
    
    # メールアドレスバリデーション
    EMAIL_MAX_LENGTH = 100
    
    # ハッシュパスワード長
    HASHED_PASSWORD_MAX_LENGTH = 255
    
    # 認証トークン長
    VERIFICATION_TOKEN_MAX_LENGTH = 255
    
    # ゲーム機体バリデーション
    CHARACTER_NAME_MIN_LENGTH = 1
    CHARACTER_NAME_MAX_LENGTH = 100
    CHARACTER_DESCRIPTION_MAX_LENGTH = 500
    
    # HTTPステータスコード
    HTTP_NOT_FOUND = 404