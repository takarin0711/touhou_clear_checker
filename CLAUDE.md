# touhou_clear_checker

東方プロジェクトのクリア状況をチェックするツール

## Claude作業指示
- **言語**: すべてのやり取りは日本語で行う
- **コミット**: ユーザーが明示的に要求しない限りgitコミットしない
- **設計資料**: `.claude/`ディレクトリ内の設計書を参照して開発を行う
- **設計原則**: `.claude/01_development_docs/05_design_principles.md`の設計方針を遵守する
- **DRY原則**: 同じコードの重複を避ける
- **SOLID原則**: 単一責任、開放閉鎖、リスコフ置換、インターフェース分離、依存性逆転の各原則に従う
- **依存性注入**: インターフェースに依存し、具象クラスに依存しない
- **マジックナンバー禁止**: ハードコーディングされた数値は定数化する
- **音の通知**: 
  - ユーザーに確認する際: `.claude/claude_confirm.sh`を実行して音を鳴らす
  - 作業完了時: `.claude/claude_done.sh`を実行して音を鳴らす

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
- 開発サーバー: `cd backend && source venv39/bin/activate && python main.py`
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