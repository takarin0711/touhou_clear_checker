# 環境変数リファレンス

## 概要
このドキュメントは、touhou_clear_checkerプロジェクトで使用する環境変数の完全なリストです。

## ファイル構成
- **env/.env.mysql** - MySQL環境設定（開発・本番共通）
- **secrets/.mysql_root_password** - MySQLルートパスワード（機密）
- **secrets/.mysql_password** - MySQLユーザーパスワード（機密）
- **secrets/.admin_password** - adminユーザーパスワード（機密）

## バックエンド環境変数

### データベース設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `DATABASE_URL` | ✅ | なし | MySQL接続文字列 | `mysql+pymysql://user:pass@host:3306/db?charset=utf8mb4` |
| `MYSQL_DATABASE` | ✅ | `touhou_clear_checker` | データベース名 | `touhou_clear_checker` |
| `MYSQL_USER` | ✅ | `touhou_user` | MySQLユーザー名 | `touhou_user` |
| `MYSQL_PASSWORD` | ✅ | なし | MySQLユーザーパスワード | `$(cat secrets/.mysql_password)` |
| `MYSQL_ROOT_PASSWORD` | ✅ | なし | MySQLルートパスワード | `$(cat secrets/.mysql_root_password)` |
| `MYSQL_HOST` | ✅ | `mysql` | MySQLホスト | `mysql`（Docker）/ `localhost`（ネイティブ） |
| `MYSQL_PORT` | - | `3306` | MySQLポート | `3306` |

### セキュリティ設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `JWT_SECRET_KEY` | ✅ | なし | JWT署名用秘密鍵（48文字以上推奨） | `$(openssl rand -base64 48)` |
| `JWT_ALGORITHM` | - | `HS256` | JWT署名アルゴリズム | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | - | `30` | アクセストークン有効期限（分） | `30` |
| `VERIFICATION_TOKEN_EXPIRE_HOURS` | - | `24` | メール認証トークン有効期限（時間） | `24` |

### ネットワーク・HTTPS設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `SSL_ENABLED` | - | `false` | HTTPS有効化フラグ | `true` / `false` |
| `SSL_CERT_PATH` | - | `../certs/localhost+2.pem` | SSL証明書のパス | `../certs/localhost+2.pem` |
| `SSL_KEY_PATH` | - | `../certs/localhost+2-key.pem` | SSL秘密鍵のパス | `../certs/localhost+2-key.pem` |
| `ALLOWED_ORIGINS` | - | localhost系 | CORS許可オリジン | カンマ区切りリスト |

### メール設定（SMTP）
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `SMTP_SERVER` | ✅ | なし | SMTPサーバーホスト | `smtp.gmail.com` |
| `SMTP_PORT` | - | `587` | SMTPポート | `587`（STARTTLS）/ `465`（SSL） |
| `SMTP_USERNAME` | ✅ | なし | SMTP認証ユーザー名 | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ✅ | なし | SMTP認証パスワード | `app-specific-password` |
| `SMTP_FROM_EMAIL` | ✅ | なし | 送信元メールアドレス | `noreply@touhou-clear-checker.com` |
| `SMTP_FROM_NAME` | - | `Touhou Clear Checker` | 送信元表示名 | `Touhou Clear Checker` |

### ロギング設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `LOG_LEVEL` | - | `INFO` | ログレベル | `DEBUG` / `INFO` / `WARNING` / `ERROR` / `CRITICAL` |
| `ENVIRONMENT` | - | `development` | 実行環境 | `development` / `production` |

## フロントエンド環境変数

### API設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `REACT_APP_API_BASE_URL` | - | `http://localhost:8000` | バックエンドAPI URL | `https://localhost:8000`（HTTPSモード） |

### HTTPS設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `HTTPS` | - | `false` | HTTPS有効化フラグ | `true` / `false` |
| `SSL_CRT_FILE` | - | `../certs/localhost+2.pem` | SSL証明書のパス | `../certs/localhost+2.pem` |
| `SSL_KEY_FILE` | - | `../certs/localhost+2-key.pem` | SSL秘密鍵のパス | `../certs/localhost+2-key.pem` |

### ロギング設定
| 変数名 | 必須 | デフォルト値 | 説明 | 例 |
|--------|------|-------------|------|-----|
| `REACT_APP_LOG_LEVEL` | - | `INFO` | フロントエンドログレベル | `DEBUG` / `INFO` / `WARN` / `ERROR` / `OFF` |

## Docker環境変数（docker-compose.mysql.yml）

### MySQL コンテナ
| 変数名 | 必須 | 説明 | 設定方法 |
|--------|------|------|---------|
| `MYSQL_ROOT_PASSWORD` | ✅ | MySQLルートパスワード | `secrets/.mysql_root_password`から読み込み |
| `MYSQL_DATABASE` | ✅ | 初期作成データベース名 | `env/.env.mysql`から読み込み |
| `MYSQL_USER` | ✅ | 初期作成ユーザー名 | `env/.env.mysql`から読み込み |
| `MYSQL_PASSWORD` | ✅ | 初期作成ユーザーパスワード | `secrets/.mysql_password`から読み込み |

### バックエンド コンテナ
| 変数名 | 必須 | 説明 | 設定方法 |
|--------|------|------|---------|
| `DATABASE_URL` | ✅ | MySQL接続文字列 | `env/.env.mysql`から読み込み |
| `JWT_SECRET_KEY` | ✅ | JWT秘密鍵 | `env/.env.mysql`から読み込み |
| `LOG_LEVEL` | - | ログレベル | `env/.env.mysql`から読み込み |
| `ENVIRONMENT` | - | 実行環境 | `development`（固定） |

### フロントエンド コンテナ
| 変数名 | 必須 | 説明 | 設定方法 |
|--------|------|------|---------|
| `REACT_APP_API_BASE_URL` | - | バックエンドAPI URL | `http://backend:8000`（Docker内通信） |
| `CHOKIDAR_USEPOLLING` | - | ファイル監視ポーリング | `true`（Docker環境では必須） |

## 環境別設定例

### 開発環境（Docker）
```bash
# env/.env.mysql
DATABASE_URL=mysql+pymysql://touhou_user:$(cat secrets/.mysql_password)@mysql:3306/touhou_clear_checker?charset=utf8mb4
JWT_SECRET_KEY=$(openssl rand -base64 48)
LOG_LEVEL=DEBUG
ENVIRONMENT=development

# メール設定（オプション）
SMTP_SERVER=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
```

### 開発環境（ネイティブ）
```bash
# backend/.env または env/.env.mysql
DATABASE_URL=mysql+pymysql://touhou_user:your_password@localhost:3306/touhou_clear_checker?charset=utf8mb4
JWT_SECRET_KEY=your-secure-secret-key-min-48-characters-long
LOG_LEVEL=DEBUG
ENVIRONMENT=development
```

### 本番環境
```bash
# 環境変数（AWS Secrets Manager / Azure Key Vault等で管理）
DATABASE_URL=mysql+pymysql://prod_user:strong_password@prod-db-host:3306/touhou_clear_checker?charset=utf8mb4
JWT_SECRET_KEY=$(openssl rand -base64 64)
LOG_LEVEL=INFO
ENVIRONMENT=production

# HTTPS有効化
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/fullchain.pem
SSL_KEY_PATH=/path/to/privkey.pem

# SMTP設定（必須）
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@your-domain.com
SMTP_PASSWORD=app-specific-password
SMTP_FROM_EMAIL=noreply@your-domain.com
SMTP_FROM_NAME=Touhou Clear Checker
```

## セキュリティのベストプラクティス

### 1. パスワード・秘密鍵の生成
```bash
# 強力なランダムパスワード生成
openssl rand -base64 32 > secrets/.mysql_root_password
openssl rand -base64 24 > secrets/.mysql_password

# JWT秘密鍵生成（48文字以上推奨）
echo "JWT_SECRET_KEY=$(openssl rand -base64 48)" >> env/.env.mysql

# adminユーザーパスワード
openssl rand -base64 16 > secrets/.admin_password
```

### 2. ファイル権限設定
```bash
# 秘密情報ファイルの権限を厳格化（所有者のみ読み書き可能）
chmod 600 secrets/.mysql_root_password
chmod 600 secrets/.mysql_password
chmod 600 secrets/.admin_password
chmod 600 env/.env.mysql
```

### 3. 本番環境での注意事項
- **.gitignore確認**: `secrets/`, `env/.env.*`が除外されていることを確認
- **環境変数管理サービス**: AWS Secrets Manager, Azure Key Vault等を使用
- **定期的なローテーション**: パスワード・秘密鍵を3〜6ヶ月ごとに更新
- **最小権限の原則**: データベースユーザーは必要最小限の権限のみ付与
- **監査ログ**: 秘密情報へのアクセスログを記録・監視

## トラブルシューティング

### 環境変数が読み込まれない
```bash
# Docker環境: .envファイルの場所確認
docker compose config

# ネイティブ環境: 環境変数の確認
echo $DATABASE_URL
echo $JWT_SECRET_KEY
```

### MySQL接続エラー
```bash
# 接続文字列の確認
echo $DATABASE_URL

# MySQL接続テスト
docker compose exec mysql mysql -u touhou_user -p touhou_clear_checker -e "SELECT 1;"
```

### JWT認証エラー
```bash
# JWT秘密鍵の確認（48文字以上であること）
echo $JWT_SECRET_KEY | wc -c

# 秘密鍵が短い場合は再生成
echo "JWT_SECRET_KEY=$(openssl rand -base64 48)" >> env/.env.mysql
```

## 参考資料
- [Docker Compose環境変数](https://docs.docker.com/compose/environment-variables/)
- [FastAPI設定管理](https://fastapi.tiangolo.com/advanced/settings/)
- [Create React App環境変数](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [MySQL環境変数](https://dev.mysql.com/doc/refman/8.0/en/environment-variables.html)
