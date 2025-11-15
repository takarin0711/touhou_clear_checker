# MySQL環境セットアップガイド

## 概要
このプロジェクトは、データベースとしてMySQL 8.0を使用しています。
開発環境・本番環境の両方でMySQLを使用します。

## 前提条件
- Docker & Docker Compose インストール済み
- または、MySQL 8.0 + Python 3.13 + Node.js インストール済み

## Docker環境での使用方法

### 1. 環境変数設定
```bash
# env/.env.mysql.example をコピー
cp env/.env.mysql.example env/.env.mysql

# env/.env.mysqlを編集してパスワード等を設定
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - DATABASE_URL
```

### 2. MySQL環境起動
```bash
# フォアグラウンド起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql up --build

# バックグラウンド起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql up -d --build
```

### 3. データベース初期化
```bash
# 完全初期化（既存データ削除 → テーブル作成 → データ投入 → adminユーザー作成）
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --fresh

# データベース状態確認
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --verify

# adminユーザーのみ作成
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --admin-only
```

### 4. 停止
```bash
docker compose -f docker-compose.yml -f docker-compose.mysql.yml down
```

## ネイティブ環境での使用方法

### 1. MySQL 8.0 インストール
```bash
# macOS
brew install mysql@8.0

# MySQL起動
brew services start mysql@8.0

# rootパスワード設定
mysql_secure_installation
```

### 2. データベース作成
```bash
# MySQL接続
mysql -u root -p

# データベース・ユーザー作成
CREATE DATABASE touhou_clear_checker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'touhou_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON touhou_clear_checker.* TO 'touhou_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 環境変数設定
```bash
# backend/.env または backend/env/.env.mysql に記載
DATABASE_URL=mysql+pymysql://touhou_user:your_password@localhost:3306/touhou_clear_checker?charset=utf8mb4
```

### 4. データベース初期化
```bash
cd backend
source venv313/bin/activate

# 完全初期化
python scripts/initialize_database_mysql.py --fresh

# 状態確認
python scripts/initialize_database_mysql.py --verify
```

## データベース設定

### MySQL接続情報
- **ホスト**: `mysql`（Docker内）/ `localhost:3306`（ネイティブ環境）
- **データベース**: `touhou_clear_checker`
- **ユーザー**: `touhou_user`
- **パスワード**: `env/.env.mysql`で設定
- **文字エンコーディング**: UTF-8 (utf8mb4)
- **照合順序**: utf8mb4_unicode_ci
- **接続文字列**: `mysql+pymysql://touhou_user:password@host:3306/touhou_clear_checker?charset=utf8mb4`

### adminユーザー管理
- **初期ユーザー名**: `admin`
- **初期メールアドレス**: `admin@touhou-clear-checker.com`
- **パスワード**: `secrets/.admin_password`ファイルから読み込み（フォールバック: `admin123`）
- **権限**: 管理者権限（is_admin=True）、メール認証済み（email_verified=True）

詳細は [データベース設計書](../ 01_development_docs/02_database_design.md) を参照

## トラブルシューティング

### MySQLが起動しない
- **ポート競合**: ポート3306が既に使用されていないか確認
  ```bash
  lsof -i :3306
  ```
- **健康チェック待機**: MySQLの起動完了まで30秒程度待機
- **ログ確認**:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.mysql.yml logs mysql
  ```

### データベース接続エラー
- **環境変数確認**: `env/.env.mysql`の`DATABASE_URL`が正しいか確認
- **ユーザー権限確認**:
  ```bash
  docker compose exec mysql mysql -u root -p -e "SHOW GRANTS FOR 'touhou_user'@'%';"
  ```
- **文字エンコーディング確認**:
  ```bash
  docker compose exec mysql mysql -u root -p -e "SHOW VARIABLES LIKE 'character%';"
  ```

### 文字化け発生
- **データベース文字セット確認**:
  ```sql
  SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
  FROM information_schema.SCHEMATA
  WHERE SCHEMA_NAME = 'touhou_clear_checker';
  ```
- **再作成**（文字セットが間違っている場合）:
  ```sql
  DROP DATABASE touhou_clear_checker;
  CREATE DATABASE touhou_clear_checker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### データが見つからない
- **初期化確認**:
  ```bash
  docker compose exec backend python scripts/initialize_database_mysql.py --verify
  ```
- **テーブル確認**:
  ```bash
  docker compose exec mysql mysql -u touhou_user -p touhou_clear_checker -e "SHOW TABLES;"
  ```
- **データ確認**:
  ```bash
  docker compose exec mysql mysql -u touhou_user -p touhou_clear_checker -e "SELECT COUNT(*) FROM games;"
  ```

## セキュリティ考慮事項

### パスワード管理
- **本番環境**: 強力なパスワードを設定（20文字以上推奨）
- **secrets管理**: `secrets/.admin_password`はgitignoreで除外済み
- **環境変数**: `.env.mysql`もgitignoreで除外済み

### ネットワーク設定
- **Docker内通信**: プライベートネットワーク`touhou-network`で分離
- **外部アクセス**: localhost:3306のみ公開（開発環境）
- **本番環境**: ファイアウォールでMySQLポートを適切に制限

詳細は [セキュリティ設定](./02_security_setup.md) を参照

## 参考資料
- [MySQL 8.0 公式ドキュメント](https://dev.mysql.com/doc/refman/8.0/en/)
- [SQLAlchemy MySQL方言](https://docs.sqlalchemy.org/en/14/dialects/mysql.html)
- [PyMySQL ドキュメント](https://pymysql.readthedocs.io/)
