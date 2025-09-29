# MySQL移行ガイド

## 概要
東方クリアチェッカーのMySQL対応とSQLiteからMySQLへの移行手順を記載。

## 最新状況（2025年9月29日更新）

### adminユーザー自動作成対応完了
- **MySQL初期化スクリプト**: `initialize_database_mysql.py` でadminユーザー自動作成
- **パスワード管理**: `secrets/.admin_password` からの安全なパスワード読み込み
- **Docker対応**: secrets/ ディレクトリマウントでコンテナ内からパスワード読み込み
- **初期管理者**: ユーザー名 `admin`、管理者権限・メール認証済み状態で自動作成（パスワードはsecrets/.admin_passwordで設定）

### ゲームデータ正規化完了
- **ソート順序**: series_number順（妖精大戦争が12.8で正しい位置）
- **ゲーム種別**: main_series/spin_off_stg/versusの正確な分類
- **UI表示**: フロントエンドで「本編STG」「外伝STG」「対戦型STG」の適切なラベル表示

## MySQL対応の背景

### 実装理由
- **本番環境対応**: スケーラブルなデータベース環境の構築
- **同時接続対応**: SQLiteの同時接続制限の解消
- **データ永続性**: クラウド環境での信頼性向上
- **パフォーマンス**: 大量データ処理への対応

### 設計方針
- **SQLite互換性維持**: 開発環境ではSQLiteを継続使用
- **環境変数切り替え**: DATABASE_URLによる動的切り替え
- **Docker対応**: SQLite/MySQL環境の簡単切り替え
- **データ完全性**: 141機体データの正確な移行

## セキュリティ要件

### パスワード管理
- **secrets/.admin_password**: adminユーザーのパスワード（.gitignoreで除外済み）
- **本番環境**: 最低32文字、英数字記号混合の強固なパスワード必須
- **開発環境**: 開発用の安全なパスワードを設定（例: `AdminDev2025!SecurePass`）
- **ファイル権限**: `chmod 600` で読み取り制限

### 機密情報保護
- **パスワード**: 設計書・コミット・ログに記載禁止
- **環境変数**: `.env.mysql` ファイルは.gitignoreで除外
- **Docker Secrets**: 本番環境ではDocker SecretsまたはKubernetes Secretsを使用推奨

## 技術仕様

### 対応バージョン
- **MySQL**: 8.0
- **接続ライブラリ**: PyMySQL 1.1.1
- **SQLAlchemy**: 1.4.54（MySQL対応済み）

### 文字エンコーディング対応
```yaml
# Docker MySQL設定
command: --default-authentication-plugin=mysql_native_password 
         --character-set-server=utf8mb4 
         --collation-server=utf8mb4_unicode_ci
         --init-connect='SET NAMES utf8mb4;'
```

```python
# 接続文字列
DATABASE_URL = "mysql+pymysql://user:password@host:port/database?charset=utf8mb4"
```

### 接続設定の環境対応
```python
# backend/infrastructure/database/connection.py
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
```

## Docker環境構成

### 環境選択
1. **SQLite環境** (軽量開発用)
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.sqlite.yml --env-file .env.sqlite up --build
   ```

2. **MySQL環境** (本番環境相当)
   ```bash
   # 環境変数ファイル作成（2025年9月29日版の簡略化設定）
   cat > .env.mysql <<EOF
ENVIRONMENT=development
DATABASE_URL=mysql+pymysql://touhou_user:touhou_password@mysql:3306/touhou_clear_checker
JWT_SECRET_KEY=your-secret-key-for-jwt-tokens
EMAIL_BACKEND=console
MYSQL_DATABASE=touhou_clear_checker
MYSQL_USER=touhou_user
MYSQL_PASSWORD=touhou_password
MYSQL_ROOT_PASSWORD=root_password
EOF

   # adminユーザーパスワード設定（重要：強固なパスワードを設定）
   mkdir -p secrets
   echo "your_secure_admin_password" > secrets/.admin_password
   chmod 600 secrets/.admin_password  # ファイル権限を制限
   
   # MySQL環境起動
   docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file .env.mysql up --build
   
   # データベース初期化（adminユーザー含む）
   docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file .env.mysql exec backend python scripts/initialize_database_mysql.py --fresh
   ```

### 環境変数設定

#### 初期設定
```bash
# 環境変数ファイルのセットアップ
cp .env.mysql.example .env.mysql

# パスワードファイルの作成（セキュアなパスワードを設定）
echo "your_secure_root_password" > .mysql_root_password
echo "your_secure_user_password" > .mysql_password
chmod 600 .mysql_root_password .mysql_password
```

#### .env.mysql.example の内容
```bash
# MySQL接続情報
MYSQL_DATABASE=touhou_clear_checker
MYSQL_USER=touhou_user

# バックエンド接続用（パスワードはファイルから読み取り）
DATABASE_URL=mysql+pymysql://touhou_user:$(cat .mysql_password)@mysql:3306/touhou_clear_checker?charset=utf8mb4

# セキュリティ設定
JWT_SECRET_KEY=your_jwt_secret_key_here

# 開発環境設定
ENVIRONMENT=development
PYTHONPATH=/app
```

### MySQL設定ファイル
```yaml
# docker-compose.yml - MySQL基本設定（Docker Secrets対応）
mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql_root_password
    MYSQL_DATABASE: ${MYSQL_DATABASE:-touhou_clear_checker}
    MYSQL_USER: ${MYSQL_USER:-touhou_user}
    MYSQL_PASSWORD_FILE: /run/secrets/mysql_password
  ports:
    - "3306:3306"
  volumes:
    - mysql-data:/var/lib/mysql
  secrets:
    - mysql_root_password
    - mysql_password
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    timeout: 5s
    retries: 10
    interval: 10s

secrets:
  mysql_root_password:
    file: .mysql_root_password
  mysql_password:
    file: .mysql_password
```

```yaml
# docker-compose.mysql.yml - MySQL環境用オーバーライド
services:
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      mysql:
        condition: service_healthy
```

## データ移行

### 移行スクリプト
`backend/scripts/migrate_sqlite_to_mysql.py`

#### 実行方法
```bash
# Docker環境で実行
docker compose -f docker-compose.yml -f docker-compose.mysql.yml exec backend python scripts/migrate_sqlite_to_mysql.py

# ネイティブ環境で実行（要MySQL環境変数設定）
cd backend && source venv313/bin/activate && python scripts/migrate_sqlite_to_mysql.py
```

#### 初期化内容（2025年9月29日版）
- **ゲームデータ**: 16作品（正確なゲーム種別・リリース年設定）
- **ゲーム機体データ**: 114機体の完全データ移行（SQLiteスクリプトと同一）
- **adminユーザー**: 管理者アカウント自動作成
- **ソート順序**: series_number順での正しい表示順序
- **文字エンコーディング**: UTF-8完全対応

#### 初期化結果確認（最新版）
```bash
📡 接続先: mysql+pymysql://touhou_user:dev_password_123@mysql:3306/touhou_clear_checker?charset=utf8mb4

📚 登録済みゲーム:
   6.0: 東方紅魔郷 (4機体) - main_series
   7.0: 東方妖々夢 (6機体) - main_series
   8.0: 東方永夜抄 (12機体) - main_series  
   9.0: 東方花映塚 (16機体) - versus
  10.0: 東方風神録 (6機体) - main_series
  11.0: 東方地霊殿 (6機体) - main_series
  12.0: 東方星蓮船 (6機体) - main_series
  128.0: 妖精大戦争 (7機体) - spin_off_stg  ← 正しい位置
  13.0: 東方神霊廟 (4機体) - main_series
  ...

📊 統計情報:
  🎮 合計ゲーム数: 16作品
  👥 合計機体数: 114種類
  👑 adminユーザー: 作成済み（管理者権限・認証済み）
```

### 移行時の注意点
1. **外部キー制約**: `SET FOREIGN_KEY_CHECKS = 0` で一時無効化
2. **文字化け対策**: `--default-character-set=utf8mb4` 指定
3. **データ整合性**: 移行前後のレコード数確認
4. **特殊構造**: 妖精大戦争（7機体）等の正確な移行

## テスト・検証

### 移行後の動作確認
```bash
# API動作確認
curl -s http://localhost:8000/api/v1/games | jq '.[:3]'
curl -s http://localhost:8000/api/v1/game-characters/1/characters | jq .

# 文字化け確認
# 「東方紅魔郷」「霊夢A（霊の御札）」等が正しく表示されること
```

### 単体テスト実行
```bash
# MySQL環境でのテスト実行
docker compose -f docker-compose.yml -f docker-compose.mysql.yml exec backend python -m pytest tests/unit/ -v

# 結果: 178個のテスト全成功を確認
```

## 本番環境への移行手順

### Phase 1: 開発・ステージング環境
1. MySQL Docker環境での開発・テスト
2. CI/CDパイプラインでのMySQL対応確認
3. データ移行スクリプトの動作検証

### Phase 2: 本番環境構築
1. **Cloud MySQL設定**
   - AWS RDS、GCP Cloud SQL、Azure Database等
   - utf8mb4文字セット設定
   - 適切なインスタンスサイズ選択

2. **環境変数設定**
   ```bash
   DATABASE_URL=mysql+pymysql://username:password@hostname:3306/touhou_clear_checker?charset=utf8mb4
   ```

3. **セキュリティ設定**
   - SSL/TLS接続の有効化
   - IP制限・VPC内接続
   - 定期的なバックアップ設定

### Phase 3: データ移行・切り替え
1. **Blue-Green Deployment**
   - 新環境（MySQL）の事前構築
   - データ移行とテスト
   - 段階的なトラフィック切り替え

2. **ロールバック計画**
   - SQLite環境への復旧手順
   - データベースダンプの定期取得
   - 緊急時対応プロセス

## トラブルシューティング

### 文字化け問題
```sql
-- 文字セット確認
SHOW VARIABLES LIKE 'char%';

-- 期待される結果（全てutf8mb4）
character_set_client     | utf8mb4
character_set_connection | utf8mb4  
character_set_database   | utf8mb4
character_set_results    | utf8mb4
character_set_server     | utf8mb4
```

### 接続エラー
1. **MySQL起動確認**: `docker compose logs mysql`
2. **ヘルスチェック確認**: mysqladminコマンドの成功確認
3. **ネットワーク確認**: `docker network ls`、ポート3306の競合確認

### データ不整合
1. **レコード数確認**: 移行前後のテーブル別レコード数比較
2. **外部キー確認**: 参照整合性の検証
3. **文字データ確認**: 日本語文字の正確性検証

## メンテナンス

### 定期バックアップ
```bash
# MySQLダンプ作成（パスワードファイルを使用）
MYSQL_PASSWORD=$(cat .mysql_password)
docker compose exec mysql mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup_$(date +%Y%m%d).sql

# SQLiteバックアップ
cp backend/touhou_clear_checker.db backup/touhou_clear_checker_$(date +%Y%m%d).db
```

### モニタリング
- データベース接続数の監視
- クエリパフォーマンスの監視  
- ディスク使用量の監視
- エラーログの定期確認

## 今後の拡張計画

### 機能拡張
- **読み書き分離**: マスター・スレーブ構成
- **接続プール**: SQLAlchemyプールサイズ最適化
- **クエリ最適化**: インデックス追加・クエリチューニング
- **キャッシュ層**: Redis等の導入検討

### 運用改善
- **自動バックアップ**: cron・クラウドサービス連携
- **監視強化**: Prometheus・Grafana等
- **ログ分析**: アクセスパターン・パフォーマンス分析
- **容量計画**: データ増加に応じたスケーリング

## まとめ

MySQL対応により、以下の価値を実現：

1. **開発効率向上**: SQLite→MySQLの柔軟な環境切り替え
2. **本番環境対応**: スケーラブルなデータベース基盤
3. **データ品質保証**: 141機体データの完全移行
4. **運用性向上**: Docker環境での統一的な管理

この移行により、東方クリアチェッカーの本番環境展開への道筋が確立されました。