#!/usr/bin/env python3
"""
シンプルなMySQL初期化スクリプト
"""
import os
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

import pymysql
from infrastructure.database.connection import DATABASE_URL

def connect_mysql():
    """MySQL接続"""
    # mysql+pymysql://user:pass@host:port/db → 接続情報抽出
    url_parts = DATABASE_URL.replace("mysql+pymysql://", "").split("/")
    db_name = url_parts[1]
    user_pass_host = url_parts[0].split("@")
    user_pass = user_pass_host[0].split(":")
    host_port = user_pass_host[1].split(":")
    
    return pymysql.connect(
        host=host_port[0],
        port=int(host_port[1]),
        user=user_pass[0],
        password=user_pass[1],
        database=db_name,
        charset='utf8mb4'
    )

def main():
    print("📡 MySQL接続テスト")
    
    with connect_mysql() as conn:
        with conn.cursor() as cursor:
            # テーブル確認
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"🗃️ 既存テーブル: {tables}")
            
            # ゲームテーブルにデータがあるか確認
            if 'games' in tables:
                cursor.execute("SELECT COUNT(*) FROM games")
                count = cursor.fetchone()[0]
                print(f"🎮 ゲーム数: {count}")
                
                if count > 0:
                    cursor.execute("SELECT id, title_jp FROM games ORDER BY id LIMIT 5")
                    games = cursor.fetchall()
                    print("📚 サンプルゲーム:")
                    for game_id, title in games:
                        print(f"  {game_id}: {title}")

if __name__ == "__main__":
    main()