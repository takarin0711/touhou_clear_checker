#!/bin/sh
set -e

# HTTPS環境変数が true の場合は HTTPS で起動
if [ "$HTTPS" = "true" ]; then
    echo "Starting frontend with HTTPS..."
    exec npm run start:https
else
    echo "Starting frontend with HTTP..."
    exec npm start
fi
