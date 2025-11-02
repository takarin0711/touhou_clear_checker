# touhou_clear_checker

東方プロジェクトのクリア状況をチェックするWebアプリケーション

## 🛠️ 開発環境

### ネイティブ環境
```bash
# バックエンド
cd backend && source venv313/bin/activate && python main.py

# フロントエンド
cd frontend && npm start
```

### Docker環境（推奨）

#### 初期設定
```bash
# 環境変数ファイルのセットアップ（初回のみ）
cp env/.env.mysql.example env/.env.mysql

# パスワードファイルの作成
echo "your_secure_root_password" > secrets/.mysql_root_password
echo "your_secure_user_password" > secrets/.mysql_password
chmod 600 secrets/.mysql_root_password secrets/.mysql_password
```

#### 起動
```bash
# Docker環境で起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql up --build
```

#### アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8000
- **MySQL**: localhost:3306 (接続情報は`env/.env.mysql`で設定)

## 📦 技術スタック
- **フロントエンド**: React 18.2.0 + TypeScript 5.9.2
- **バックエンド**: FastAPI 0.117.1 + Python 3.13
- **データベース**: MySQL 8.0
- **コンテナ**: Docker + Docker Compose

## 🗄️ データベース管理

### データベース初期化
```bash
# 完全初期化（既存データ削除 → テーブル作成 → データ投入）
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --fresh

# adminユーザーのみ作成
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --admin-only

# データベース状態確認
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --verify
```

## 📚 詳細ドキュメント

### 開発・運用ガイド
- **開発手順**: [CLAUDE.md](./CLAUDE.md)
- **MySQL環境設定**: [.claude/02_deployment_docs/01_mysql_setup.md](./.claude/02_deployment_docs/01_mysql_setup.md)
- **セキュリティ設定**: [.claude/02_deployment_docs/02_security_setup.md](./.claude/02_deployment_docs/02_security_setup.md)

### 設計・アーキテクチャ
- **システム設計**: [.claude/01_development_docs/01_architecture_design.md](./.claude/01_development_docs/01_architecture_design.md)
- **データベース設計**: [.claude/01_development_docs/02_database_design.md](./.claude/01_development_docs/02_database_design.md)
