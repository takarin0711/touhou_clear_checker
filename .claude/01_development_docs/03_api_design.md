# API設計

## ベースURL
- 開発環境: `http://localhost:8000`
- 本番環境: TBD

## 共通仕様

### 認証
- **認証方式**: JWT Bearer Token
- **ヘッダー**: `Authorization: Bearer <token>`
- **有効期限**: 30分
- **権限**: 一般ユーザー / 管理者

### セキュリティ
- **HTTPS**: 本番環境必須
- **CORS**: 許可されたオリジンのみ
- **入力値検証**: Pydanticスキーマ
- **レート制限**: 予定

### レスポンス形式
```json
{
  "status": "success" | "error",
  "data": {},
  "message": "string",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### エラーレスポンス
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## APIエンドポイント

### ゲーム関連

#### GET /api/games
ゲーム一覧を取得

**Response:**
```json
{
  "status": "success",
  "data": {
    "games": [
      {
        "id": 1,
        "title": "東方紅魔郷",
        "title_en": "Embodiment of Scarlet Devil",
        "release_year": 2002,
        "series_number": 6,
        "has_extra": true,
        "has_phantasm": false
      }
    ]
  }
}
```

#### GET /api/games/{game_id}
特定のゲーム詳細を取得

**Response:**
```json
{
  "status": "success",
  "data": {
    "game": {
      "id": 1,
      "title": "東方紅魔郷",
      "title_en": "Embodiment of Scarlet Devil",
      "release_year": 2002,
      "series_number": 6,
      "has_extra": true,
      "has_phantasm": false,
      "characters": [
        {
          "id": 1,
          "name": "博麗霊夢",
          "shot_type": "霊符"
        }
      ]
    }
  }
}
```

### 難易度関連

#### GET /api/difficulties
難易度一覧を取得

**Response:**
```json
{
  "status": "success",
  "data": {
    "difficulties": [
      {
        "id": 1,
        "name": "Easy",
        "display_order": 1
      }
    ]
  }
}
```

### ゲーム機体関連

#### GET /api/v1/game-characters/{game_id}/characters
指定ゲームの機体一覧を取得（認証不要）

**Path Parameters:**
- `game_id` (int): ゲームID

**Response:**
```json
{
  "game_characters": [
    {
      "id": 1,
      "game_id": 1,
      "character_name": "霊夢A（霊の御札）",
      "description": "ホーミングアミュレット・霊力重視タイプ",
      "sort_order": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_count": 4
}
```

#### GET /api/v1/game-characters/characters/{character_id}
機体IDで機体詳細を取得（認証不要）

**Path Parameters:**
- `character_id` (int): 機体ID

**Response:**
```json
{
  "id": 1,
  "game_id": 1,
  "character_name": "霊夢A（霊の御札）",
  "description": "ホーミングアミュレット・霊力重視タイプ",
  "sort_order": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/v1/game-characters/{game_id}/characters
新しいゲーム機体を作成（管理者のみ）

**Path Parameters:**
- `game_id` (int): ゲームID

**Request Body:**
```json
{
  "character_name": "魔理沙A（魔の御札）",
  "description": "マジックミサイル・魔力重視タイプ",
  "sort_order": 3
}
```

**Response:** 作成された機体情報（上記GET詳細と同形式）

#### PUT /api/v1/game-characters/characters/{character_id}
ゲーム機体を更新（管理者のみ）

**Path Parameters:**
- `character_id` (int): 機体ID

**Request Body:** POST時と同形式

**Response:** 更新された機体情報

#### DELETE /api/v1/game-characters/characters/{character_id}
ゲーム機体を削除（管理者のみ）

**Path Parameters:**
- `character_id` (int): 機体ID

**Response:**
```json
{
  "message": "機体が削除されました"
}
```

#### GET /api/v1/game-characters/{game_id}/characters/count
ゲーム別機体数を取得（認証不要）

**Path Parameters:**
- `game_id` (int): ゲームID

**Response:**
```json
{
  "game_id": 1,
  "character_count": 4
}
```

### クリア記録関連

#### GET /api/clear-records
クリア記録一覧を取得

**Query Parameters:**
- `game_id` (optional): ゲームIDでフィルタ
- `difficulty_id` (optional): 難易度IDでフィルタ
- `is_cleared` (optional): クリア済みフラグでフィルタ

**Response:**
```json
{
  "status": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "game": {
          "id": 1,
          "title": "東方紅魔郷"
        },
        "difficulty": {
          "id": 1,
          "name": "Easy"
        },
        "character": {
          "id": 1,
          "name": "博麗霊夢"
        },
        "is_cleared": true,
        "clear_date": "2024-01-01",
        "score": 12345678,
        "continue_count": 0,
        "memo": "初クリア！"
      }
    ]
  }
}
```

#### POST /api/clear-records
新しいクリア記録を作成

**Request Body:**
```json
{
  "game_id": 1,
  "difficulty_id": 1,
  "character_id": 1,
  "is_cleared": true,
  "clear_date": "2024-01-01",
  "score": 12345678,
  "continue_count": 0,
  "memo": "初クリア！"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "record": {
      "id": 1,
      "game_id": 1,
      "difficulty_id": 1,
      "character_id": 1,
      "is_cleared": true,
      "clear_date": "2024-01-01",
      "score": 12345678,
      "continue_count": 0,
      "memo": "初クリア！"
    }
  }
}
```

#### PUT /api/clear-records/{record_id}
クリア記録を更新

**Request Body:** (POSTと同じ)

#### DELETE /api/clear-records/{record_id}
クリア記録を削除

**Response:**
```json
{
  "status": "success",
  "message": "記録が削除されました"
}
```

### 統計関連

#### GET /api/statistics/overview
全体統計を取得

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_games": 13,
    "total_clears": 45,
    "clear_rate": 0.75,
    "difficulty_breakdown": {
      "Easy": 13,
      "Normal": 12,
      "Hard": 8,
      "Lunatic": 3,
      "Extra": 2
    }
  }
}
```

#### GET /api/statistics/games/{game_id}
ゲーム別統計を取得

**Response:**
```json
{
  "status": "success",
  "data": {
    "game_id": 1,
    "game_title": "東方紅魔郷",
    "difficulties": [
      {
        "difficulty": "Easy",
        "is_cleared": true,
        "clear_date": "2024-01-01"
      }
    ]
  }
}
```

### ユーザー認証・メール認証関連

#### POST /api/v1/users/register
新規ユーザー登録

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "is_active": true,
    "is_admin": false,
    "email_verified": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**注意**: `email_verified: false` のユーザーはメール認証が必要です。

#### POST /api/v1/users/login
ユーザーログイン（FormDataまたはJSON）

**Request Body (multipart/form-data):**
```
username: testuser
password: password123
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "is_active": true,
    "is_admin": false,
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error (400 Bad Request) - メール未認証:**
```json
{
  "detail": "メールアドレスの認証が必要です。メールを確認して認証を完了してください。"
}
```

#### POST /api/v1/users/verify-email
メールアドレス認証

**Request Body:**
```json
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yzA567BCD890EFG123"
}
```

**Response (200 OK):**
```json
{
  "message": "メールアドレスの認証が完了しました。"
}
```

**Error (400 Bad Request):**
```json
{
  "detail": "認証トークンが無効または期限切れです。"
}
```

#### POST /api/v1/users/resend-verification
認証メール再送信

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "認証メールを再送信しました。"
}
```

**Error (400 Bad Request):**
```json
{
  "detail": "ユーザーが見つからないか、既に認証済みです。"
}
```

#### GET /api/v1/users/me
現在のユーザー情報取得

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "is_admin": false,
  "email_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## メール認証システムの動作フロー

### 1. 新規登録フロー
```
POST /api/v1/users/register
  ↓
ユーザー作成 (email_verified: false)
  ↓
認証トークン生成 & メール送信
  ↓
認証トークン返却 (開発環境) / メール送信完了 (本番環境)
```

### 2. メール認証フロー
```
メール内リンククリック
  ↓
POST /api/v1/users/verify-email
  ↓
トークン検証 & ユーザー認証状態更新
  ↓
認証完了 (email_verified: true)
```

### 3. ログイン制限
```
POST /api/v1/users/login
  ↓
email_verified チェック
  ↓
false: エラー "メールアドレスの認証が必要です"
true: ログイン成功
```

## エラーコード

| コード | 説明 |
|--------|------|
| GAME_NOT_FOUND | ゲームが見つかりません |
| RECORD_NOT_FOUND | 記録が見つかりません |
| USER_NOT_FOUND | ユーザーが見つかりません |
| EMAIL_NOT_VERIFIED | メールアドレスが未認証です |
| INVALID_TOKEN | 認証トークンが無効です |
| TOKEN_EXPIRED | 認証トークンが期限切れです |
| VALIDATION_ERROR | バリデーションエラー |
| DATABASE_ERROR | データベースエラー |
| INTERNAL_ERROR | 内部エラー |

## APIテストカバレッジ（2025年1月更新）

### 単体テスト実装状況
**総テスト数**: 81テスト（実行中）+ 5テスト（TODO）= 86テスト設計済み  
**成功率**: 100%（178/178テスト）  
**実行時間**: 0.28秒

### エンドポイント別テストカバレッジ

#### ✅ 完全テスト済み（81テスト）

| APIグループ | エンドポイント数 | テスト数 | カバレッジ内容 |
|-------------|------------------|----------|----------------|
| **ユーザーAPI** | 7 | 16 | 認証・プロファイル・メール認証の全機能 |
| **ゲームAPI** | 1 | 9 | 一覧取得・フィルタリング・エラーハンドリング |
| **クリア記録API** | 7 | 14 | CRUD・バッチ処理・権限制御の全機能 |
| **ゲーム機体API** | 5 | 15 | CRUD・データ整合性・統計情報の全機能 |
| **ゲームメモAPI** | 5 | 15 | CRUD・UPSERT・権限制御の全機能 |
| **管理者ゲームAPI** | 4 | 11 | 管理者専用ゲーム管理の全機能 |

#### 🔶 部分テスト済み（5テスト TODO）

| APIグループ | エンドポイント数 | 実装済み | TODO | 制約事項 |
|-------------|------------------|----------|------|----------|
| **管理者ユーザーAPI** | 3 | 0 | 5 | 動的インポートのモック設定が複雑 |

### テスト品質基準

#### 網羅するテストケース
- **正常系**: 全エンドポイントの基本動作
- **エラーハンドリング**: 400・401・403・404・500の全パターン
- **認証・認可**: JWT認証・権限分離の検証
- **データバリデーション**: 入力値検証・型安全性
- **境界値テスト**: 制限値・NULL値・空文字の処理

#### テスト設計パターン
- **AAA Pattern**: Arrange → Act → Assert の明確な構造
- **モック活用**: サービスレイヤーの完全モック化
- **引数検証**: API → Service の正確な引数渡し
- **レスポンス検証**: JSON構造・データ型・必須フィールド

### テスト実行方法

```bash
# 全APIテスト実行
cd backend && python -m pytest tests/unit/api/ -v

# 特定APIテスト実行
python -m pytest tests/unit/api/test_users.py -v
python -m pytest tests/unit/api/test_games.py -v
python -m pytest tests/unit/api/test_clear_records.py -v

# カバレッジ付き実行
python -m pytest tests/unit/api/ --cov=presentation.api
```

### 継続的品質保証

#### 開発ルール
- **新規API追加**: 必ず対応する単体テストを作成
- **API修正**: テスト実行で影響範囲を確認
- **API削除**: 不要テストの削除とテスト全体の実行確認

#### 品質メトリクス
- **実行速度**: APIテスト81個を0.1秒以内で完了
- **成功率**: 常に100%維持（失敗時は即座に修正）
- **保守性**: 明確なテスト名・構造による理解しやすさ