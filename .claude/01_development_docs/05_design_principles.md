# 設計方針・原則

## 概要
このドキュメントは、touhou_clear_checkerプロジェクトの設計方針と開発原則を明記したものです。コードの一貫性と保守性を保つため、開発時はこれらの原則に従ってください。

## 1. マジックナンバーの禁止

### 原則
**ハードコーディングされた数値（マジックナンバー）の使用を極力避ける**

### 理由
- コードの可読性向上
- 保守性の向上
- 設定変更の容易性
- バグの発生リスク軽減

### 実装方針

#### バックエンド
- `domain/constants/` ディレクトリに定数ファイルを配置
- ゲーム関連の数値は `game_constants.py` で管理
- データベース関連の数値も定数化
- 設定値は環境変数または定数として管理

#### フロントエンド
- `src/constants/` ディレクトリに定数ファイルを配置
- API関連の設定は `apiConstants.js` で管理
- ゲーム関連の定数は `gameConstants.js` で管理
- UI関連の数値も定数化

### 実装状況（2025年10月更新）

#### 新規作成済み定数ファイル
- `backend/infrastructure/security/constants.py` - JWT、認証トークン、暗号化設定
- `backend/domain/constants/validation_constants.py` - バリデーション制約値
- `backend/infrastructure/config/network_constants.py` - サーバー、CORS設定
- `frontend/src/constants/validation.ts` - フロントエンド用バリデーション定数

#### 使用例

**セキュリティ設定:**
```python
# ❌ マジックナンバー
ACCESS_TOKEN_EXPIRE_MINUTES = 30
argon2__memory_cost=65536
self.smtp_port = int(os.getenv("SMTP_PORT", "587"))

# ✅ 定数使用
from infrastructure.security.constants import SecurityConstants
ACCESS_TOKEN_EXPIRE_MINUTES = SecurityConstants.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
argon2__memory_cost=SecurityConstants.ARGON2_MEMORY_COST
self.smtp_port = int(os.getenv("SMTP_PORT", str(SecurityConstants.SMTP_DEFAULT_PORT)))
```

**バリデーション設定:**
```python
# ❌ マジックナンバー
username = Column(String(50), unique=True, nullable=False)
if formData.username.length < 3:

# ✅ 定数使用
from domain.constants.validation_constants import ValidationConstants
username = Column(String(ValidationConstants.USERNAME_MAX_LENGTH), unique=True, nullable=False)
if formData.username.length < VALIDATION_CONSTANTS.USERNAME_MIN_LENGTH:
```

**ネットワーク設定:**
```python
# ❌ マジックナンバー
allow_origins=["http://localhost:3000", "http://localhost:3001"]
uvicorn.run(app, host="0.0.0.0", port=8000)

# ✅ 定数使用
from infrastructure.config.network_constants import NetworkConstants
allow_origins=NetworkConstants.ALLOWED_ORIGINS
uvicorn.run(app, host=NetworkConstants.DEFAULT_HOST, port=NetworkConstants.DEFAULT_PORT)
```

**ゲーム判定（既存）:**
```python
# ❌ マジックナンバー使用
if game_id == 1:
    char_range = (19, 22)
elif game_id == 2:
    char_range = (23, 28)

# ✅ 定数使用
char_range = get_character_range_for_game(game_id)
```

## 2. コーディング原則

### 共通原則
- **DRY原則**: Don't Repeat Yourself - 同じコードの重複を避ける
- **SOLID原則**: 
  - **S**ingle Responsibility - 単一責任の原則
  - **O**pen/Closed - 開放閉鎖の原則  
  - **L**iskov Substitution - リスコフの置換原則
  - **I**nterface Segregation - インターフェース分離の原則
  - **D**ependency Inversion - 依存性逆転の原則
- **依存性注入**: インターフェースに依存し、具象クラスに依存しない
- **関心の分離**: UI/ロジック/データアクセスを分離

### バックエンド原則
- **SQLAlchemy ORM**: データベースアクセスはORM経由のみ
- **セッション管理**: 各リポジトリはSessionを受け取るコンストラクタ
- **型ヒント**: 全ての関数・メソッドに型ヒントを記述
- **async/await**: データベースアクセスは非同期処理

### フロントエンド原則
- **Custom Hooks**: API呼び出しはカスタムフックでカプセル化
- **純粋コンポーネント**: 副作用のない関数コンポーネント
- **Propsの最小化**: 必要最小限のPropsのみ受け取る
- **カスタムフック活用**: ロジックの再利用性を重視

## 3. 命名規則

### 定数命名
- **バックエンド**: `UPPER_SNAKE_CASE` 
- **フロントエンド**: `UPPER_SNAKE_CASE`
- **クラス定数**: クラス内でネストした定数クラスを使用

**例:**
```python
# Python
class GameIds:
    TOUHOU_06_EOSD = 1
    TOUHOU_07_PCB = 2

# JavaScript
export const GAME_IDS = {
  TOUHOU_06_EOSD: 1,
  TOUHOU_07_PCB: 2,
};
```

### ファイル命名
- **定数ファイル**: `xxxConstants.py` / `xxxConstants.js`
- **設定ファイル**: `xxxConfig.py` / `xxxConfig.js`

## 4. エラーハンドリング

### 原則
- **明示的なエラー処理**: すべてのエラーケースを明示的に処理
- **ユーザーフレンドリーなメッセージ**: 技術的なエラーをユーザー向けに変換
- **ログ出力**: デバッグ用の詳細情報をログに記録

### 実装
- エラーメッセージも定数として管理
- HTTP ステータスコードは定数を使用
- バックエンドではカスタム例外クラスを使用

## 5. データ設計原則

### データベース
- **第3正規形**: データの正規化を徹底
- **制約の明示**: NOT NULL, UNIQUE等の制約を適切に設定
- **インデックス**: パフォーマンス重要なカラムにインデックス作成
- **命名規則**: スネークケース（`clear_records`）
- **タイムスタンプ**: 必ず`created_at`, `updated_at`を設定

### 識別子使用原則
- **ビジネスロジックでは意味のあるIDを使用**: `series_number`（作品番号）等の不変値を優先
- **技術的IDは最小限に**: `game_id`等の連番は純粋な技術的目的のみ
- **将来のメンテナンス性を考慮**: データ再構築時にも影響を受けない識別子を選択

#### ✅ 完了: ゲーム判定の改善（2025年10月実装）
**実装内容**: フロントエンドのゲーム判定を`game_id`から`series_number`に変更完了  
**対応済みファイル**: 
- `gameConstants.ts` - 新しいseries_number版関数を追加、旧版@deprecated関数を削除
- `difficulty.ts` - `getDifficultyOrderForGameBySeries`関数を実装、包括的テスト追加
- `IndividualTabClearForm.tsx` - series_number判定に変更済み
- `gameFeatureConstants.ts` - SPECIAL_CLEAR_SERIES_NUMBERS定数で管理
**効果**: データ再構築時にも影響を受けない堅牢な設計を実現

### API設計
- **RESTful**: REST原則に従ったURL設計
- **一貫性**: レスポンス形式の統一
- **バージョニング**: `/api/v1/`プレフィックス
- **ステータスコード**: 適切なHTTPステータスコードを使用

## 6. セキュリティ

### 原則
- **認証**: JWT トークンによる認証
- **認可**: ユーザー別のデータアクセス制御
- **入力検証**: すべての入力値を検証
- **秘密情報の保護**: API キー等の秘密情報は環境変数で管理

## 7. テスト

### 基本原則
- **単体テスト**: 各関数・メソッドの単体テスト
- **統合テスト**: API エンドポイントの統合テスト
- **E2E テスト**: 重要なユーザーフローのE2Eテスト

### テスト運用規則（必須）

#### 新規API作成時
1. **API実装**を行う
2. **対応する単体テスト**を必ず作成する
   - `tests/unit/services/` にサービスレイヤーテスト
   - `tests/unit/repositories/` にリポジトリレイヤーテスト（必要に応じて）
3. テストが全て通ることを確認
   ```bash
   python -m pytest tests/unit/ -v
   ```

#### 既存API修正時
1. **API修正**を行う
2. **単体テストを実行**して影響確認
   ```bash
   python -m pytest tests/unit/ -v
   ```
3. テストが失敗した場合、**テストコードを修正**する
4. 全テストが通ることを確認

#### API削除時
1. **API削除**を行う
2. **不要になった単体テスト**を削除する
3. 残りのテストが全て通ることを確認

### 実装状況
- ✅ **単体テスト**: 37テスト実装済み（サービス26 + リポジトリ11）
- ✅ **高速実行**: 全テスト0.08秒で完了
- ✅ **完全モック化**: 外部依存なし
- 🔄 **統合テスト**: 未実装（今後追加予定）

### カバレッジ目標
- **単体テスト**: ビジネスロジック100%カバレッジ
- **統合テスト**: 主要APIエンドポイント80%以上
- **E2E テスト**: 重要ユーザーフロー100%

## 8. パフォーマンス

### 原則
- **遅延読み込み**: 必要な時に必要なデータのみ取得
- **キャッシュ**: 適切なキャッシュ戦略
- **最適化**: N+1問題の回避

### 実装
- **フロントエンド**: useMemo, useCallback の適切な使用
- **バックエンド**: SQLAlchemy の eager loading 活用

## 9. ドキュメント

### 原則
- **自己文書化**: コード自体が文書として機能
- **コメント**: 複雑なロジックには必要十分なコメント
- **型情報**: TypeScript風のJSDoc、Python型ヒント

### 更新
- **コード変更時**: 関連ドキュメントも同時更新
- **新機能追加時**: 設計書・API仕様書の更新

## まとめ

これらの設計原則は、コードの品質、保守性、可読性を向上させるためのガイドラインです。新しい機能の実装や既存コードの修正時は、必ずこれらの原則に従って作業を行ってください。

原則に関する疑問や改善提案がある場合は、プロジェクトチームで議論し、必要に応じてこのドキュメントを更新してください。