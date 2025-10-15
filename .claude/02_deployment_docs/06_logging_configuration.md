# ロギング設定ガイド

## 概要
このドキュメントは、touhou_clear_checkerプロジェクトのロギング機能について説明します。

## ロギングアーキテクチャ

### 基本構成
```
infrastructure/
└── logging/
    ├── constants.py         # ログ定数定義
    ├── sanitizer.py         # 機密情報マスキング
    ├── logger.py            # ロガー設定
    ├── context.py           # リクエストコンテキスト管理
    ├── middleware.py        # リクエストトレーシングミドルウェア
    ├── exceptions.py        # カスタム例外クラス（NEW!）
    └── exception_handler.py # 例外ハンドラーミドルウェア（NEW!）
```

## 機能概要

### 1. 構造化ログ（JSON形式）
- **本番環境推奨**: ログ分析ツールとの連携が容易
- **フォーマット**: JSON形式で出力（環境変数で切り替え可能）
- **含まれる情報**:
  - `timestamp`: ログ出力時刻
  - `level`: ログレベル（DEBUG/INFO/WARNING/ERROR/CRITICAL）
  - `logger`: ロガー名（モジュール名）
  - `message`: ログメッセージ
  - `function`: 関数名
  - `line`: 行番号
  - `extra`: 追加情報（任意）

### 2. 機密情報マスキング
**自動マスキング対象**:
- パスワード (`password`, `passwd`, `pwd`)
- トークン (`token`, `access_token`, `refresh_token`, `jwt`)
- APIキー (`api_key`, `apikey`, `secret`)
- 認証情報 (`authorization`, `auth`)
- その他機密情報 (`private_key`, `session_id`, `credit_card`等)

**パターンマッチング**:
- JWT トークン形式: `eyJ...`
- Bearer トークン: `Bearer ...`
- 32文字以上の英数字文字列

### 3. ログローテーション
- **最大ファイルサイズ**: 10MB
- **保持世代数**: 5世代
- **自動ローテーション**: サイズ超過時に自動実行

### 4. ログ出力先
- **コンソール**: 標準出力（開発・本番共通）
- **app.log**: 全レベルのアプリケーションログ
- **error.log**: ERRORレベル以上のエラーログ
- **security.log**: セキュリティイベント専用ログ

### 5. リクエストトレーシング
- **リクエストID自動生成**: 各HTTPリクエストに一意のUUID割り当て
- **自動ログ記録**: リクエスト開始・完了・エラー発生を自動記録
- **パフォーマンス測定**: レスポンスタイム（ミリ秒）を自動計測
- **コンテキスト伝播**: リクエストID・ユーザー情報を全ログに自動付与
- **HTTPヘッダー**: `X-Request-ID`ヘッダーでクライアントにも返却
- **エラートレース**: 例外発生時もリクエストIDで追跡可能

### 6. 例外ハンドリング・ログ記録（NEW!）
- **カスタム例外クラス**: 例外発生時に自動的にログ記録
- **構造化エラー情報**: エラーコード、詳細情報、スタックトレースを含む
- **グローバル例外ハンドラー**: 未処理の例外を自動キャッチしてログ記録
- **クライアント向けエラーレスポンス**: HTTPステータスコードとエラー情報を適切に返却
- **セキュリティ考慮**: 本番環境では詳細なエラー情報を隠蔽

## 使用方法

### 基本的なログ出力

```python
from infrastructure.logging.logger import LoggerFactory

# ロガーの取得
logger = LoggerFactory.get_logger(__name__)

# ログレベル別の出力
logger.debug("デバッグ情報")
logger.info("情報メッセージ")
logger.warning("警告メッセージ")
logger.error("エラーメッセージ")
logger.critical("重大なエラー")
```

### セキュリティログの記録

```python
from infrastructure.logging.logger import security_logger
from infrastructure.logging.constants import LoggingConstants

# ログイン成功
security_logger.log_security_event(
    event_type=LoggingConstants.EVENT_TYPE_LOGIN_SUCCESS,
    user_id=123,
    username="testuser",
    ip_address="192.168.1.1",
    status_code=200,
    message="User logged in successfully"
)

# ログイン失敗
security_logger.log_security_event(
    event_type=LoggingConstants.EVENT_TYPE_LOGIN_FAILURE,
    username="testuser",
    ip_address="192.168.1.1",
    status_code=401,
    message="Invalid password"
)
```

### 追加情報の記録

```python
# extra パラメータで追加情報を含める
logger.info(
    "User action completed",
    extra={
        "extra": {
            "user_id": 123,
            "action": "delete_record",
            "record_id": 456
        }
    }
)
```

### リクエストコンテキストの利用

リクエストコンテキストを使用すると、リクエストID・ユーザー情報が**自動的に**すべてのログに含まれます。

```python
from infrastructure.logging.context import RequestContext

# リクエストコンテキストにユーザー情報を設定（認証後に実行）
RequestContext.set_user_info(user_id=123, username="testuser")

# 通常通りログ出力するだけで、リクエストID・ユーザー情報が自動付与される
logger.info("User performed action")
# ログ出力例:
# {
#   "timestamp": "2025-10-14 12:34:56",
#   "level": "INFO",
#   "message": "User performed action",
#   "request_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",  # 自動付与
#   "user_id": 123,                                         # 自動付与
#   "username": "testuser"                                  # 自動付与
# }
```

### カスタム例外の使用（NEW!）

カスタム例外を使用すると、例外発生時に自動的にログが記録されます。

```python
from infrastructure.logging.exceptions import (
    NotFoundException,
    ValidationException,
    DuplicateException,
    AuthenticationException,
    AuthorizationException,
    DatabaseException,
    ExternalServiceException
)

# リソースが見つからない場合
raise NotFoundException("User", resource_id=123)

# バリデーションエラー
raise ValidationException("Invalid email format", field_name="email", invalid_value="invalid@")

# 重複エラー
raise DuplicateException("User", "username", "john_doe")

# 認証エラー
raise AuthenticationException("Invalid credentials", username="john_doe")

# 認可エラー
raise AuthorizationException("Admin permission required", user_id=123, required_permission="admin")

# データベースエラー
raise DatabaseException("Connection failed", operation="INSERT", table_name="users")

# 外部サービスエラー
raise ExternalServiceException("SMTP connection failed", "SMTP", status_code=503)
```

これらの例外は**自動的にログ記録**され、適切なHTTPステータスコードとエラーレスポンスが返却されます：

| 例外クラス | HTTPステータス | エラーコード |
|-----------|--------------|------------|
| `NotFoundException` | 404 | `NOT_FOUND` |
| `ValidationException` | 400 | `VALIDATION_ERROR` |
| `DuplicateException` | 409 | `DUPLICATE_ERROR` |
| `AuthenticationException` | 401 | `AUTHENTICATION_ERROR` |
| `AuthorizationException` | 403 | `AUTHORIZATION_ERROR` |
| `DatabaseException` | 500 | `DATABASE_ERROR` |
| `ExternalServiceException` | 502 | `EXTERNAL_SERVICE_ERROR` |

## 環境変数設定

### ログレベル設定
```bash
# デフォルト: INFO
export LOG_LEVEL=DEBUG    # 開発環境
export LOG_LEVEL=INFO     # 本番環境
export LOG_LEVEL=WARNING  # 警告のみ
```

### ログフォーマット設定
```bash
# JSON形式（本番推奨）
export LOG_FORMAT=json

# テキスト形式（開発環境推奨）
export LOG_FORMAT=text
```

### ログディレクトリ設定
```bash
# デフォルト: logs/
export LOG_DIR=/var/log/touhou_clear_checker
```

## セキュリティイベント種別

| イベント種別 | 定数名 | 説明 |
|------------|--------|------|
| ログイン成功 | `EVENT_TYPE_LOGIN_SUCCESS` | ユーザーログイン成功 |
| ログイン失敗 | `EVENT_TYPE_LOGIN_FAILURE` | ユーザーログイン失敗 |
| ログアウト | `EVENT_TYPE_LOGOUT` | ユーザーログアウト |
| トークン更新 | `EVENT_TYPE_TOKEN_REFRESH` | JWTトークン更新 |
| パスワード変更 | `EVENT_TYPE_PASSWORD_CHANGE` | パスワード変更 |
| 不正アクセス | `EVENT_TYPE_UNAUTHORIZED_ACCESS` | 認証失敗・権限不足 |
| ユーザー登録 | `EVENT_TYPE_REGISTRATION` | 新規ユーザー登録 |
| メール認証 | `EVENT_TYPE_EMAIL_VERIFICATION` | メールアドレス認証 |

## ログ出力例

### JSON形式（リクエストトレーシング有効）
```json
{
  "timestamp": "2025-10-14 12:34:56",
  "level": "INFO",
  "logger": "infrastructure.logging.middleware",
  "message": "Request completed: GET /api/v1/users/me - 200",
  "module": "middleware",
  "function": "dispatch",
  "line": 78,
  "request_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "extra": {
    "request_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "request_method": "GET",
    "request_path": "/api/v1/users/me",
    "status_code": 200,
    "response_time_ms": 42.15,
    "ip_address": "192.168.1.1"
  }
}
```

### アプリケーションログ（コンテキスト自動付与）
```json
{
  "timestamp": "2025-10-14 12:34:56",
  "level": "INFO",
  "logger": "application.services.user_service",
  "message": "User logged in successfully",
  "module": "user_service",
  "function": "authenticate_user",
  "line": 101,
  "request_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "user_id": 123,
  "username": "testuser"
}
```

### テキスト形式
```
2025-10-14 12:34:56 - application.services.user_service - INFO - authenticate_user:101 - User logged in successfully
```

## ベストプラクティス

### 1. ログレベルの使い分け
- **DEBUG**: 開発時のデバッグ情報（本番では無効化）
- **INFO**: 通常の処理フロー（ユーザーアクション、API呼び出し）
- **WARNING**: 警告（非推奨APIの使用、リトライ処理）
- **ERROR**: エラー（例外発生、処理失敗）
- **CRITICAL**: 致命的エラー（システム停止レベル）

### 2. ログメッセージの書き方
```python
# ❌ 悪い例
logger.info("Error")

# ✅ 良い例
logger.info(f"User logged in successfully: user_id={user.id}")
```

### 3. 機密情報の扱い
```python
# ❌ 悪い例（パスワードが直接ログ出力される）
logger.debug(f"User credentials: {username}, {password}")

# ✅ 良い例（パスワードをログに含めない）
logger.debug(f"Authenticating user: {username}")

# ✅ 良い例（自動マスキング）
# extraに機密情報を含めても自動的にマスキングされる
logger.info("User data", extra={"extra": {"password": "secret123"}})
# 出力: {"password": "***REDACTED***"}
```

### 4. エラーログの記録
```python
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Operation failed: {str(e)}")
    raise
except Exception as e:
    logger.critical(f"Unexpected error: {str(e)}", exc_info=True)
    raise
```

## Docker環境でのログ

### ログの確認
```bash
# 全体ログ
docker compose logs -f

# 特定サービス
docker compose logs -f backend

# ログファイルの確認（コンテナ内）
docker compose exec backend cat logs/app.log
docker compose exec backend cat logs/security.log
```

### ボリュームマウント
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./logs:/app/logs  # ホスト側にログを永続化
```

## トラブルシューティング

### ログファイルが作成されない
- **原因**: logsディレクトリの権限不足
- **解決策**: `mkdir -p logs && chmod 755 logs`

### ログが出力されない
- **原因**: ログレベルが高すぎる
- **解決策**: `LOG_LEVEL=DEBUG` に設定

### 機密情報がマスキングされない
- **原因**: キー名がSENSITIVE_KEYSに含まれていない
- **解決策**: `sanitizer.py`のSENSITIVE_KEYSリストに追加

## テスト

### 単体テスト実行
```bash
cd backend
source venv313/bin/activate
python -m pytest tests/unit/logging/ -v
```

### テスト内容
- ✅ ログフォーマット（JSON/テキスト）
- ✅ 機密情報マスキング（パスワード、トークン、APIキー）
- ✅ ログローテーション
- ✅ セキュリティログ記録
- ✅ リクエストコンテキスト管理
- ✅ リクエストトレーシングミドルウェア
- ✅ カスタム例外クラス（NEW!）
- ✅ 例外ハンドラーミドルウェア（NEW!）

### テスト結果
- **66個のテスト** ✅ 全成功（+28個追加）
- **実行時間**: 0.42秒

## リクエストトレーシングの活用例

### デバッグシナリオ1: エラーの追跡

ユーザーから「操作中にエラーが発生した」と報告を受けた場合：

1. レスポンスヘッダーから `X-Request-ID` を取得
2. ログファイルで該当リクエストIDを検索
3. リクエスト開始〜エラー発生までの全ログを確認
4. 同じリクエストID内のすべてのログを追跡

```bash
# リクエストIDでログ検索
grep "a1b2c3d4-e5f6-7890-abcd-1234567890ab" logs/app.log
```

### デバッグシナリオ2: パフォーマンス分析

遅いAPIエンドポイントを特定：

```bash
# レスポンスタイムが500ms以上のリクエストを検索
grep "response_time_ms" logs/app.log | awk '$NF > 500'
```

### デバッグシナリオ3: ユーザー行動追跡

特定ユーザーの操作ログを追跡：

```bash
# ユーザーID=123の全操作を検索
grep "\"user_id\": 123" logs/app.log
```

## エラーハンドリングのベストプラクティス（NEW!）

### 1. カスタム例外の使い分け

```python
# ❌ 悪い例（Pythonの標準例外を直接使用）
if not user:
    raise Exception("User not found")

# ✅ 良い例（カスタム例外を使用）
if not user:
    raise NotFoundException("User", resource_id=user_id)
```

### 2. 詳細情報の追加

```python
# ✅ 良い例（詳細情報を含める）
raise ValidationException(
    "Invalid email format",
    field_name="email",
    invalid_value=email
)
```

### 3. 例外のログレベル

カスタム例外は自動的に適切なログレベルで記録されます：
- `NotFoundException`, `ValidationException`, `DuplicateException`: **WARNING**レベル
- `AuthenticationException`, `AuthorizationException`: **WARNING**レベル
- `DatabaseException`, `ExternalServiceException`: **ERROR**レベル

## まとめ

このロギング基盤により、以下が実現されます：

1. **セキュリティ**: パスワード等の機密情報を自動マスキング
2. **可観測性**: 構造化ログによる問題の迅速な特定
3. **監査**: セキュリティイベントの完全な記録
4. **保守性**: ログローテーションによるディスク容量管理
5. **開発体験**: 環境別のログレベル・フォーマット切り替え
6. **リクエストトレーシング**: 一意のIDで全リクエストを追跡可能
7. **パフォーマンス監視**: レスポンスタイムの自動測定
8. **コンテキスト伝播**: ユーザー情報を全ログに自動付与
9. **例外ハンドリング**: カスタム例外による自動ログ記録（NEW!）
10. **エラーレスポンス**: 統一されたエラーレスポンス形式（NEW!）
