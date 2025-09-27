# touhou_clear_checker

東方プロジェクトのクリア状況をチェックするツール

## Claude作業指示
- **言語**: すべてのやり取りは日本語で行う
- **コミット**: ユーザーが明示的に要求しない限りgitコミットしない
- **設計資料**: `.claude/`ディレクトリ内の設計書を参照して開発を行う
  - ドキュメントマップ: [.claude/README.md](./.claude/README.md) で全体構成を確認
  - 環境構築: [.claude/02_deployment_docs/](./.claude/02_deployment_docs/) でMySQL・セキュリティ設定
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
- バックエンド：FastAPI 0.117.1, uvicorn, SQLAlchemy
- データベース：SQLite (開発)、MySQL 8.0 (本番対応)
- パッケージマネージャー：npm (frontend), pip (backend)
- **Python 3.13対応済み**: FastAPI 0.117.1, Pydantic 2.11.9で互換性問題解決
- **TypeScript化完了**: 2025年1月にフロントエンドを完全TypeScript化、型安全性と保守性が向上
- **Docker対応済み**: 開発環境のコンテナ化完了、本番デプロイ準備完了
- **MySQL対応完了**: 2025年9月にMySQL Docker環境構築、SQLite互換性維持

### 開発環境の選択肢
1. **ネイティブ環境** (従来): Python 3.13 + venv313, Node.js + npm + SQLite
2. **Docker SQLite環境**: コンテナ化された軽量開発環境
3. **Docker MySQL環境**: 本番環境に近い開発環境
4. **併用**: 開発はSQLite、本番デプロイはMySQL

## よく使用するコマンド

### バックエンド (ネイティブ環境)
- 開発サーバー: `cd backend && source venv313/bin/activate && python main.py &`
- 依存関係インストール: `cd backend && source venv313/bin/activate && pip install -r requirements.txt`
- テスト用依存関係: `cd backend && source venv313/bin/activate && pip install -r requirements-dev.txt`
- 単体テスト実行: `cd backend && source venv313/bin/activate && python -m pytest tests/unit/ -v`
- 全テスト実行: `cd backend && source venv313/bin/activate && python -m pytest -v`
- **SQLiteデータベース初期化**: `cd backend && source venv313/bin/activate && python scripts/initialize_database.py --fresh`
- **データベース確認**: `cd backend && source venv313/bin/activate && python scripts/initialize_database.py --verify`
- **旧環境**: `source venv39/bin/activate` (Python 3.9、非推奨)

### フロントエンド (TypeScript + React)
- 開発サーバー: `cd frontend && npm start`
- 依存関係インストール: `cd frontend && npm install`
- ビルド: `cd frontend && npm run build`
- 単体テスト実行: `cd frontend && npm test`

### Docker開発環境

#### SQLite環境（軽量開発用）
- **全体起動**: `docker compose -f docker-compose.yml -f docker-compose.sqlite.yml --env-file .env.sqlite up --build`
- **バックグラウンド起動**: `docker compose -f docker-compose.yml -f docker-compose.sqlite.yml --env-file .env.sqlite up -d --build`
- **停止**: `docker compose -f docker-compose.yml -f docker-compose.sqlite.yml down`
- **データベース初期化**: `docker compose -f docker-compose.yml -f docker-compose.sqlite.yml run --rm backend python scripts/initialize_database.py --fresh`

#### MySQL環境（本番環境相当）
- **環境変数設定**: `.env.mysql.example`を`.env.mysql`にコピーしてパスワード設定
- **全体起動**: `docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file .env.mysql up --build`
- **バックグラウンド起動**: `docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file .env.mysql up -d --build`
- **停止**: `docker compose -f docker-compose.yml -f docker-compose.mysql.yml down`
- **MySQL初期化のみ**: `docker compose --profile mysql run --rm mysql-init`
- **SQLite→MySQL移行**: `docker compose -f docker-compose.yml -f docker-compose.mysql.yml exec backend python scripts/migrate_sqlite_to_mysql.py`
- **MySQL接続**: `localhost:3306` (接続情報は`.env.mysql`で設定)
- **MySQL文字化け対策済み**: UTF-8 (utf8mb4) 完全対応

#### レガシー環境（非推奨）
- **旧Docker起動**: `docker compose up --build` ※設定ファイル指定なし（動作不安定）

#### 共通操作
- **ログ確認**: `docker compose logs -f [service名]`
- **サービス別起動**: `docker compose up [backend|frontend|mysql]`
- **コンテナ内シェル**: `docker compose exec [backend|frontend] sh`
- **アクセスURL**: フロントエンド http://localhost:3000, バックエンド http://localhost:8000
- **MySQL管理画面**: phpMyAdmin等は未導入（必要時は追加構成）
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
│   ├── scripts/            # データベース管理スクリプト
│   │   ├── initialize_database.py  # 統合データベース初期化
│   │   └── deprecated_scripts/     # 廃止予定の古いスクリプト
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
- **計111個のテスト**が正常動作
- **サービスレイヤー**: 74テスト（ゲーム・ユーザー・クリア記録・ゲーム機体・メール送信のビジネスロジック）
- **リポジトリレイヤー**: 28テスト（データアクセスの基本操作）
- **APIレイヤー**: 14テスト（エンドポイントのテスト）
- **技術スタック**: pytest + pytest-mock
- **特徴**: 完全モック化により外部依存なし、高速実行（0.22秒）

### フロントエンド単体テスト（実装済み）
- **計15個のテストファイル**、**320+個のテスト**が正常動作
- **共通コンポーネント**: Button、Input、Badge（UI操作・スタイリング）
- **ゲーム機能**: GameCard、gameApi、useGames（ゲーム管理・表示）
- **認証機能**: LoginForm、AuthContext、authApi（認証状態・フォーム）
- **クリア記録**: clearRecordApi、useClearRecords、IndividualTabClearForm（記録管理・API・UI）
- **ゲーム機体**: gameCharacterApi、useGameCharacters（ゲーム機体管理）
- **難易度システム**: difficulty.ts（ゲーム別難易度制御・特殊ケース対応）
- **妖精大戦争特殊対応**: ルート別表示・タブ切り替え・表記変更のテスト
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
- **ゲーム系**: Game, GameFilter, GameListResponse, GameCharacter, GameCharacterListResponse
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

## セキュリティ仕様

### 認証・認可
- **パスワードハッシュ化**: Argon2使用、`backend/infrastructure/security/password_hasher.py`
- **JWT認証**: アクセストークン30分、`backend/infrastructure/security/jwt_handler.py`
- **メール認証**: 新規ユーザー必須、64文字トークン・24時間有効期限
- **トークン管理**: LocalStorageに保存、ログアウト時自動クリア
- **認証状態管理**: React Context + useReducerパターン

### セキュリティ対策
- **XSS対策**: React標準エスケープ機能、dangerouslySetInnerHTML未使用
- **TypeScript型安全性**: 37個のinterface定義による実行時エラー防止
- **HTTPS**: 本番環境ではHTTPS必須（開発環境はHTTP可）

### セキュリティ設定
- **シークレットキー**: 本番環境では環境変数から取得（`JWT_SECRET_KEY`）
- **CORS設定**: 必要なオリジンのみ許可
- **SQLインジェクション対策**: SQLAlchemy ORMによる自動エスケープ

### 今後の強化ポイント
- **リフレッシュトークン**: HttpOnly Cookieでの実装検討
- **CSP（Content Security Policy）**: XSS攻撃の追加防御
- **レート制限**: API呼び出し頻度制限
- **ログ監視**: 異常なアクセスパターンの検出

## データベース管理

### 統合初期化スクリプト
新しい`initialize_database.py`スクリプトにより、データベースの作成・管理が一括で可能：

```bash
# 完全初期化（既存DB削除 → テーブル作成 → 全データ投入）
python scripts/initialize_database.py --fresh

# 現在のDB状態確認
python scripts/initialize_database.py --verify

# ゲームデータのみ再投入
python scripts/initialize_database.py --games-only

# ゲーム機体データのみ再投入
python scripts/initialize_database.py --characters-only

# ヘルプ表示
python scripts/initialize_database.py --help
```

### データベース構成
- **ファイル**: `backend/touhou_clear_checker.db` (SQLite3)
- **ゲーム数**: 16作品（東方紅魔郷〜東方錦上京）
- **機体数**: 141種類（全作品の機体を網羅、妖精大戦争の特殊構造対応済み）
- **テーブル**: users, games, game_characters, clear_records, game_memos
- **メール認証**: email_verified, verification_token等のカラム対応済み
- **妖精大戦争特殊対応**: Route A1〜C2（6機体）+ Extra（1機体）の合計7機体

### スクリプト整理状況
- **現在**: `initialize_database.py` - 統合された一括初期化スクリプト
- **廃止**: `deprecated_scripts/` - 旧スクリプト群を移動済み

## 妖精大戦争特殊仕様対応

### 概要
妖精大戦争（ゲームID: 8）では、他の東方シリーズと異なる特殊なデータ構造と表示ロジックを採用

### データ構造
- **Route機体**: チルノ（Route A1）〜チルノ（Route C2）の6機体
- **Extra機体**: チルノ（Extra）の1機体
- **合計**: 7機体（他作品は通常4〜16機体）

### フロントエンド表示ロジック
- **Easy/Normal/Hard/Lunaticタブ**: Route A1〜C2の6機体のみ表示
- **Extraタブ**: Extra機体のみ表示
- **表記変更**: 「機体別」→「ルート別」（条件登録、条件設定、テーブルヘッダー）

### 実装箇所
- **コンポーネント**: `IndividualTabClearForm.tsx`
- **フィルタリングロジック**: ゲームID=8での条件分岐
- **表記変更**: `game.id === 8`での動的テキスト切り替え

### テストカバレッジ
- **UI表示テスト**: 17個のテストケース
- **タブ切り替え**: Easy〜Extraでの機体表示確認
- **表記変更**: ルート別表記の正確性検証

## ゲーム機体レイヤード構造改善（2025年9月完了）

### 改善概要
game_characterエンティティのアーキテクチャを他のエンティティと統一し、レイヤード設計原則に準拠

### 改善前の問題
- **設計原則違反**: Presentation層がDomain層を直接呼び出し
- **Application層欠如**: ビジネスロジックが分散、DTOが未実装
- **型安全性不足**: Pydanticスキーマによる検証が不十分
- **テスト不足**: 単体テストが全く存在しない状態

### 改善後の構造
#### バックエンド（完全レイヤード化）
- **Application層**: `game_character_service.py`（ビジネスロジック）、`game_character_dto.py`（データ転送）
- **Infrastructure層**: `game_character_model.py`（SQLAlchemyモデル）
- **Presentation層**: `game_character_schema.py`（入力検証）、APIをService経由に修正
- **テスト層**: `test_game_character_service.py`（16個の包括的テスト）

#### フロントエンド（API連携修正）
- **型定義**: `GameCharacterListResponse`追加（新しいAPIレスポンス形式対応）
- **API修正**: `gameCharacterApi.ts`でレスポンス形式変更に対応

### 効果・利点
- **統一性**: 他エンティティ（game、user、clear_record）と同じ層構成を実現
- **保守性**: ビジネスロジックがService層に集約、責務が明確化
- **品質向上**: 16個のテストでエラーケース含む全機能を網羅
- **型安全性**: バックエンドとフロントエンド間のデータ形式検証強化

### テスト結果
- **新規テスト**: 16個 ✅ 全成功（game_character_service）
- **全体テスト**: 111個 ✅ 全成功（既存機能に影響なし）

## メールサービス レイヤード構造改善（2025年9月完了）

### 改善概要
EmailServiceのアーキテクチャを他のエンティティと統一し、レイヤード設計原則に準拠

### 改善前の問題
- **設計原則違反**: Infrastructure層にビジネスロジックが混在
- **レイヤー責務不明確**: メール送信の技術実装とビジネスロジックが同一クラス内
- **他エンティティとの不整合**: game、user、clear_record、game_characterとは異なる構造

### 改善後の構造
#### バックエンド（完全レイヤード化）
- **Application層**: `EmailService`（メール送信ビジネスロジック）、`EmailSender`インターフェース
- **Infrastructure層**: `SMTPEmailSender`（SMTP技術的実装）
- **依存性注入**: EmailServiceはEmailSenderインターフェースに依存
- **環境分離**: 本番環境（SMTP）と開発環境（Mock）の実装分離

### 効果・利点
- **統一性**: 他エンティティ（game、user、clear_record、game_character）と同じ層構成を実現
- **保守性**: ビジネスロジックがApplication層に集約、技術実装がInfrastructure層に分離
- **品質向上**: 7個のテストでEmailServiceの全機能を網羅
- **拡張性**: 新しいメール送信方式（SES等）を容易に追加可能

### テスト結果
- **新規テスト**: 7個 ✅ 全成功（EmailService、MockEmailSender）
- **全体テスト**: 111個 ✅ 全成功（既存機能に影響なし）

## Docker環境仕様（2025年9月完了）

### 概要
開発環境のコンテナ化により、環境差異を解消し、本番デプロイの準備を完了

### Docker構成
- **docker-compose.yml**: 開発環境の統合構成
- **backend/Dockerfile**: Python 3.13 + FastAPI環境
- **frontend/Dockerfile**: Node.js 18 + React + TypeScript環境
- **.dockerignore**: 各環境の最適化設定

### 技術仕様
#### バックエンドコンテナ
- **ベースイメージ**: python:3.13-slim
- **ポート**: 8000（ホスト側も同一）
- **ボリューム**: ソースコード + SQLiteデータベース永続化
- **特徴**: ホットリロード、完全な依存関係分離

#### フロントエンドコンテナ
- **ベースイメージ**: node:18-alpine
- **ポート**: 3000（ホスト側も同一）
- **ボリューム**: ソースコード（node_modules除外）
- **特徴**: TypeScript 5.x対応、react-scripts警告解消

### ネットワーク構成
- **プライベートネットワーク**: `touhou-network`
- **サービス間通信**: コンテナ名での名前解決
- **外部アクセス**: localhost経由でのポートマッピング

### データ永続化
- **SQLite**: ホスト側ファイルシステムに永続保存
- **開発データ**: コンテナ再作成時も保持
- **ログ**: `docker compose logs`で統合確認可能

### 運用上の利点
- **環境統一**: Mac開発 → Linux本番の差異解消
- **依存関係管理**: コンテナ内で完結、ホスト環境への影響なし
- **スケーラビリティ**: 本番環境への段階的移行が容易
- **チーム開発**: 開発者間での環境差異を完全排除

### 既存環境との関係
- **併用可能**: ネイティブ環境（venv313）と並行利用
- **ポート競合回避**: 既存プロセス停止後にDocker起動
- **段階的移行**: 開発段階での選択的利用が可能