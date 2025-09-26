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
```bash
# 全体起動
docker compose up --build

# アクセス
# フロントエンド: http://localhost:3000
# バックエンド: http://localhost:8000
```

## 📦 技術スタック
- **フロントエンド**: React 18.2.0 + TypeScript 5.9.2
- **バックエンド**: FastAPI 0.117.1 + Python 3.13
- **データベース**: SQLite3
- **コンテナ**: Docker + Docker Compose

## 📚 詳細ドキュメント
詳細な開発手順、アーキテクチャ、運用方法については [CLAUDE.md](./CLAUDE.md) を参照してください。
