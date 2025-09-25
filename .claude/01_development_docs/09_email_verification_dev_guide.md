# メール認証システム開発・運用ガイド

## システム概要

メール認証システムは、新規ユーザー登録時にメールアドレスの有効性を確認し、認証済みユーザーのみログインを許可するセキュリティ機能です。

### 実装アーキテクチャ（2025年9月レイヤード化対応）
- **Application層**: EmailService（ビジネスロジック）
- **Infrastructure層**: SMTPEmailSender（SMTP技術実装）、MockEmailSender（開発用モック）
- **バックエンド**: FastAPI + SQLAlchemy + レイヤード設計
- **フロントエンド**: React + TypeScript + カスタムURL処理
- **データベース**: SQLite (usersテーブル拡張)
- **認証方式**: 64文字の安全なトークン + 24時間有効期限

### 環境別動作
- **開発環境**: MockEmailSender（実メール送信なし、コンソール出力）
- **本番環境**: SMTPEmailSender（実際のメール送信）

## 開発環境でのテスト手順

### 前提条件
- バックエンドサーバーが起動している（port 8000）
- フロントエンドサーバーが起動している（port 3000）
- データベースが初期化されている（`python scripts/initialize_database.py --fresh`）

### テスト手順

### Step 1: 新規ユーザー登録

1. ブラウザで `http://localhost:3000` にアクセス
2. 「新規登録」タブをクリック
3. 以下のような情報を入力：
   ```
   ユーザー名: testuser001
   メールアドレス: test001@example.com
   パスワード: password123
   パスワード確認: password123
   ```
4. 「登録」ボタンをクリック
5. メール認証待ち画面が表示される

### Step 2: 認証トークンの確認

バックエンドディレクトリで以下のコマンドを実行：

#### 特定ユーザーの認証URLを確認

```bash
cd backend
source venv313/bin/activate
# ユーザー名をtestuser001に置き換えてください
python scripts/email_verification_helper.py --show-url testuser001
```

#### 最新の未認証ユーザーの認証URLを確認

```bash
python scripts/email_verification_helper.py --show-latest-url
```

#### 全未認証ユーザーを一覧表示

```bash
python scripts/email_verification_helper.py --list-unverified
```

### Step 3: メール認証実行

1. Step 2で表示された認証URLをコピー
2. ブラウザのアドレスバーにペーストしてアクセス
3. メール認証ページが表示される
4. 認証処理が実行される
5. 成功/失敗のメッセージが表示される

### Step 4: 認証状態確認

認証後の状態を確認：

```bash
# ユーザー名をtestuser001に置き換えてください
python scripts/email_verification_helper.py --check-status testuser001
```

### Step 5: ログインテスト

#### 5-1: 未認証時のログイン（エラー確認）

1. `http://localhost:3000` にアクセス
2. 「ログイン」タブをクリック
3. 登録したユーザー情報でログイン試行
4. **期待結果**: メール未認証エラーが表示され、「認証メールを再送信」ボタンが表示される

#### 5-2: 認証後のログイン（成功確認）

1. メール認証完了後、同じ画面でログイン
2. **期待結果**: ログイン成功し、東方ゲーム一覧画面が表示される

## フロー全体

```
新規登録 → メール認証待ち画面
    ↓
コマンドで認証URL確認
    ↓
認証URLにアクセス → 認証完了画面
    ↓
ログイン → アプリケーション利用開始
```

## トラブルシューティング

### 認証URLでエラーが出る場合

- URLが正しくコピーされているか確認
- トークンが24時間以内のものか確認（スクリプトで有効期限を表示）
- バックエンド・フロントエンドサーバーが動いているか確認

### ユーザーが見つからない場合

- ユーザー名のスペルを確認
- 実際に登録が完了しているか確認（`--list-unverified`で一覧確認）

### メール再送信テスト

1. ログイン画面でメール未認証エラーを表示
2. 「認証メールを再送信」ボタンをクリック
3. スクリプトで新しい認証URLを確認：
   ```bash
   python scripts/email_verification_helper.py --show-url ユーザー名
   ```
4. 新しいURLでメール認証を実行

### 期限切れトークンのクリーンアップ

開発環境で期限切れトークンがたまった場合：

```bash
python scripts/email_verification_helper.py --cleanup-expired
```

## 本番環境運用ガイド

### 環境変数設定
本番環境で実際のメール送信を行う場合は、以下の環境変数を設定：

```bash
export ENVIRONMENT=production
export SMTP_SERVER=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export FROM_EMAIL=your-email@gmail.com
export BASE_URL=https://your-domain.com
```

### セキュリティ考慮事項
- **SMTP認証**: TLS暗号化必須
- **アプリパスワード**: 通常のパスワードではなくアプリ専用パスワードを使用
- **BASE_URL**: HTTPS必須（HTTPは本番環境で禁止）
- **メール送信頻度**: 再送信間隔制限（60秒）
- **トークン管理**: 24時間の自動期限切れ

### 監視・メンテナンス
- **メール送信ログ**: SMTP送信成功/失敗の記録
- **トークン有効期限**: 期限切れトークンの定期クリーンアップ
  ```bash
  python scripts/email_verification_helper.py --cleanup-expired
  ```
- **未認証ユーザー監視**: 長期間未認証ユーザーの確認
  ```bash
  python scripts/email_verification_helper.py --list-unverified
  ```

## メール認証支援スクリプト一覧

`backend/scripts/email_verification_helper.py` の主要機能：

| コマンド | 機能 | 使用例 |
|---------|------|----------|
| `--show-url <username>` | 特定ユーザーの認証URL表示 | `--show-url testuser001` |
| `--show-latest-url` | 最新未認証ユーザーの認証URL表示 | `--show-latest-url` |
| `--check-status <username>` | ユーザー認証状態確認 | `--check-status testuser001` |
| `--list-unverified` | 全未認証ユーザー一覧 | `--list-unverified` |
| `--cleanup-expired` | 期限切れトークンクリーンアップ | `--cleanup-expired` |
| `--help` | ヘルプ表示 | `--help` |

**使用方法**:
```bash
cd backend
source venv313/bin/activate
python scripts/email_verification_helper.py [オプション]
```

---

**作成日**: 2025年9月23日  
**最終更新**: 2025年9月23日（メール認証システム実装完了、支援スクリプト追加）