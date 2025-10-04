# 定数管理ガイドライン

## 概要
このドキュメントは、touhou_clear_checkerプロジェクトにおける定数管理の詳細ガイドラインです。マジックナンバーの排除と保守性向上のため、開発時はこのガイドに従ってください。

## 定数ファイル構成

### バックエンド定数ファイル

#### 1. セキュリティ関連定数
**ファイル**: `backend/infrastructure/security/constants.py`
**用途**: JWT、認証トークン、パスワードハッシュ、SMTP設定

```python
class SecurityConstants:
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
```

#### 2. バリデーション関連定数
**ファイル**: `backend/domain/constants/validation_constants.py`
**用途**: 入力値検証、データベース制約値

```python
class ValidationConstants:
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
```

#### 3. ネットワーク設定定数
**ファイル**: `backend/infrastructure/config/network_constants.py`
**用途**: サーバー設定、CORS設定

```python
class NetworkConstants:
    # サーバー設定
    DEFAULT_HOST = "0.0.0.0"
    DEFAULT_PORT = 8000
    
    # CORS設定
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000"
    ]
    
    ALLOWED_METHODS = [
        "GET", "POST", "PUT", "DELETE", "OPTIONS"
    ]
    
    ALLOWED_HEADERS = ["*"]
    ALLOW_CREDENTIALS = True
```

#### 4. ゲーム関連定数（既存）
**ファイル**: `backend/domain/constants/game_constants.py`
**用途**: ゲームID、機体範囲、機体数

### フロントエンド定数ファイル

#### 1. バリデーション定数
**ファイル**: `frontend/src/constants/validation.ts`
**用途**: フォームバリデーション、HTTP状態管理

```typescript
export const VALIDATION_CONSTANTS = {
  // ユーザー名バリデーション
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  
  // パスワードバリデーション
  PASSWORD_MIN_LENGTH: 6,
  
  // HTTPステータスコード
  HTTP_NOT_FOUND: 404,
  
  // ゲーム機体バリデーション
  CHARACTER_NAME_MIN_LENGTH: 1,
  CHARACTER_NAME_MAX_LENGTH: 100,
  CHARACTER_DESCRIPTION_MAX_LENGTH: 500,
} as const;
```

## 定数追加・修正手順

### 新しい定数を追加する場合

#### 1. 適切なファイルの選択
- **セキュリティ関連**: `security/constants.py`
- **バリデーション関連**: `validation_constants.py`
- **ネットワーク関連**: `network_constants.py`
- **ゲーム関連**: `game_constants.py`
- **その他**: 新しいカテゴリの場合は新規ファイル作成

#### 2. 定数の追加
```python
# 悪い例
TIMEOUT = 5000

# 良い例
class ApiConstants:
    REQUEST_TIMEOUT_MS = 5000
    MAX_RETRY_COUNT = 3
```

#### 3. 既存コードの修正
```python
# 既存のマジックナンバーを置き換える
# 修正前
timeout = 5000

# 修正後
from infrastructure.config.api_constants import ApiConstants
timeout = ApiConstants.REQUEST_TIMEOUT_MS
```

#### 4. テストの実行
```bash
# バックエンド
cd backend && python -m pytest tests/unit/ -v

# フロントエンド
cd frontend && npm test
```

### 既存の定数を修正する場合

#### 1. 影響範囲の確認
```bash
# 定数使用箇所を検索
grep -r "CONSTANT_NAME" backend/
grep -r "CONSTANT_NAME" frontend/
```

#### 2. 定数値の変更
```python
# 定数ファイルで値を変更
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 30から60に変更
```

#### 3. 関連テストの確認・修正
```python
# テストでも定数を使用していることを確認
def test_token_expiry():
    # テスト内でもマジックナンバーではなく定数を使用
    expected_expiry = SecurityConstants.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    assert token_expiry_minutes == expected_expiry
```

## 命名規則

### 定数名
- **UPPER_SNAKE_CASE**を使用
- 意味が明確になるよう具体的な名前を使用
- 単位も含める（`_MS`、`_HOURS`等）

```python
# 良い例
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
ARGON2_MEMORY_COST_BYTES = 65536
USERNAME_MIN_LENGTH = 3

# 悪い例
TIMEOUT = 30
MEMORY = 65536
MIN_LEN = 3
```

### クラス名
- **PascalCase**を使用
- `Constants`で終わる

```python
# 良い例
class SecurityConstants:
class ValidationConstants:
class NetworkConstants:

# 悪い例
class security_config:
class VALIDATION_SETTINGS:
```

### ファイル名
- **snake_case**を使用
- `_constants.py`で終わる

```
# 良い例
security_constants.py
validation_constants.py
network_constants.py

# 悪い例
SecurityConstants.py
validation-constants.py
constants.py  # 汎用的すぎる
```

## ベストプラクティス

### 1. カテゴリ別に分類
関連する定数を同じクラス・ファイルにまとめる

```python
# 良い例 - カテゴリ別にクラス分け
class SecurityConstants:
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
    ARGON2_MEMORY_COST = 65536

class ValidationConstants:
    USERNAME_MIN_LENGTH = 3
    PASSWORD_MIN_LENGTH = 6

# 悪い例 - 無秩序に配置
JWT_EXPIRE = 30
USERNAME_MIN = 3
ARGON2_MEMORY = 65536
PASSWORD_MIN = 6
```

### 2. ドキュメント化
重要な定数にはコメントを追加

```python
class SecurityConstants:
    ARGON2_MEMORY_COST = 65536    # 64MB メモリ使用
    ARGON2_TIME_COST = 3          # 3回反復
    ARGON2_PARALLELISM = 1        # 1並列処理
```

### 3. 型安全性（TypeScript）
```typescript
// as constで型安全性を確保
export const VALIDATION_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
} as const;

// 型定義も提供
export type ValidationConstants = typeof VALIDATION_CONSTANTS;
```

### 4. 環境別設定との使い分け
```python
# 環境変数が優先、フォールバックで定数使用
smtp_port = int(os.getenv("SMTP_PORT", str(SecurityConstants.SMTP_DEFAULT_PORT)))
secret_key = os.getenv("JWT_SECRET_KEY", SecurityConstants.JWT_SECRET_KEY)
```

## 避けるべきパターン

### ❌ 悪い例
```python
# 1. マジックナンバーの直接使用
if len(password) < 6:
    raise ValueError("パスワードが短すぎます")

# 2. 定数の重複定義
MIN_PASSWORD_LENGTH = 6  # ファイルA
PASSWORD_MIN_LEN = 6     # ファイルB

# 3. 意味不明な定数名
CONST_1 = 30
MAGIC_NUMBER = 65536

# 4. 単一ファイルにすべての定数
# すべての定数をconstants.pyに詰め込む
```

### ✅ 良い例
```python
# 1. 定数を使用
from domain.constants.validation_constants import ValidationConstants
if len(password) < ValidationConstants.PASSWORD_MIN_LENGTH:
    raise ValueError("パスワードが短すぎます")

# 2. 一意で意味のある定数名
PASSWORD_MIN_LENGTH = 6

# 3. 明確で説明的な定数名
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
ARGON2_MEMORY_COST_BYTES = 65536

# 4. カテゴリ別にファイル分割
# security_constants.py - セキュリティ関連
# validation_constants.py - バリデーション関連
```

## まとめ

定数管理は、コードの保守性と可読性を大幅に向上させる重要な実践です。新しいコードを書く際は：

1. **マジックナンバーを使わない**
2. **適切なカテゴリに分類**
3. **意味のある名前を付ける**
4. **一箇所で管理**

これらの原則に従うことで、将来の変更に対してより柔軟で保守しやすいコードベースを維持できます。