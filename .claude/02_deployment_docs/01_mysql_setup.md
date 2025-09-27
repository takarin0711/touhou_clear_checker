# MySQL環境セットアップガイド

## 概要
このプロジェクトは、SQLiteとMySQLの両方をサポートしています。
開発環境ではSQLite、本番環境ではMySQLの使用を想定しています。

## Docker環境での使用方法

### 1. SQLite環境（デフォルト）
```bash
# 通常の起動（SQLiteを使用）
docker compose up --build

# バックグラウンド起動
docker compose up -d --build
```

### 2. MySQL環境
```bash
# MySQL環境での起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml up --build

# バックグラウンド起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml up -d --build
```

### 3. MySQL初期化のみ実行
```bash
# MySQL初期化サービスのみ実行
docker compose --profile mysql run --rm mysql-init
```

## 環境切り替え

### SQLite → MySQLへの切り替え
1. 現在のDocker環境を停止
   ```bash
   docker compose down
   ```

2. MySQL環境で起動
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.mysql.yml up --build
   ```

### MySQL → SQLiteへの切り替え
1. MySQL環境を停止
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.mysql.yml down
   ```

2. SQLite環境で起動
   ```bash
   docker compose up --build
   ```

## データベース設定

### SQLite設定
- ファイル: `backend/touhou_clear_checker.db`
- 永続化: ホストファイルシステムにマウント
- 接続文字列: `sqlite:///./touhou_clear_checker.db`

### MySQL設定
- ホスト: `mysql`（Docker内）/ `localhost:3306`（ホストから）
- データベース: `touhou_clear_checker`
- ユーザー: `touhou_user`
- パスワード: `touhou_password`
- 接続文字列: `mysql+pymysql://touhou_user:touhou_password@mysql:3306/touhou_clear_checker`

## トラブルシューティング

### MySQLが起動しない
- ポート3306が既に使用されていないか確認
- MySQLの健康チェックが成功するまで待機

### データが見つからない
- 初期化が正常に完了したか確認
- ログを確認: `docker compose logs mysql-init`

### 接続エラー
- MySQL接続情報が正しいか確認
- ネットワーク設定を確認: `docker network ls`

## データマイグレーション

### SQLite → MySQL
```bash
# 1. 現在のSQLiteデータのバックアップ
cp backend/touhou_clear_checker.db backup/

# 2. MySQL環境でデータベース初期化
docker compose -f docker-compose.yml -f docker-compose.mysql.yml run --rm mysql-init

# 3. 必要に応じてデータ移行スクリプトを実行
```

### MySQL → SQLite
```bash
# 1. SQLite環境でデータベース初期化
docker compose run --rm db-init

# 2. 必要に応じてデータ移行スクリプトを実行
```

## 注意事項

1. **開発環境**: SQLiteの使用を推奨（軽量・高速）
2. **本番環境**: MySQLの使用を推奨（スケーラビリティ・パフォーマンス）
3. **データ永続化**: 各環境のボリュームは独立して管理される
4. **同時実行**: SQLiteとMySQLを同時に実行可能（異なるポート）