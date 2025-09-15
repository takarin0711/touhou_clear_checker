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

## 実装済み機能

### 1. ゲーム一覧機能
```
src/features/games/
├── components/
│   ├── GameList.js       # ゲーム一覧表示（グリッドレイアウト）
│   ├── GameCard.js       # ゲーム個別カード
│   ├── GameDetail.js     # ゲーム詳細・クリア状況管理画面
│   └── GameFilter.js     # 検索・フィルター（将来実装予定）
├── hooks/
│   └── useGames.js       # ゲーム一覧取得・フィルター管理フック
└── services/
    └── gameApi.js        # ゲームAPI通信
```

**主要機能**:
- 全ゲーム一覧表示（カードベース）
- ゲーム詳細表示
- 「クリア状況を編集」機能
- レスポンシブデザイン

### 2. クリア状況管理機能
```
src/features/clearStatus/
├── components/
│   ├── ClearStatusSummary.js   # メイン画面クリア状況まとめ
│   ├── ClearStatusForm.js      # クリア状況登録・編集フォーム
│   ├── ClearStatusCard.js      # クリア状況個別カード
│   ├── DifficultyBadge.js      # 難易度バッジ
│   └── index.js                # コンポーネント集約
├── hooks/
│   └── useClearStatus.js       # クリア状況管理フック
└── services/
    └── clearStatusApi.js       # クリア状況API通信
```

**主要機能**:
- **クリア状況まとめ表示**：全ゲームを俯瞰できるメイン画面
- **ゲーム固有難易度制限**：妖々夢のPhantasm、獣王園のExtra制限など
- **リアルタイム更新**：クリア状況変更時の自動反映
- **詳細クリア条件**：ノーコンティニュー・ノーボム・ノーミス記録
- **日付管理**：タイムゾーン問題解決済み

### 3. 共通コンポーネント拡張
**Badge** (`src/components/common/Badge.js`):
```javascript
<Badge 
  variant="primary|secondary|success|warning|danger|purple"
  size="small|medium|large"
>
  テキスト
</Badge>
```

## 状態管理パターン（実装済み）

### 1. リアルタイム更新システム
```javascript
// イベントベースの状態同期
const emitClearStatusUpdate = () => {
  window.dispatchEvent(new Event('clearStatusUpdated'));
};

// グローバルイベントリスナー
useEffect(() => {
  const handleUpdate = () => refetchClearStatuses();
  window.addEventListener('clearStatusUpdated', handleUpdate);
  return () => window.removeEventListener('clearStatusUpdated', handleUpdate);
}, []);
```

### 2. カスタムフック活用
```javascript
// ゲーム管理
const { games, loading, error, applyFilters } = useGames();

// クリア状況管理  
const { 
  clearStatuses, 
  createClearStatus, 
  updateClearStatus,
  deleteClearStatus,
  refetch 
} = useClearStatus(gameId);
```

## 次回実装予定

### 管理者画面
```
src/features/admin/
├── components/
│   ├── AdminDashboard.js    # 管理者ダッシュボード
│   ├── UserManagement.js    # ユーザー管理
│   └── GameManagement.js    # ゲーム作品管理
└── services/
    └── adminApi.js          # 管理者API通信
```

### 統計・分析機能
```
src/features/analytics/
├── components/
│   ├── StatsDashboard.js    # 統計ダッシュボード
│   ├── ProgressChart.js     # 進捗グラフ
│   └── ClearRateChart.js    # クリア率グラフ
└── hooks/
    └── useStats.js          # 統計データ取得
```