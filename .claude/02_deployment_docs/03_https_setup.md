# HTTPS設定ガイド

## 概要
本プロジェクトでは、開発環境と本番環境の両方でHTTPSに対応しています。
- **開発環境**: mkcertを使用したローカルSSL証明書
- **本番環境**: Let's Encrypt等の正式なCA証明書

## 開発環境でのHTTPS設定（mkcert）

### 1. mkcertのインストール

#### macOS
```bash
brew install mkcert
```

#### Linux
```bash
# Debian/Ubuntu
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

#### Windows
```powershell
# Chocolatey
choco install mkcert

# または、GitHubからバイナリをダウンロード
```

### 2. ローカルCAのインストール

```bash
mkcert -install
```

このコマンドは、システムの証明書ストアにローカル認証局(CA)を追加します。
これにより、mkcertで生成した証明書がブラウザで信頼されるようになります。

### 3. SSL証明書の生成

```bash
cd /path/to/touhou_clear_checker
mkdir -p certs
cd certs
mkcert localhost 127.0.0.1 ::1
```

生成されるファイル：
- `localhost+2.pem` - SSL証明書
- `localhost+2-key.pem` - 秘密鍵

**注意**: これらのファイルは`.gitignore`に含まれており、リポジトリにコミットされません。

### 4. ネイティブ環境での起動

#### バックエンド（FastAPI）
```bash
cd backend
source venv313/bin/activate
SSL_ENABLED=true python main.py
```

アクセスURL: https://localhost:8000

#### フロントエンド（React）
```bash
cd frontend
npm run start:https
```

アクセスURL: https://localhost:3000

### 5. Docker環境での起動

#### 環境変数の設定

`.env.mysql`ファイルに以下を追加：
```bash
# HTTPS設定
SSL_ENABLED=true
HTTPS=true
REACT_APP_API_URL=https://localhost:8000
```

#### Docker起動

```bash
docker compose -f docker-compose.yml -f docker-compose.mysql.yml --env-file .env.mysql up -d
```

アクセスURL:
- フロントエンド: https://localhost:3000
- バックエンド: https://localhost:8000

### 6. ブラウザでの証明書信頼設定

初回アクセス時、以下の手順で証明書を信頼させてください：

1. **https://localhost:8000** にアクセス
   - 証明書警告が表示される場合、「詳細設定」→「localhost にアクセスする」をクリック

2. **https://localhost:3000** にアクセス
   - 同様に証明書警告をクリア

**注意**: `mkcert -install`を正しく実行していれば、証明書警告は表示されません。

## 本番環境でのHTTPS設定（Let's Encrypt）

### 前提条件
- 公開されたドメイン名（例: `your-domain.com`）
- ドメインのDNS設定が完了している
- ポート80/443が開放されている

### 1. Certbotのインストール

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

#### CentOS/RHEL
```bash
sudo yum install certbot python3-certbot-nginx
```

### 2. SSL証明書の取得

#### スタンドアロンモード（推奨）
```bash
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

#### Webサーバー動作中の場合（Nginx/Apache）
```bash
sudo certbot certonly --webroot -w /var/www/html -d your-domain.com
```

証明書の配置場所：
- `/etc/letsencrypt/live/your-domain.com/fullchain.pem` - 証明書
- `/etc/letsencrypt/live/your-domain.com/privkey.pem` - 秘密鍵

### 3. 環境変数の設定

本番環境の環境変数ファイル（例: `.env.production`）：
```bash
# SSL/TLS設定
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem

# その他の本番環境設定
JWT_SECRET_KEY=your-production-secret-key-change-this
DATABASE_URL=mysql+pymysql://user:password@host:port/database
ENVIRONMENT=production

# フロントエンド API URL
REACT_APP_API_URL=https://your-domain.com
```

### 4. 証明書の自動更新

Let's Encrypt証明書は90日で期限切れになるため、自動更新を設定します。

#### Crontabに追加
```bash
sudo crontab -e
```

以下を追加：
```cron
# 毎月1日の午前0時に証明書を更新
0 0 1 * * certbot renew --quiet && systemctl restart your-service
```

#### Systemdタイマーの使用（推奨）
```bash
# 自動更新タイマーを有効化
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer

# ステータス確認
sudo systemctl status certbot-renew.timer
```

### 5. ファイアウォール設定

```bash
# UFWの場合
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# firewalldの場合
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## トラブルシューティング

### 開発環境

#### 証明書エラーが出る
```bash
# ローカルCAの再インストール
mkcert -uninstall
mkcert -install

# 証明書の再生成
cd certs
rm localhost+2*.pem
mkcert localhost 127.0.0.1 ::1
```

#### ブラウザで「NET::ERR_CERT_AUTHORITY_INVALID」が出る
1. `mkcert -install`が正しく実行されているか確認
2. ブラウザを完全に再起動
3. macOSの場合、キーチェーンアクセスで証明書を確認

#### Docker環境で証明書が読み込めない
```bash
# certsディレクトリがマウントされているか確認
docker compose exec backend ls -la /app/certs

# 環境変数が正しく設定されているか確認
docker compose exec backend printenv | grep SSL
docker compose exec frontend printenv | grep HTTPS
```

### 本番環境

#### Certbotで証明書が取得できない
```bash
# ドメインのDNS設定を確認
nslookup your-domain.com

# ポート80/443が開いているか確認
sudo netstat -tulpn | grep -E ':(80|443)'

# ファイアウォール設定を確認
sudo ufw status
```

#### 証明書の有効期限切れ
```bash
# 手動で証明書を更新
sudo certbot renew

# 証明書の有効期限を確認
sudo certbot certificates
```

#### サービス再起動後にHTTPSが動作しない
```bash
# 証明書ファイルのパーミッション確認
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# 環境変数が正しく設定されているか確認
echo $SSL_ENABLED
echo $SSL_CERT_PATH
echo $SSL_KEY_PATH
```

## セキュリティベストプラクティス

### 証明書の保護
```bash
# 秘密鍵のパーミッション設定（本番環境）
sudo chmod 600 /etc/letsencrypt/live/your-domain.com/privkey.pem
sudo chown root:root /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 開発環境の証明書管理
- **gitignore設定**: 証明書ファイルをリポジトリに含めない
- **チーム共有**: 各開発者が独自にmkcertで証明書を生成
- **定期更新**: mkcert証明書は2年で期限切れ（自動更新なし）

### HTTPS強制リダイレクト（本番環境推奨）
```python
# backend/main.py に追加（本番環境のみ）
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

## 参考リンク
- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [Let's Encrypt公式ドキュメント](https://letsencrypt.org/docs/)
- [Certbot公式サイト](https://certbot.eff.org/)
- [uvicorn SSL設定](https://www.uvicorn.org/settings/#https)
