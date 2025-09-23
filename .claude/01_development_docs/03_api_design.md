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

## エラーコード

| コード | 説明 |
|--------|------|
| GAME_NOT_FOUND | ゲームが見つかりません |
| RECORD_NOT_FOUND | 記録が見つかりません |
| VALIDATION_ERROR | バリデーションエラー |
| DATABASE_ERROR | データベースエラー |
| INTERNAL_ERROR | 内部エラー |