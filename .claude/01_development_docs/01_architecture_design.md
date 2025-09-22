# アーキテクチャ設計

## システム構成
```
[フロントエンド: React] <--HTTP--> [バックエンド: FastAPI] <---> [データベース: SQLite]
```

## 技術スタック
- **フロントエンド**: React 18.2.0, axios, CSS
- **バックエンド**: FastAPI 0.117.1, uvicorn, SQLAlchemy 1.4.54, Pydantic 2.11.9
- **認証**: JWT (python-jose), bcrypt, passlib
- **データベース**: SQLite（開発環境）
- **テスト**: pytest 8.3.4, pytest-mock, pytest-asyncio
- **Python**: 3.13.5

## バックエンドアーキテクチャ（DDD/クリーンアーキテクチャ）
```
backend/
├── main.py                  # FastAPIアプリのエントリーポイント
├── domain/                  # ドメイン層
│   ├── __init__.py
│   ├── entities/           # エンティティ
│   │   ├── __init__.py
│   │   ├── user.py         # ユーザーエンティティ
│   │   ├── game.py         # ゲームエンティティ
│   │   └── clear_record.py # クリア記録エンティティ
│   ├── repositories/       # リポジトリインターフェース
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── game_repository.py
│   │   └── clear_record_repository.py
│   └── value_objects/      # 値オブジェクト
│       ├── __init__.py
│       └── difficulty.py
├── application/            # アプリケーション層
│   ├── __init__.py
│   ├── services/          # アプリケーションサービス
│   │   ├── __init__.py
│   │   ├── user_service.py     # ユーザー管理サービス
│   │   ├── game_service.py     # ゲーム管理サービス
│   │   └── clear_record_service.py # クリア記録管理サービス
│   └── dtos/              # データ転送オブジェクト
│       ├── __init__.py
│       ├── user_dto.py         # ユーザーDTO
│       ├── game_dto.py         # ゲームDTO
│       └── clear_record_dto.py # クリア記録DTO
├── infrastructure/        # インフラストラクチャ層
│   ├── __init__.py
│   ├── database/         # データベース関連
│   │   ├── __init__.py
│   │   ├── connection.py # SQLite接続設定
│   │   ├── models/       # SQLAlchemyモデル
│   │   │   ├── __init__.py
│   │   │   ├── user_model.py      # ユーザーモデル
│   │   │   ├── game_model.py      # ゲームモデル
│   │   │   └── clear_record_model.py # クリア記録モデル
│   │   └── repositories/ # リポジトリ実装
│   │       ├── __init__.py
│   │       ├── user_repository_impl.py
│   │       ├── game_repository_impl.py
│   │       └── clear_record_repository_impl.py
│   └── security/         # セキュリティ関連
│       ├── __init__.py
│       ├── auth_middleware.py  # JWT認証ミドルウェア
│       ├── password_hasher.py  # パスワードハッシュ化
│       └── jwt_handler.py      # JWTトークン処理
├── presentation/          # プレゼンテーション層
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── users.py       # ユーザーAPI（自分の情報のみ）
│   │   │   ├── games.py       # ゲームAPI（読み取り専用）
│   │   │   ├── clear_records.py # クリア記録API
│   │   │   └── admin.py       # 管理者専用API
│   │   └── dependencies.py    # 依存関係注入
│   └── schemas/           # Pydanticスキーマ
│       ├── __init__.py
│       ├── user_schema.py     # ユーザースキーマ
│       ├── game_schema.py     # ゲームスキーマ
│       └── clear_record_schema.py # クリア記録スキーマ
├── scripts/              # マイグレーション・ユーティリティ
│   ├── __init__.py
│   ├── migrate_database.py    # 初期DB作成
│   └── add_admin_flag.py      # 管理者権限追加
└── tests/                # テスト
    ├── conftest.py          # テスト共通設定
    ├── pytest.ini          # pytest設定
    ├── requirements-dev.txt # テスト依存関係
    ├── unit/               # 単体テスト（実装済み）
    │   ├── services/       # サービス層テスト
    │   └── repositories/   # リポジトリ層テスト
    └── integration/        # 統合テスト（未実装）
        ├── api/           # APIエンドポイントテスト
        ├── database/      # DB統合テスト
        └── auth/          # 認証統合テスト
```

## フロントエンドアーキテクチャ（Feature-Based Architecture）
```
frontend/
├── src/
│   ├── components/         # 再利用可能UIコンポーネント
│   │   ├── common/        # Button, Input, Modal等
│   │   └── layout/        # Header, Navigation等
│   ├── features/          # 機能別モジュール（DDD的）
│   │   ├── auth/          # 認証機能
│   │   │   ├── components/    # LoginForm, RegisterForm等
│   │   │   ├── hooks/         # カスタムフック
│   │   │   └── services/      # authApi.js
│   │   ├── games/         # ゲーム管理機能（実装予定）
│   │   └── clearRecords/  # クリア記録機能
│   ├── contexts/          # グローバル状態管理
│   │   └── AuthContext.js # 認証状態管理
│   ├── services/          # 共通API設定
│   │   └── api.js         # Axios設定・トークン管理
│   ├── types/             # 型定義（JSDoc）
│   ├── utils/             # ユーティリティ関数
│   └── App.js             # ルーティング・レイアウト
├── package.json
└── tailwind.config.js     # Tailwind CSS設定
```

## プロジェクト全体構成
```
touhou_clear_checker/
├── backend/               # DDD/Clean Architecture
├── frontend/              # Feature-Based + React Context
└── .claude/              # Claude用ドキュメント
```

## APIエンドポイント設計

### 公開API（認証不要）
- `POST /api/v1/users/register` - ユーザー登録
- `POST /api/v1/users/login` - ログイン

### 一般ユーザーAPI（認証必要）
- `GET /api/v1/users/me` - 自分の情報取得
- `PUT /api/v1/users/me` - 自分の情報更新
- `DELETE /api/v1/users/me` - 自分のアカウント削除
- `GET /api/v1/games` - ゲーム一覧取得
- `GET /api/v1/games/{id}` - ゲーム詳細取得
- `GET/POST/PUT/DELETE /api/v1/clear-records` - クリア記録管理

### 管理者専用API（管理者権限必要）
- `GET /api/v1/admin/users` - 全ユーザー一覧
- `PUT /api/v1/admin/users/{id}` - 任意ユーザー更新
- `DELETE /api/v1/admin/users/{id}` - 任意ユーザー削除
- `POST/PUT/DELETE /api/v1/admin/games` - ゲーム作品管理

## 権限システム
- **一般ユーザー**: 自分の情報とクリア記録のみ管理可能
- **管理者**: 全ユーザー管理 + ゲーム作品管理権限

## フロントエンド状態管理

### 認証状態（AuthContext）
```javascript
const authState = {
  user: User | null,           // 現在のユーザー
  token: string | null,        // JWTトークン
  isLoading: boolean,          // ローディング状態
  error: string | null,        // エラーメッセージ
  // メソッド
  login: (credentials) => {},
  register: (userData) => {},
  logout: () => {},
  checkAuth: () => {}
}
```

### API通信
- **Axios インターセプター**: 自動トークン付与・認証エラー処理
- **LocalStorage**: トークン・ユーザー情報の永続化
- **エラーハンドリング**: 401エラー時の自動ログアウト

## 実装済み機能

### バックエンド
✅ **アーキテクチャ**
- DDD/クリーンアーキテクチャ
- レイヤー分離（ドメイン・アプリケーション・インフラ・プレゼンテーション）
- 依存性注入

✅ **API**
- ユーザー管理API（認証・CRUD）
- ゲーム管理API
- クリア記録管理API
- 管理者専用API

✅ **テスト**
- 単体テスト（37テスト、サービス層・リポジトリ層）
- pytest + モック化
- 高速実行（0.08秒）

### フロントエンド
✅ **認証システム**
- ユーザー登録・ログイン
- JWT認証・状態管理
- 認証ガード・自動復元

✅ **UIコンポーネント**
- 再利用可能Button・Input
- ログイン・登録フォーム
- バリデーション・エラー表示

✅ **レイアウト**
- レスポンシブデザイン
- ダッシュボード（認証後）
- 管理者バッジ表示

### 実装予定
🔄 **統合テスト**（API・DB・認証）
🔄 **ゲーム一覧表示機能**
🔄 **クリア状況管理機能**
🔄 **管理者画面**