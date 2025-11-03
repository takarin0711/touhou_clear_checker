"""
ネットワーク・アプリケーション設定の定数定義
"""
import os


class NetworkConstants:
    """ネットワーク設定の定数クラス"""

    # サーバー設定
    DEFAULT_HOST = "0.0.0.0"
    DEFAULT_PORT = 8000

    # SSL/TLS設定
    SSL_ENABLED = os.getenv("SSL_ENABLED", "false").lower() == "true"
    SSL_CERT_PATH = os.getenv("SSL_CERT_PATH", "../certs/localhost+2.pem")
    SSL_KEY_PATH = os.getenv("SSL_KEY_PATH", "../certs/localhost+2-key.pem")

    # CORS設定
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://localhost:3001",
        "https://127.0.0.1:3000"
    ]
    
    ALLOWED_METHODS = [
        "GET",
        "POST", 
        "PUT",
        "DELETE",
        "OPTIONS"
    ]
    
    ALLOWED_HEADERS = ["*"]
    
    # 認証設定
    ALLOW_CREDENTIALS = True