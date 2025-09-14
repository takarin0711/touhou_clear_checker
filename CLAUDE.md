# touhou_clear_checker

東方プロジェクトのクリア状況をチェックするツール

## Claude作業指示
- **言語**: すべてのやり取りは日本語で行う
- **コミット**: ユーザーが明示的に要求しない限りgitコミットしない
- **設計資料**: `.claude/`ディレクトリ内の設計書を参照して開発を行う

## プロジェクト概要
- 東方シリーズのゲームクリア状況を管理・追跡するWebアプリケーション
- フロントエンド：React
- バックエンド：FastAPI (Python)

## 開発環境
- フロントエンド：React 18.2.0, axios
- バックエンド：FastAPI, uvicorn, SQLAlchemy, SQLite
- パッケージマネージャー：npm (frontend), pip (backend)
- **重要**: Python 3.13でのバージョン互換性問題あり
  - FastAPI==0.95.2, pydantic==1.10.13使用
  - 必要に応じてPython 3.11以下での動作推奨

## よく使用するコマンド

### バックエンド
- 開発サーバー: `cd backend && uvicorn main:app --reload`
- 依存関係インストール: `cd backend && pip install -r requirements.txt`

### フロントエンド  
- 開発サーバー: `cd frontend && npm start`
- 依存関係インストール: `cd frontend && npm install`
- ビルド: `cd frontend && npm run build`
- テスト: `cd frontend && npm test`

## プロジェクト構造
```
touhou_clear_checker/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
├── README.md
└── CLAUDE.md
```