# Node.js 18を使用（React 18.2.0対応）
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール（TypeScript 5.x対応）
RUN npm install --legacy-peer-deps

# アプリケーションコードをコピー
COPY . .

# エントリーポイントスクリプトをコピーして実行権限を付与
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ポート3000を公開
EXPOSE 3000

# エントリーポイントを設定（HTTPS環境変数で起動コマンドを切り替え）
ENTRYPOINT ["docker-entrypoint.sh"]