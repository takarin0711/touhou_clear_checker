# アーキテクチャ設計

## システム構成
```
[フロントエンド: React] <--HTTP--> [バックエンド: FastAPI] <---> [データベース: SQLite]
```

## 技術スタック
- **フロントエンド**: React 18.2.0, axios, CSS
- **バックエンド**: FastAPI, uvicorn, SQLAlchemy, Pydantic
- **データベース**: SQLite（開発）→ PostgreSQL（本番想定）
- **デプロイ**: 未定

## ディレクトリ構成
```
touhou_clear_checker/
├── backend/
│   ├── main.py              # FastAPIアプリのエントリーポイント
│   ├── models/              # データベースモデル
│   ├── schemas/             # Pydanticスキーマ
│   ├── routers/             # APIルーター
│   ├── database.py          # DB接続設定
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # 再利用可能コンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── services/        # API通信
│   │   └── utils/           # ユーティリティ
│   └── package.json
└── .claude/                 # Claude用ドキュメント
```

## APIエンドポイント設計
- GET /api/games - ゲーム一覧取得
- GET /api/clear-status - クリア状況取得
- POST /api/clear-status - クリア記録追加
- PUT /api/clear-status/{id} - クリア記録更新
- DELETE /api/clear-status/{id} - クリア記録削除