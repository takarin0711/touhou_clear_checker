# フロントエンドアーキテクチャ（TypeScript + React）

## アーキテクチャ概要

### Feature-Based Architecture + React Context + TypeScript
フロントエンドは機能別モジュール（Feature-Based）とReact Context API、TypeScriptを組み合わせた設計を採用。

```
src/
├── components/         # 再利用可能UIコンポーネント（.tsx）
├── features/           # 機能別モジュール（DDD的思考）（.tsx）
├── contexts/           # グローバル状態管理（.tsx）
├── services/           # API通信・外部連携（.ts）
├── types/              # TypeScript型定義（.ts）
├── hooks/              # カスタムフック（.ts）
└── utils/              # ユーティリティ関数（.ts）
```

### TypeScript化完了（2025年1月）
- **全ファイル変換**: 全.jsファイルを.ts/.tsxに変換
- **型定義**: 37個のinterfaceと型定義を追加
- **型安全性**: コンパイル時エラー検出
- **開発体験**: IDEでの自動補完・リファクタリング支援

## 実装済み認証システム

### 1. AuthContext（認証状態管理）

**場所**: `src/contexts/AuthContext.tsx`

**型定義**:
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}
```

**提供メソッド**:
- `login(credentials: LoginCredentials)` - ログイン処理
- `register(userData: RegisterData)` - ユーザー登録
- `logout()` - ログアウト
- `checkAuth()` - 認証状態確認・自動復元

### 2. API通信設定

**場所**: `src/services/api.ts`

**機能**:
- Axiosインスタンス設定
- リクエストインターセプター（トークン自動付与）
- レスポンスインターセプター（401エラー時自動ログアウト）
- proxy設定でlocalhost:8000にリダイレクト

### 3. 認証API

**場所**: `src/features/auth/services/authApi.ts`

**型安全なエンドポイント**:
- `register(registerData: RegisterData): Promise<AuthResponse>` - ユーザー登録
- `login(credentials: LoginCredentials): Promise<AuthResponse>` - ログイン（FormData形式）
- `getCurrentUser(): Promise<User>` - 現在のユーザー情報取得
- `updateUser(userData: Partial<User>): Promise<User>` - ユーザー情報更新
- `deleteAccount(): Promise<void>` - アカウント削除

## UIコンポーネント設計

### 1. 型安全な共通コンポーネント

**Button** (`src/components/common/Button.tsx`):
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

<Button 
  variant="primary"
  size="medium"
  onClick={handleClick}
>
  テキスト
</Button>
```

**Input** (`src/components/common/Input.tsx`):
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

<Input
  label="ラベル"
  type="email"
  value={value}
  onChange={handleChange}
  error="エラーメッセージ"
/>
```

**Badge** (`src/components/common/Badge.tsx`):
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  size?: 'small' | 'medium' | 'large';
}
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

### 2. クリア記録管理機能
```
src/features/clearRecords/
├── components/
│   ├── IndividualTabClearForm.js # 機体別クリア記録登録フォーム
│   └── index.js                  # コンポーネント集約
├── hooks/
│   └── useClearRecords.js        # クリア記録管理フック
└── services/
    └── clearRecordsApi.js        # クリア記録API通信
```

**主要機能**:
- **機体別クリア記録登録**：機体ごとに個別の条件（クリア・ノーコン・ノーボム・ノーミス・フルスペカ）を選択可能
- **ゲーム固有難易度制限**：妖々夢のPhantasm、獣王園のExtra制限など
- **リアルタイム更新**：クリア状況変更時の自動反映
- **詳細クリア条件**：ノーコンティニュー・ノーボム・ノーミス記録
- **日付管理**：タイムゾーン問題解決済み
- **適応的UI表示**：難易度に応じたクリア条件の動的表示制御

#### クリア条件の表示制御

各ゲームの特性に応じて、利用可能なクリア条件のみを表示する：

1. **ノーコンティニュー**
   - 紺珠伝の完全無欠モード以外で表示
   - チェックポイント制のモードでは非表示
   - Extra/Phantasmステージでは非表示（コンティニュー不可のため）
   - 難易度切り替え時にリアルタイムで表示/非表示が切り替わる

2. **フルスペルカード**
   - 対戦型STG以外で表示
   - 秘封ナイトメアダイアリーなどでは非表示

### 機体別個別条件登録フォーム

#### 概要
各難易度・機体ごとにクリア条件を詳細に設定するフォーム。

#### 主な機能
- 難易度タブ切り替え
- 機体ごとのクリア条件設定（クリア、ノーコン、ノーボム、ノーミス、フルスペカ）
- モード選択（紺珠伝のみ）
- バルク操作（全機体一括設定）

#### 表示制御ロジック
- **ノーコンティニュー列**: 現在選択中の難易度でコンティニューが可能な場合のみ表示
  - Easy/Normal/Hard/Lunatic: 表示
  - Extra/Phantasm: 非表示（テーブル列自体が削除される）
- **テーブル構造**: 難易度切り替え時にヘッダーとセルが同期して表示/非表示切り替え

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
const emitClearRecordsUpdate = () => {
  window.dispatchEvent(new Event('clearRecordsUpdated'));
};

// グローバルイベントリスナー
useEffect(() => {
  const handleUpdate = () => refetchClearRecords();
  window.addEventListener('clearRecordsUpdated', handleUpdate);
  return () => window.removeEventListener('clearRecordsUpdated', handleUpdate);
}, []);
```

### 2. カスタムフック活用
```javascript
// ゲーム管理
const { games, loading, error, applyFilters } = useGames();

// クリア記録管理  
const { 
  clearRecords, 
  createClearRecord, 
  updateClearRecord,
  deleteClearRecord,
  refetch 
} = useClearRecords(gameId);
```

## TypeScript型定義システム

### 主要な型定義ファイル

**認証系** (`src/types/auth.ts`):
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}
```

**ゲーム系** (`src/types/game.ts`):
```typescript
export interface Game {
  id: number;
  title: string;
  series_number: number;
  release_year: number;
  game_type: string;
}

export interface GameFilter {
  series_number?: number | null;
  game_type?: string | null;
  search?: string | null;
}
```

**クリア記録系** (`src/types/clearRecord.ts`):
```typescript
export interface ClearRecord {
  id?: number;
  user_id: number;
  game_id: number;
  character_id: number;
  difficulty: string;
  mode?: string;
  character_name?: string;
  is_clear: boolean;
  is_no_continue: boolean;
  is_no_bomb: boolean;
  is_no_miss: boolean;
  is_full_spell: boolean;
  // 特殊クリア条件...
}
```

## テスト環境・テスト戦略

### 単体テスト（Unit Test）✅実装済み
**実装状況**: 143テスト（コンポーネント56 + フック79 + APIサービス8）

#### 技術スタック
- **React Testing Library 16.0.0**: コンポーネントテストライブラリ
- **Jest 27.5.1**: JavaScript/TypeScriptテストフレームワーク
- **@testing-library/jest-dom 6.4.2**: DOM要素のアサーション拡張
- **@testing-library/user-event 14.5.2**: ユーザーインタラクションシミュレーション

#### 主要テストファイル
**共通コンポーネントテスト**:
- `Button.test.tsx` (16テスト): バリアント、サイズ、クリックイベント、ローディング状態
- `Input.test.tsx` (17テスト): バリデーション、エラー表示、フォーム連携
- `Badge.test.tsx` (16テスト): バリアント、サイズ、条件付きレンダリング
- `GameCard.test.tsx` (17テスト): ゲーム情報表示、クリックイベント、バッジ表示

**認証システムテスト**:
- `AuthContext.test.tsx` (19テスト): ログイン、登録、ログアウト、状態管理
- `LoginForm.test.tsx` (13テスト): バリデーション、フォーム送信、エラー処理
- `authApi.test.ts` (4テスト): API通信、レスポンス処理

**カスタムフックテスト**:
- `useCharacters.test.ts` (26テスト): CRUD操作、検索、状態管理
- `useClearRecords.test.ts` (23テスト): クリア記録管理、機体別条件送信
- `useGames.test.ts` (19テスト): ゲーム一覧、フィルタリング、ソート

**APIサービステスト**:
- `gameApi.test.ts` (11テスト): ゲーム一覧取得、詳細情報取得
- `clearRecordApi.test.ts` (23テスト): CRUD操作、バッチ処理、機体別条件送信
- `characterApi.test.ts` (8テスト): キャラクター管理、権限テスト

#### テスト実行コマンド
```bash
# 全テスト実行
cd frontend && npm test

# カバレッジレポート付き実行
npm test -- --coverage

# 特定ファイルのテスト実行
npm test Button.test.tsx

# テストファイル監視モード（開発時）
npm test -- --watch

# CI環境用（非インタラクティブ）
npm test -- --ci --coverage --watchAll=false
```

#### テスト原則
- **ユーザー中心のテスト**: 実際のユーザー操作パターンを重視
- **モック戦略**: axios、localStorage、外部依存関係を完全モック
- **型安全テスト**: TypeScriptでの型安全なテストコード
- **エラーハンドリング**: 正常系・異常系・境界値を包括的にテスト

#### Mock設定 (`setupTests.ts`)
```typescript
// axios の完全モック
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }))
  }
}));

// localStorage の完全モック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

### TypeScript開発環境

**tsconfig.json設定**:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": false,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

**型チェック・ビルド**:
- `npm run build` - 型チェック＋ビルド
- `npx tsc --noEmit` - 型チェックのみ
- ESLint警告のみ残存（機能に影響なし）

### 開発時の注意事項

**ブラウザキャッシュ問題**:
- TypeScript移行後、ブラウザのキャッシュによりindex.jsエラーが発生する場合がある
- 解決方法：ハードリフレッシュ（Cmd+Shift+R）またはシークレットモードでアクセス

**型安全性の恩恵**:
- コンパイル時エラー検出
- IDEでの自動補完・リファクタリング支援
- プロップスや関数の型安全性
- null/undefined安全性

## 次回実装予定

### 管理者画面（TypeScript化済み）
```
src/features/admin/
├── components/
│   ├── AdminDashboard.tsx   # 管理者ダッシュボード
│   ├── UserManagement.tsx   # ユーザー管理
│   └── GameManagement.tsx   # ゲーム作品管理
└── services/
    └── adminApi.ts          # 管理者API通信
```

### 統計・分析機能（TypeScript化済み）
```
src/features/analytics/
├── components/
│   ├── StatsDashboard.tsx   # 統計ダッシュボード
│   ├── ProgressChart.tsx    # 進捗グラフ
│   └── ClearRateChart.tsx   # クリア率グラフ
└── hooks/
    └── useStats.ts          # 統計データ取得
```