# touhou_clear_checker

東方プロジェクトのクリア状況をチェックするツール

## Claude作業指示
- **言語**: すべてのやり取りは日本語で行う
- **コミット**: ユーザーが明示的に要求しない限りgitコミットしない
- **設計資料**: `.claude/`ディレクトリ内の設計書を参照して開発を行う
  - ドキュメントマップ: [.claude/README.md](./.claude/README.md) で全体構成を確認
  - アーキテクチャ: [.claude/01_development_docs/01_architecture_design.md](./.claude/01_development_docs/01_architecture_design.md)
  - データベース: [.claude/01_development_docs/02_database_design.md](./.claude/01_development_docs/02_database_design.md)
  - API設計: [.claude/01_development_docs/03_api_design.md](./.claude/01_development_docs/03_api_design.md)
- **設計原則**: `.claude/01_development_docs/05_design_principles.md`の設計方針を遵守する
- **テスト運用規則**:
  - 新規APIを作成した時には単体テストも作成すること
  - APIを修正した時には単体テストを実行して修正が必要がないか確認し、必要であれば修正すること
  - APIを削除したら不要な単体テストも削除すること

## プロジェクト概要
- 東方シリーズのゲームクリア状況を管理・追跡するWebアプリケーション
- フロントエンド：React 18.2.0 + TypeScript 5.9.2
- バックエンド：FastAPI 0.117.1 (Python 3.13)
- データベース：MySQL 8.0

## 技術スタック概要
### バックエンド
- **フレームワーク**: FastAPI 0.117.1, uvicorn
- **ORM**: SQLAlchemy 1.4.54 (2.0互換モード)
- **バリデーション**: Pydantic 2.11.9
- **データベース**: MySQL 8.0 (PyMySQL 1.1.1)
- **認証**: JWT (python-jose), Argon2 (argon2-cffi)
- **テスト**: pytest 8.3.4, pytest-mock, pytest-asyncio
- **Python**: 3.13.5

### フロントエンド
- **フレームワーク**: React 18.2.0
- **言語**: TypeScript 5.9.2
- **HTTP クライアント**: axios
- **スタイリング**: Tailwind CSS 3.4.17
- **テスト**: Jest 27.5.1, React Testing Library 16.0.0

### 開発環境
- **Docker**: Docker + Docker Compose (推奨)
- **ネイティブ**: Python 3.13 + venv313, Node.js + npm, MySQL

詳細は [アーキテクチャ設計書](./.claude/01_development_docs/01_architecture_design.md) を参照

## クイックスタート

### Docker環境（推奨）
```bash
# 環境変数設定
cp env/.env.mysql.example env/.env.mysql
# env/.env.mysql を編集してパスワード設定

# 起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql up --build

# データベース初期化
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql exec backend python scripts/initialize_database_mysql.py --fresh
```

### ネイティブ環境
```bash
# バックエンド
cd backend
source venv313/bin/activate
python main.py

# フロントエンド（別ターミナル）
cd frontend
npm start
```

詳細は [MySQL環境セットアップ](./.claude/02_deployment_docs/01_mysql_setup.md) と [HTTPS設定](./.claude/02_deployment_docs/03_https_setup.md) を参照

## よく使用するコマンド

### バックエンド（ネイティブ）
```bash
cd backend && source venv313/bin/activate

# 開発サーバー起動
python main.py                           # HTTP
SSL_ENABLED=true python main.py          # HTTPS

# テスト
python -m pytest tests/unit/ -v          # 単体テスト
python -m pytest -v                      # 全テスト

# データベース
python scripts/initialize_database_mysql.py --fresh      # 完全初期化
python scripts/initialize_database_mysql.py --verify     # 状態確認
python scripts/initialize_database_mysql.py --admin-only # adminユーザーのみ作成
```

### フロントエンド
```bash
cd frontend

# 開発サーバー起動
npm start              # HTTP
npm run start:https    # HTTPS

# テスト・ビルド
npm test               # 単体テスト
npx tsc --noEmit       # 型チェック
npm run build          # ビルド
```

### Docker環境
```bash
# 起動・停止
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file env/.env.mysql up --build    # 起動
docker compose -f docker-compose.yml -f docker-compose.mysql.yml down                                      # 停止

# データベース管理
docker compose exec backend python scripts/initialize_database_mysql.py --fresh   # 完全初期化
docker compose exec backend python scripts/initialize_database_mysql.py --verify  # 状態確認

# ログ確認
docker compose logs -f backend     # バックエンドログ
docker compose logs -f frontend    # フロントエンドログ
```

## プロジェクト構造（簡易版）
```
touhou_clear_checker/
├── backend/                 # DDD/クリーンアーキテクチャ
│   ├── domain/             # ドメイン層（エンティティ・リポジトリ・値オブジェクト）
│   ├── application/        # アプリケーション層（サービス・DTO）
│   ├── infrastructure/     # インフラ層（DB・セキュリティ・ロギング）
│   ├── presentation/       # プレゼンテーション層（API・スキーマ）
│   ├── tests/              # テスト（unit/integration）
│   └── scripts/            # データベース管理スクリプト
├── frontend/                # TypeScript + React
│   ├── src/
│   │   ├── components/     # 共通UIコンポーネント
│   │   ├── features/       # 機能別モジュール（auth/games/clearRecords）
│   │   ├── contexts/       # グローバル状態管理（AuthContext/ToastContext）
│   │   ├── types/          # TypeScript型定義
│   │   ├── services/       # API通信
│   │   └── utils/          # ユーティリティ（logging/errorHandler）
│   └── __tests__/          # テスト
└── .claude/                # 設計書・開発ドキュメント
```

詳細は [アーキテクチャ設計書](./.claude/01_development_docs/01_architecture_design.md) と [フロントエンド設計書](./.claude/01_development_docs/04_frontend_architecture.md) を参照

## データベース管理

### スクリプト
- **initialize_database_mysql.py**: MySQL環境用の統合初期化スクリプト
- **create_admin_user.py**: adminユーザー管理スクリプト
- **email_verification_helper.py**: メール認証ヘルパー
- **simple_mysql_init.py**: シンプルな初期化スクリプト

### データベース構成
- **ゲーム数**: 16作品（東方紅魔郷〜東方錦上京）
- **機体数**: 139種類
- **テーブル**: users, games, game_characters, clear_records, game_memos
- **文字エンコーディング**: UTF-8 (utf8mb4)

### ゲームID設計ルール（重要）
- `game_id`: 連番（1-16）
- `series_number`: 作品番号（6.0, 7.0, ..., 12.8, ..., 20.0）
- フロントエンドのゲーム判定は`series_number`を使用（堅牢性のため）
- 紺珠伝（series_number=15.0）、妖精大戦争（series_number=12.8）は特殊処理あり

詳細は [データベース設計書](./.claude/01_development_docs/02_database_design.md) を参照

## テスト構成

### バックエンド（126テスト、実行時間: 0.22秒）
- サービスレイヤー: 74テスト
- リポジトリレイヤー: 28テスト
- APIレイヤー: 14テスト
- ロギング: 15テスト

### フロントエンド（366テスト）
- コンポーネント: 114テスト
- フック: 130テスト
- APIサービス: 95テスト
- ロギング: 41テスト
- エラーハンドリング: 31テスト

詳細は [テスト戦略](./.claude/01_development_docs/07_testing_strategy.md) を参照

## セキュリティ
- **認証**: JWT（30分有効）+ Argon2パスワードハッシュ
- **メール認証**: 新規ユーザー必須（64文字トークン、24時間有効）
- **HTTPS対応**: 開発環境（mkcert）、本番環境（Let's Encrypt等）
- **ログセキュリティ**: 機密情報自動マスキング（パスワード・トークン・メール等）

詳細は [セキュリティ設計](./.claude/01_development_docs/08_security_design.md) と [セキュリティ設定](./.claude/02_deployment_docs/02_security_setup.md) を参照

## ロギング
- **バックエンド**: 構造化ログ（JSON形式）、環境変数`LOG_LEVEL`で制御
- **フロントエンド**: タイムスタンプ付きログ、環境変数`REACT_APP_LOG_LEVEL`で制御
- **機密情報マスキング**: パスワード・トークン・APIキー・メールアドレス等を自動マスキング

詳細は [ロギング設定](./.claude/02_deployment_docs/06_logging_configuration.md) を参照

## エラーハンドリング（フロントエンド）
- **Error Boundary**: Reactコンポーネントツリーのエラーキャッチ
- **Toast通知**: アプリケーション全体の統一通知システム
- **エラーユーティリティ**: APIエラーパース・HTTPマッピング・表示情報生成

詳細は [フロントエンド設計書](./.claude/01_development_docs/04_frontend_architecture.md) を参照

## 主要な設計判断

### ゲーム機体システム（2025年9月完了）
- game_characterエンティティを完全レイヤード化
- 妖精大戦争の特殊ルート構造対応（Route A1〜C2 + Extra）

### ゲーム判定のリファクタリング（2025年10月完了）
- `game_id`から`series_number`ベースの判定に変更
- データ再構築時の影響を回避する堅牢な設計

### TypeScript化（2025年1月完了）
- 全.jsファイルを.ts/.tsxに変換
- 37個のinterface定義による型安全性確保

### Pydantic v2移行（2025年10月完了）
- `.dict()` → `.model_dump()` 置換
- `class Config` → `ConfigDict` 移行
- SQLAlchemy 2.0互換モード対応

## 既知の問題・制限事項
詳細は [既知の問題](./.claude/01_development_docs/99_known_issues.md) を参照

### 軽微な問題
- **ブラウザキャッシュ**: TypeScript移行後、ハードリフレッシュ（Cmd+Shift+R）で解決

### 今後の実装予定
- **高優先**: 管理者画面実装、管理者ユーザーAPIテスト完了
- **中優先**: 統合テスト、検索・フィルター機能、モバイル対応
- **低優先**: CI/CD、セキュリティ強化（レート制限・CSP）、運用機能

## ドキュメント構成
設計書・開発ドキュメントは`.claude/`ディレクトリに整理されています。

- **プロジェクト概要**: `.claude/00_project/`
- **開発・設計資料**: `.claude/01_development_docs/`
- **デプロイメント・運用**: `.claude/02_deployment_docs/`
- **その他**: `.claude/99_others/`

全体マップは [.claude/README.md](./.claude/README.md) を参照

## トラブルシューティング

### ブラウザキャッシュエラー
ハードリフレッシュ（Cmd+Shift+R）またはシークレットモードでアクセス

### 型エラー
```bash
cd frontend && npx tsc --noEmit
```

### データベース接続エラー
```bash
# ネイティブ環境
cd backend && source venv313/bin/activate
python scripts/initialize_database_mysql.py --verify

# Docker環境
docker compose exec backend python scripts/initialize_database_mysql.py --verify
```

### HTTPS証明書エラー
```bash
# mkcert再インストール
brew install mkcert
mkcert -install

# 証明書再生成
cd certs
mkcert localhost 127.0.0.1 ::1
```

詳細は [HTTPS設定](./.claude/02_deployment_docs/03_https_setup.md) を参照
