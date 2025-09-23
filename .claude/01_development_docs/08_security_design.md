# セキュリティ設計

## セキュリティ全体方針

### 基本方針
- **防御多層化**: 複数のセキュリティ対策を組み合わせ
- **最小権限原則**: ユーザーは必要最小限の権限のみ
- **データ保護**: 個人情報・認証情報の適切な管理
- **透明性**: セキュリティ仕様の明文化

### 脅威モデル
- **対象資産**: ユーザー認証情報、ゲームクリア記録
- **想定脅威**: XSS、CSRF、SQLインジェクション、認証回避
- **リスクレベル**: 中程度（金銭的損失なし、個人記録データ）

## 認証・認可システム

### パスワード管理
```python
# backend/infrastructure/security/password_hasher.py
class PasswordHasher:
    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=["argon2", "bcrypt"], 
            deprecated="auto",
            # Argon2設定（セキュリティと性能のバランス）
            argon2__memory_cost=65536,    # 64MB メモリ使用
            argon2__time_cost=3,          # 3回反復
            argon2__parallelism=1,        # 1並列処理
        )
```

**仕様:**
- **ハッシュ化**: Argon2id (推奨最新アルゴリズム)
- **ライブラリ**: argon2-cffi 23.1.0
- **設定**: メモリ64MB、3回反復、1並列
- **後方互換**: bcryptハッシュの検証も可能
- **セキュリティ**: GPU/ASIC攻撃耐性

### JWT認証
```python
# backend/infrastructure/security/jwt_handler.py
class JWTHandler:
    SECRET_KEY = "your-secret-key-here-change-in-production"
    ALGORITHM = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**仕様:**
- **アルゴリズム**: HS256 (HMAC-SHA256)
- **有効期限**: 30分
- **シークレットキー**: 本番環境は環境変数 `JWT_SECRET_KEY`
- **ペイロード**: `{"sub": username, "exp": timestamp}`

### メール認証システム

#### 認証トークン生成
```python
# backend/infrastructure/security/token_generator.py
def generate_verification_token() -> str:
    return secrets.token_urlsafe(48)  # 64文字の安全なトークン

def generate_token_with_expiry() -> Tuple[str, datetime]:
    token = generate_verification_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)
    return token, expires_at
```

**仕様:**
- **トークン形式**: URLセーフBase64エンコード（64文字）
- **生成方法**: `secrets.token_urlsafe(48)` (暗号学的に安全)
- **有効期限**: 24時間
- **データベース**: `verification_token`, `verification_token_expires_at`カラム
- **インデックス**: 高速検索のための`idx_users_verification_token`

#### メール送信セキュリティ
```python
# backend/infrastructure/email/email_service.py
class MockEmailService:  # 開発環境
    def send_verification_email(self, email: str, token: str) -> bool:
        verification_url = f"{self.base_url}?token={token}"
        # コンソールに出力（実際の送信なし）
        
class SMTPEmailService:  # 本番環境
    def send_verification_email(self, email: str, token: str) -> bool:
        # 実際のSMTP経由でメール送信
```

**セキュリティ対策:**
- **開発環境**: MockEmailService使用、実メール送信なし
- **本番環境**: SMTP認証（TLS暗号化必須）
- **URL構成**: `https://your-domain.com?token={secure_token}`
- **トークン漏洩対策**: 24時間自動期限切れ
- **再送信制限**: フロントエンドで60秒間隔制限

#### 認証フロー制限
```python
# backend/application/services/user_service.py
def authenticate_user(self, username: str, password: str) -> Optional[User]:
    # パスワード確認後
    if not user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="メールアドレスの認証が必要です。"
        )
```

**アクセス制御:**
- **未認証ユーザー**: ログイン完全拒否
- **登録時**: 自動ログインなし（認証必須）
- **認証後**: 通常通りJWT発行
- **トークン検証**: 期限・形式の厳密チェック

### 権限管理
```python
# domain/entities/user.py
@dataclass
class User:
    is_admin: bool = False
```

**権限レベル:**
- **一般ユーザー**: 自分の情報・記録のみ管理
- **管理者**: 全ユーザー・ゲーム作品管理権限

## フロントエンドセキュリティ

### トークン管理
```typescript
// frontend/src/contexts/AuthContext.tsx
// LocalStorageに保存
localStorage.setItem('auth_token', access_token);
localStorage.setItem('user', JSON.stringify(user));

// ログアウト時クリア
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
```

**仕様:**
- **保存場所**: LocalStorage
- **自動復元**: ページリロード時の認証状態復元
- **クリア**: ログアウト・認証エラー時の自動削除

### XSS対策
**実装状況:**
- ✅ `dangerouslySetInnerHTML` 未使用
- ✅ React標準エスケープ機能 (`{}` 記法)
- ✅ TypeScript型安全性 (37個のinterface定義)
- ✅ 動的クラス名の安全な構築

```tsx
// 安全な実装例
<div className={gameTypeStyles[game.game_type] || gameTypeStyles.default}>
  {game.title} {/* 自動エスケープ */}
</div>
```

### CSRFの考慮
- **SameSite Cookie**: 現在未実装 (LocalStorageのため)
- **CSRF Token**: 現在未実装 (ステートレス認証のため)
- **Origin Verification**: CORSで制御

## バックエンドセキュリティ

### SQLインジェクション対策
```python
# SQLAlchemy ORMによる自動エスケープ
session.query(Game).filter(Game.id == game_id).first()
```

**仕様:**
- **ORM使用**: SQLAlchemy 1.4.54
- **パラメータ化クエリ**: 自動的に適用
- **生SQL禁止**: ORMメソッドのみ使用

### 入力値検証
```python
# presentation/schemas/user_schema.py
class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=6)
```

**仕様:**
- **バリデーション**: Pydantic 2.11.9
- **文字列長制限**: username(1-50文字), password(6文字以上)
- **型チェック**: 自動的な型変換・検証

### CORS設定
```python
# main.py (予定)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのみ
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## セキュリティ設定

### 環境別設定
**開発環境:**
- HTTP通信可
- LocalStorage使用
- コンソールログ出力

**本番環境 (予定):**
- HTTPS必須
- 環境変数からシークレット取得
- ログレベル制限

### シークレット管理
```bash
# 本番環境での環境変数設定例
export JWT_SECRET_KEY="production-secret-key-256-bits"
export DATABASE_URL="postgresql://user:pass@host:port/db"
```

## セキュリティ監査結果

### 実装済み対策
✅ **認証システム**
- Argon2パスワードハッシュ化（最新推奨アルゴリズム）
- JWT認証 (30分有効期限)
- 認証状態管理

✅ **XSS対策**
- React自動エスケープ
- TypeScript型安全性
- 危険なDOM操作の回避

✅ **SQLインジェクション対策**
- SQLAlchemy ORM使用
- パラメータ化クエリ

✅ **入力値検証**
- Pydanticバリデーション
- フロントエンド型チェック

### 今後の強化ポイント
🔄 **リフレッシュトークン**
- HttpOnly Cookie実装
- トークンローテーション

🔄 **CSP (Content Security Policy)**
- XSS攻撃の追加防御
- script-src, style-src制限

🔄 **レート制限**
- API呼び出し頻度制限
- ブルートフォース攻撃対策

🔄 **ログ監視**
- 異常なアクセスパターン検出
- セキュリティイベント記録

## 運用セキュリティ

### 定期的な監査項目
- [ ] 依存関係の脆弱性チェック (`npm audit`, `pip-audit`)
- [ ] トークン有効期限の適切性確認
- [ ] ログの異常パターン監視
- [ ] セキュリティ設定の見直し

### インシデント対応
1. **検出**: ログ監視・異常通知
2. **分析**: 攻撃手法・影響範囲の特定  
3. **対応**: 緊急パッチ・アカウント無効化
4. **復旧**: システム修復・動作確認
5. **改善**: 再発防止策の実装

## セキュリティテスト

### 単体テスト（実装済み）
- パスワードハッシュ化機能
- JWT生成・検証機能
- 認証ミドルウェア
- バリデーション機能

### 統合テスト（予定）
- エンドツーエンド認証フロー
- 権限チェック機能
- CORS設定検証
- エラーハンドリング

### ペネトレーションテスト（予定）
- XSS攻撃シミュレーション
- SQLインジェクション試行
- 認証回避試行
- CSRF攻撃シミュレーション