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
- **テスト運用規則**:
  - 新規APIを作成した時には単体テストも作成すること
  - APIを修正した時には単体テストを実行して修正が必要がないか確認し、必要であれば修正すること
  - APIを削除したら不要な単体テストも削除すること

## プロジェクト概要
- 東方シリーズのゲームクリア状況を管理・追跡するWebアプリケーション
- フロントエンド：React + TypeScript
- バックエンド：FastAPI (Python)

## 開発環境
- フロントエンド：React 18.2.0, TypeScript 5.9.2, axios
- バックエンド：FastAPI 0.117.1, uvicorn, SQLAlchemy, SQLite
- パッケージマネージャー：npm (frontend), pip (backend)
- **Python 3.13対応済み**: FastAPI 0.117.1, Pydantic 2.11.9で互換性問題解決
- **TypeScript化完了**: 2025年1月にフロントエンドを完全TypeScript化、型安全性と保守性が向上

## よく使用するコマンド

### バックエンド
- 開発サーバー: `cd backend && source venv313/bin/activate && python main.py &`
- 依存関係インストール: `cd backend && source venv313/bin/activate && pip install -r requirements.txt`
- テスト用依存関係: `cd backend && source venv313/bin/activate && pip install -r requirements-dev.txt`
- 単体テスト実行: `cd backend && source venv313/bin/activate && python -m pytest tests/unit/ -v`
- 全テスト実行: `cd backend && source venv313/bin/activate && python -m pytest -v`
- **旧環境**: `source venv39/bin/activate` (Python 3.9、非推奨)

### フロントエンド (TypeScript + React)
- 開発サーバー: `cd frontend && npm start`
- 依存関係インストール: `cd frontend && npm install`
- ビルド: `cd frontend && npm run build`
- 単体テスト実行: `cd frontend && npm test`
- 特定テスト実行: `cd frontend && npm test -- --testPathPattern="Button.test" --watchAll=false`
- 型チェック: `cd frontend && npx tsc --noEmit`
- **注意**: ブラウザキャッシュが原因でエラーが出る場合は、ハードリフレッシュ（Cmd+Shift+R）またはシークレットモードでアクセス

## プロジェクト構造
```
touhou_clear_checker/
├── backend/
│   ├── application/         # アプリケーション層
│   │   ├── dtos/           # データ転送オブジェクト
│   │   └── services/       # ビジネスロジック
│   ├── domain/             # ドメイン層
│   │   ├── entities/       # エンティティ
│   │   ├── repositories/   # リポジトリインターフェース
│   │   └── value_objects/  # 値オブジェクト
│   ├── infrastructure/     # インフラ層
│   │   ├── database/       # データベース
│   │   └── security/       # セキュリティ
│   ├── presentation/       # プレゼンテーション層
│   │   ├── api/v1/        # APIエンドポイント
│   │   └── schemas/        # リクエスト/レスポンススキーマ
│   ├── tests/              # テスト
│   │   ├── unit/          # 単体テスト（実装済み）
│   │   └── integration/    # 統合テスト（未実装）
│   ├── main.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── pytest.ini
├── frontend/                 # TypeScript + React フロントエンド
│   ├── src/
│   │   ├── components/     # 共通コンポーネント（.tsx）
│   │   ├── features/       # 機能別コンポーネント（.tsx）
│   │   ├── hooks/          # カスタムフック（.ts）
│   │   ├── services/       # API通信サービス（.ts）
│   │   ├── types/          # TypeScript型定義（.ts）
│   │   └── contexts/       # React Context（.tsx）
│   ├── package.json
│   └── tsconfig.json       # TypeScript設定
├── .claude/                # 設計書・開発ドキュメント
├── README.md
└── CLAUDE.md
```

## テスト構成
### バックエンド単体テスト（実装済み）
- **計37個のテスト**が正常動作
- **サービスレイヤー**: 26テスト（ゲーム・ユーザー管理のビジネスロジック）
- **リポジトリレイヤー**: 11テスト（データアクセスの基本操作）
- **技術スタック**: pytest + pytest-mock
- **特徴**: 完全モック化により外部依存なし、高速実行（0.08秒）

### フロントエンド単体テスト（実装済み）
- **計13個のテストファイル**、**100+個のテスト**が正常動作
- **共通コンポーネント**: Button、Input、Badge（UI操作・スタイリング）
- **ゲーム機能**: GameCard、gameApi、useGames（ゲーム管理・表示）
- **認証機能**: LoginForm、AuthContext、authApi（認証状態・フォーム）
- **クリア記録**: clearRecordApi、useClearRecords（記録管理・API）
- **キャラクター**: characterApi、useCharacters（キャラクター管理）
- **技術スタック**: React Testing Library + Jest
- **特徴**: TypeScript型安全性、UI/UX動作検証、API通信テスト

### 統合テスト（未実装）
- APIエンドポイントの統合テスト
- データベース連携テスト
- 認証・認可の統合テスト

## TypeScript化について

### 完了事項（2025年1月）
- **全ファイル変換**: 全.jsファイルを.ts/.tsxに変換完了
- **型定義追加**: 37個のinterfaceと型定義を追加
- **型安全性確保**: コンパイル時エラー検出による品質向上
- **開発体験改善**: IDEでの自動補完・リファクタリング支援
- **保守性向上**: 明確な型定義によるコード理解向上

### 主要な型定義
- **認証系**: User, LoginCredentials, RegisterData, AuthContextType
- **ゲーム系**: Game, GameFilter, GameListResponse, GameCharacter
- **クリア記録系**: ClearRecord, ClearRecordFormData, IndividualConditionData
- **共通コンポーネント**: ButtonProps, InputProps, BadgeProps

### TypeScript設定
- **tsconfig.json**: 厳密な型チェック有効
- **型エラー対応**: 全TypeScriptエラー解消済み
- **eslint警告**: 未使用変数などの警告のみ残存（機能に影響なし）

### トラブルシューティング
- **ブラウザキャッシュエラー**: ハードリフレッシュ（Cmd+Shift+R）で解決
- **型エラー**: `npx tsc --noEmit`で型チェック実行
- **ビルドエラー**: `npm run build`で詳細確認