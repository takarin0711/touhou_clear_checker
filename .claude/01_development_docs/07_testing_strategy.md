# テスト戦略・設計書

## 概要
東方クリアチェッカーのテスト戦略と実装ガイドライン

## テスト構成

### 1. バックエンド単体テスト（Unit Test）✅実装済み
**対象**: サービスレイヤー、リポジトリレイヤー  
**目的**: ビジネスロジックとデータアクセスの品質保証  
**実装状況**: 37テスト（サービス26 + リポジトリ11）

#### 技術スタック
- **pytest 8.3.4**: テストフレームワーク
- **pytest-mock**: モッキングライブラリ
- **pytest-asyncio**: 非同期テスト対応

#### ディレクトリ構成
```
backend/tests/
├── conftest.py          # テスト共通設定
├── pytest.ini          # pytest設定
├── requirements-dev.txt # テスト依存関係
└── unit/
    ├── services/        # サービスレイヤーテスト
    │   ├── test_game_service.py
    │   └── test_user_service.py
    └── repositories/    # リポジトリレイヤーテスト
        └── test_game_repository.py
```

#### テスト原則
- **完全モック化**: 外部依存（DB、API）を完全にモック
- **高速実行**: 全37テストが0.08秒で完了
- **包括的カバレッジ**: 正常系・異常系・境界値テスト

#### テスト実行コマンド
```bash
# 全単体テスト実行
cd backend && source venv313/bin/activate && python -m pytest tests/unit/ -v

# 特定レイヤーのテスト
python -m pytest tests/unit/services/ -v
python -m pytest tests/unit/repositories/ -v
```

### 2. フロントエンド単体テスト（Unit Test）✅実装済み
**対象**: コンポーネント、フック、APIサービス  
**目的**: UI/UXとフロントエンドロジックの品質保証  
**実装状況**: 320+テスト（コンポーネント95 + フック130 + APIサービス95 + ユーティリティ26）

#### 技術スタック
- **React Testing Library**: コンポーネントテストライブラリ
- **Jest**: JavaScriptテストフレームワーク
- **@testing-library/jest-dom**: DOM要素のアサーション拡張
- **@testing-library/user-event**: ユーザーインタラクションシミュレーション

#### ディレクトリ構成
```
frontend/src/
├── setupTests.ts                          # テスト共通設定・Mock設定
├── components/common/
│   ├── Button.test.tsx                    # Buttonコンポーネントテスト（16テスト）
│   ├── Input.test.tsx                     # Inputコンポーネントテスト（17テスト）
│   └── Badge.test.tsx                     # Badgeコンポーネントテスト（16テスト）
├── features/
│   ├── games/components/
│   │   └── GameCard.test.tsx              # GameCardコンポーネントテスト（17テスト）
│   ├── auth/components/
│   │   └── LoginForm.test.tsx             # LoginFormコンポーネントテスト（13テスト）
│   └── clearRecords/components/
│       └── IndividualTabClearForm.test.tsx # 妖精大戦争特殊対応テスト（17テスト）
├── contexts/
│   └── AuthContext.test.tsx               # 認証コンテキストテスト（19テスト）
├── hooks/
│   ├── useClearRecords.test.ts            # useClearRecordsフックテスト（23テスト）
│   └── useGames.test.ts                   # useGamesフックテスト（19テスト）
├── types/
│   └── difficulty.test.ts                 # 難易度ユーティリティテスト（26テスト）
└── services/
    ├── gameApi.test.ts                    # ゲームAPI通信テスト（11テスト）
    ├── authApi.test.ts                    # 認証API通信テスト（4テスト）
    └── clearRecordApi.test.ts             # クリア記録API通信テスト（52テスト）
```

#### テスト原則
- **包括的カバレッジ**: UI要素の表示・操作・状態変更をテスト
- **モック活用**: axios、localStorage、外部依存関係を完全モック
- **ユーザー視点**: 実際のユーザー操作パターンを重視
- **型安全テスト**: TypeScriptでの型安全なテストコード

#### 妖精大戦争特殊対応テスト
**目的**: 妖精大戦争の特殊表示ロジック・表記変更の品質保証

**主要テストケース**:
- **ルート別表示**: Easy〜Lunaticタブで Route A1〜C2 のみ表示
- **Extra表示**: Extraタブで Extra機体のみ表示
- **表記変更**: 「機体別」→「ルート別」の動的テキスト切り替え
- **タブ切り替え**: 難易度タブによる表示機体の正確な変更
- **モック対応**: useClearRecords・useGameCharactersの完全モック

**実装場所**: `IndividualTabClearForm.test.tsx`（17テスト）

#### テスト実行コマンド
```bash
# 全フロントエンドテスト実行
cd frontend && npm test

# カバレッジレポート付き実行
npm test -- --coverage

# 特定ファイルのテスト実行
npm test Button.test.tsx

# テストファイル監視モード
npm test -- --watch
```

### 3. 統合テスト（Integration Test）🔴未実装
**対象**: APIエンドポイント、DB連携、認証フロー  
**目的**: システム全体の動作確認  

#### 実装予定内容
- **API統合テスト**: HTTPリクエスト/レスポンステスト
- **DB統合テスト**: 実際のSQLite/テストDBとの連携テスト
- **認証統合テスト**: JWT認証フローの全体テスト
- **エンドポイント間連携**: 複数APIの連携動作テスト

#### 予定ディレクトリ構成
```
backend/tests/integration/
├── api/
│   ├── test_games_integration.py
│   ├── test_users_integration.py
│   └── test_clear_records_integration.py
├── database/
│   └── test_db_operations.py
└── auth/
    └── test_auth_flow.py
```

### 4. E2Eテスト（End-to-End Test）🔴未実装
**対象**: フロントエンド + バックエンドの完全結合  
**目的**: ユーザー視点での動作確認

## テスト運用規則

### バックエンドAPI修正・追加・削除の必須手順

#### 1. 新規API作成時
1. **API実装**を行う
2. **対応する単体テスト**を必ず作成する
   - `tests/unit/services/` にサービスレイヤーテスト
   - `tests/unit/repositories/` にリポジトリレイヤーテスト（必要に応じて）
3. テストが全て通ることを確認
   ```bash
   python -m pytest tests/unit/ -v
   ```

#### 2. 既存API修正時
1. **API修正**を行う
2. **単体テストを実行**して影響確認
   ```bash
   python -m pytest tests/unit/ -v
   ```
3. テストが失敗した場合、**テストコードを修正**する
4. 全テストが通ることを確認

#### 3. API削除時
1. **API削除**を行う
2. **不要になった単体テスト**を削除する
3. 残りのテストが全て通ることを確認
   ```bash
   python -m pytest tests/unit/ -v
   ```

### フロントエンド開発・修正の必須手順

#### 1. 新規コンポーネント作成時
1. **コンポーネント実装**を行う（.tsxファイル）
2. **対応する単体テスト**を必ず作成する
   - `src/components/` にコンポーネントテスト
   - プロップス、イベント、レンダリング結果をテスト
3. テストが全て通ることを確認
   ```bash
   npm test
   ```

#### 2. カスタムフック作成時
1. **フック実装**を行う（.tsファイル）
2. **renderHookを使った単体テスト**を作成
   - `src/hooks/` にフックテスト
   - 状態変更、副作用、戻り値をテスト
3. テストが全て通ることを確認

#### 3. APIサービス作成時
1. **APIサービス実装**を行う（.tsファイル）
2. **axiosモックを使った単体テスト**を作成
   - `src/services/` にAPIテスト
   - リクエスト・レスポンス・エラーハンドリングをテスト
3. テストが全て通ることを確認

#### 4. 既存機能修正時
1. **機能修正**を行う
2. **関連テストを実行**して影響確認
   ```bash
   npm test -- --testPathPattern=修正対象ファイル名
   ```
3. テストが失敗した場合、**テストコードを修正**する
4. 全テストが通ることを確認

#### 5. 機能削除時
1. **機能削除**を行う
2. **不要になったテスト**を削除する
3. 残りのテストが全て通ることを確認
   ```bash
   npm test
   ```

### テストコード品質基準

#### 命名規則
- テストクラス: `Test{対象クラス名}`
- テストメソッド: `test_{機能名}_{条件}`
- 例: `test_create_user_success`, `test_get_game_not_found`

#### テスト構成
1. **setup_method**: 共通セットアップ
2. **AAA Pattern**: Arrange（準備）→ Act（実行）→ Assert（検証）
3. **明確な意図**: テスト名と内容から意図が明確に分かる

#### モック戦略
- **外部依存は完全モック**: DB、外部API、ファイルシステム
- **ビジネスロジックは実コード**: モックしすぎない
- **依存性注入**: テスト用のモックオブジェクトを注入

### 継続的改善

#### テストメトリクス
- **実行時間**: 単体テスト全体が10秒以内
- **成功率**: 100%（失敗テストは即座に修正）
- **カバレッジ**: 主要ビジネスロジックを網羅

#### 定期見直し
- **月次**: テスト実行時間とカバレッジの確認
- **機能追加時**: テスト戦略の見直し
- **リファクタリング時**: テストの重複・不要テストの整理

## 今後の発展方向

### 短期（1-2ヶ月）
- 統合テストの基盤整備
- CIパイプラインでのテスト自動実行

### 中期（3-6ヶ月）
- APIエンドポイント統合テストの実装
- テストカバレッジ測定の導入

### 長期（6ヶ月以上）
- E2Eテストの導入
- パフォーマンステストの実装