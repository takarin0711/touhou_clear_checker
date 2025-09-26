# Python 3.13を使用（CLAUDE.mdの指示に従い）
FROM python:3.13-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージを更新し、必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# requirements.txtをコピーして依存関係をインストール
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-dev.txt

# アプリケーションコードをコピー
COPY . .

# SQLiteデータベースディレクトリの権限設定
RUN mkdir -p /app/data && chmod 755 /app/data

# ポート8000を公開
EXPOSE 8000

# 開発環境用の起動コマンド（ホットリロード有効）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]