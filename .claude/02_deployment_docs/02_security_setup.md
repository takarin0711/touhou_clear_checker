# セキュリティ設定ガイド

## 環境変数とパスワード管理

### セキュリティ原則
1. **パスワードをコードに含めない**: 環境変数ファイルで管理
2. **環境変数ファイルをGitに含めない**: .gitignoreで除外
3. **本番環境では強固なパスワード**: 開発用デフォルトパスワードは本番利用禁止
4. **定期的なパスワード変更**: セキュリティ維持のため

### 環境変数ファイル構成

#### 開発環境用ファイル
- `.env.sqlite` - SQLite環境設定
- `.env.mysql` - MySQL環境設定
- これらのファイルは **.gitignore に含まれており、Gitで管理されません**

#### テンプレートファイル
- `.env.mysql.example` - MySQL設定のテンプレート
- このファイルは **Gitで管理されており、パスワードは含まれません**

### 初期設定手順

#### 1. 環境変数ファイルの作成
```bash
# MySQL環境用
cp .env.mysql.example .env.mysql

# .env.mysql を編集してパスワードを設定
vim .env.mysql  # または任意のエディタ
```

#### 2. セキュアなパスワードの設定
```bash
# .env.mysql の例（強固なパスワードに変更）
MYSQL_ROOT_PASSWORD=SuperSecureRootPassword123!@#
MYSQL_PASSWORD=SecureDatabasePassword456$%^
JWT_SECRET_KEY=YourVerySecureJWTSecretKeyHere789&*(
```

#### 3. パスワード要件
- **最低12文字以上**
- **大文字・小文字・数字・記号を含む**
- **辞書にない文字列**
- **他のサービスで使用していないもの**

### ファイル権限設定

#### Unix/Linux/macOS
```bash
# 環境変数ファイルの権限を制限（所有者のみ読み書き可能）
chmod 600 .env.mysql
chmod 600 .env.sqlite

# ディレクトリ確認
ls -la .env.*
```

#### 期待される出力
```
-rw-------  1 user  group  234 date .env.mysql
-rw-------  1 user  group  156 date .env.sqlite
```

### 本番環境での注意事項

#### 1. 環境変数の管理
- **クラウドサービス**: AWS Secrets Manager, Azure Key Vault等を使用
- **Docker Secrets**: Docker Swarmやkubernetesのシークレット機能
- **CI/CD**: GitHub Secrets, GitLab Variables等で管理

#### 2. データベースパスワード
```bash
# 本番環境では以下のような強固なパスワードを使用
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_PASSWORD=$(openssl rand -base64 24)
JWT_SECRET_KEY=$(openssl rand -base64 48)
```

#### 3. 定期的な変更
- **パスワード**: 3-6ヶ月ごと
- **JWT秘密鍵**: セキュリティ要件に応じて
- **証明書**: 有効期限前の更新

### トラブルシューティング

#### パスワード認証エラー
```bash
# エラー例
ERROR 1045 (28000): Access denied for user 'touhou_user'@'%' (using password: YES)

# 対処法
1. .env.mysql のパスワードを確認
2. Docker環境を完全に再起動
3. MySQL volumeのリセット（データ消失注意）
```

#### 環境変数が反映されない
```bash
# 対処法
1. --env-file オプションが正しく指定されているか確認
2. .env.mysql ファイルの形式確認（等号の前後にスペースなし）
3. Docker Composeの再起動
```

### 緊急時対応

#### パスワード忘れ・ロックアウト
```bash
# 開発環境の場合: 全データリセット
docker compose down
docker volume rm touhou_clear_checker_mysql-data
# 新しいパスワードで再起動
```

#### 不正アクセス疑いがある場合
1. **即座にパスワード変更**
2. **ログの確認**: `docker compose logs mysql`
3. **接続制限**: ファイアウォール設定確認
4. **データバックアップ**: 被害確認前の安全な状態を保存

## 追加のセキュリティ対策

### SSL/TLS設定
```yaml
# 本番環境では MySQL SSL/TLS 設定を追加
DATABASE_URL=mysql+pymysql://user:password@host:3306/database?charset=utf8mb4&ssl_disabled=false
```

### ネットワーク制限
```yaml
# docker-compose.production.yml
mysql:
  networks:
    - internal
  # 外部からの直接アクセスを禁止
  # ports: セクションを削除
```

### バックアップ暗号化
```bash
# データベースダンプの暗号化
mysqldump [options] | gpg --encrypt --recipient your@email.com > backup.sql.gpg
```

このガイドに従って適切なセキュリティ設定を行い、機密情報の漏洩を防止してください。