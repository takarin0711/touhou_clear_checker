# MySQL移行ガイド

## 概要
東方クリアチェッカーのMySQL対応とSQLiteからMySQLへの移行手順を記載。

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
   # 初回は環境変数設定が必要
   cp .env.mysql.example .env.mysql
   # .env.mysql を編集してパスワード設定
   
   docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file .env.mysql up --build
   ```

### 環境変数設定

#### 初期設定
```bash
# 環境変数ファイルのセットアップ
cp .env.mysql.example .env.mysql
# .env.mysql を編集してセキュアなパスワードを設定
```

#### .env.mysql.example の内容
```bash
# MySQL接続情報
MYSQL_ROOT_PASSWORD=your_secure_root_password_here
MYSQL_DATABASE=touhou_clear_checker
MYSQL_USER=touhou_user
MYSQL_PASSWORD=your_secure_password_here

# バックエンド接続用
DATABASE_URL=mysql+pymysql://touhou_user:your_secure_password_here@mysql:3306/touhou_clear_checker?charset=utf8mb4
```

### MySQL設定ファイル
```yaml
# docker-compose.yml - MySQL基本設定（環境変数対応）
mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    MYSQL_DATABASE: ${MYSQL_DATABASE:-touhou_clear_checker}
    MYSQL_USER: ${MYSQL_USER:-touhou_user}
    MYSQL_PASSWORD: ${MYSQL_PASSWORD}
  ports:
    - "3306:3306"
  volumes:
    - mysql-data:/var/lib/mysql
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    timeout: 5s
    retries: 10
    interval: 10s
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

#### 移行内容
- **ゲームデータ**: 16作品の完全移行
- **ゲーム機体データ**: 141機体の詳細データ移行
- **外部キー制約**: 安全な削除・投入順序
- **文字エンコーディング**: UTF-8対応

#### 移行結果確認
```python
📊 移行結果:
  🎮 ゲーム数: 16作品
  👥 機体数: 141種類

📚 サンプル（最初の5作品）:
    1: 東方紅魔郷 (4機体)
    2: 東方妖々夢 (6機体)
    3: 東方永夜抄 (12機体)
    4: 東方花映塚 (16機体)
    5: 東方風神録 (6機体)
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
# MySQLダンプ作成
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