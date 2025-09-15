# フロントエンドアーキテクチャ

## アーキテクチャ概要

### Feature-Based Architecture + React Context
フロントエンドは機能別モジュール（Feature-Based）とReact Context APIを組み合わせた設計を採用。

```
src/
├── components/         # 再利用可能UIコンポーネント
├── features/           # 機能別モジュール（DDD的思考）
├── contexts/           # グローバル状態管理
├── services/           # API通信・外部連携
├── types/              # 型定義（JSDoc）
└── utils/              # ユーティリティ関数
```

## 実装済み認証システム

### 1. AuthContext（認証状態管理）

**場所**: `src/contexts/AuthContext.js`

**状態構造**:
```javascript
{
  user: User | null,        // ユーザー情報
  token: string | null,     // JWTトークン
  isLoading: boolean,       // ローディング状態
  error: string | null,     // エラーメッセージ
}
```

**提供メソッド**:
- `login(credentials)` - ログイン処理
- `register(userData)` - ユーザー登録
- `logout()` - ログアウト
- `checkAuth()` - 認証状態確認・自動復元

### 2. API通信設定

**場所**: `src/services/api.js`

**機能**:
- Axiosインスタンス設定
- リクエストインターセプター（トークン自動付与）
- レスポンスインターセプター（401エラー時自動ログアウト）
- proxy設定でlocalhost:8000にリダイレクト

### 3. 認証API

**場所**: `src/features/auth/services/authApi.js`

**エンドポイント**:
- `register(registerData)` - ユーザー登録
- `login(credentials)` - ログイン（FormData形式）
- `getCurrentUser()` - 現在のユーザー情報取得
- `updateUser(userData)` - ユーザー情報更新
- `deleteAccount()` - アカウント削除

## UIコンポーネント設計

### 1. 共通コンポーネント

**Button** (`src/components/common/Button.js`):
```javascript
<Button 
  variant="primary|secondary|danger|outline"
  size="small|medium|large"
  loading={boolean}
  disabled={boolean}
>
  テキスト
</Button>
```

**Input** (`src/components/common/Input.js`):
```javascript
<Input
  label="ラベル"
  type="text|email|password"
  value={value}
  onChange={onChange}
  error="エラーメッセージ"
  required={boolean}
/>
```

### 2. 認証コンポーネント

**LoginForm** (`src/features/auth/components/LoginForm.js`):
- ログインフォーム
- バリデーション機能
- エラー表示

**RegisterForm** (`src/features/auth/components/RegisterForm.js`):
- ユーザー登録フォーム
- パスワード確認機能
- メール形式バリデーション

**AuthPage** (`src/features/auth/components/AuthPage.js`):
- ログイン・登録画面の切り替え
- 統一されたレイアウト

## 状態管理パターン

### 1. グローバル状態（Context API）
```javascript
// 認証状態のみグローバル管理
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // ...
};
```

### 2. ローカル状態（useState）
```javascript
// フォーム状態などはローカル管理
const [formData, setFormData] = useState({
  username: '',
  password: '',
});
```

### 3. 永続化（LocalStorage）
```javascript
// トークンとユーザー情報を永続化
localStorage.setItem('auth_token', token);
localStorage.setItem('user', JSON.stringify(user));
```

## エラーハンドリング

### 1. API エラー
```javascript
// 401エラー時の自動処理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // トークンクリア + ログイン画面へ
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. フォームバリデーション
```javascript
const validateForm = () => {
  const errors = {};
  if (!formData.username.trim()) {
    errors.username = 'ユーザー名を入力してください';
  }
  // ...
  return Object.keys(errors).length === 0;
};
```

## スタイリング（Tailwind CSS）

### 設定
- **Tailwind CSS v3.4.17**（安定版）
- PostCSS + Autoprefixer
- レスポンシブ対応

### 使用パターン
```javascript
// ユーティリティクラス中心
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    // ...
  </div>
</div>
```

## セキュリティ考慮事項

### 1. トークン管理
- JWTトークンをLocalStorageに保存
- 自動期限切れ処理
- ログアウト時の確実なクリア

### 2. 入力検証
- フロントエンド側バリデーション
- XSS対策（React標準のエスケープ）
- CSRF対策（SameSite Cookie設定）

### 3. API通信
- HTTPS前提の設計
- 機密情報のログ出力禁止
- エラーメッセージの適切な抽象化

## 次回実装予定

### ゲーム一覧機能
```
src/features/games/
├── components/
│   ├── GameList.js       # ゲーム一覧表示
│   ├── GameCard.js       # ゲーム個別カード
│   └── GameFilter.js     # 検索・フィルター
├── hooks/
│   └── useGames.js       # ゲーム一覧取得フック
└── services/
    └── gameApi.js        # ゲームAPI通信
```

### クリア状況管理機能
```
src/features/clearStatus/
├── components/
│   ├── ClearForm.js      # クリア状況登録フォーム
│   ├── ClearList.js      # クリア状況一覧
│   └── DifficultyBadge.js # 難易度バッジ
├── hooks/
│   └── useClearStatus.js # クリア状況管理フック
└── services/
    └── clearApi.js       # クリア状況API通信
```