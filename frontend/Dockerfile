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

# ポート3000を公開
EXPOSE 3000

# 開発環境用の起動コマンド（ホットリロード有効）
CMD ["npm", "start"]