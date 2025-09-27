#!/usr/bin/env python3
"""
SQLiteからMySQLへのデータ移行スクリプト
設計書に基づく正しいデータ構造でMySQLを再構築
"""
import os
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

import sqlite3
import pymysql
from infrastructure.database.connection import DATABASE_URL

def connect_sqlite():
    """SQLite接続"""
    db_path = Path(__file__).parent.parent / "touhou_clear_checker.db"
    return sqlite3.connect(str(db_path))

def connect_mysql():
    """MySQL接続"""
    # mysql+pymysql://user:pass@host:port/db → 接続情報抽出
    url_parts = DATABASE_URL.replace("mysql+pymysql://", "").split("/")
    db_name = url_parts[1].split("?")[0]  # ?charset=... を除去
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

def migrate_games():
    """ゲームデータ移行"""
    print("🎮 ゲームデータを移行中...")
    
    with connect_sqlite() as sqlite_conn:
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute("SELECT * FROM games ORDER BY id")
        games = sqlite_cursor.fetchall()
        
        # SQLiteのカラム名を確認
        columns = [description[0] for description in sqlite_cursor.description]
        print(f"   SQLiteカラム: {columns}")
        
        with connect_mysql() as mysql_conn:
            with mysql_conn.cursor() as mysql_cursor:
                # 外部キー制約を無効化してからデータを削除
                mysql_cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
                mysql_cursor.execute("DELETE FROM game_characters")
                mysql_cursor.execute("DELETE FROM games")
                mysql_cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
                
                for game in games:
                    game_dict = dict(zip(columns, game))
                    
                    # MySQLの構造に合わせてデータを変換
                    mysql_cursor.execute("""
                        INSERT INTO games (id, title, series_number, release_year, game_type)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        game_dict['id'],
                        game_dict['title'],
                        game_dict['series_number'],
                        game_dict['release_year'],
                        game_dict['game_type']
                    ))
                
                mysql_conn.commit()
                print(f"   ✅ {len(games)}作品のゲームデータ移行完了")

def migrate_game_characters():
    """ゲーム機体データ移行"""
    print("👥 ゲーム機体データを移行中...")
    
    with connect_sqlite() as sqlite_conn:
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute("SELECT * FROM game_characters ORDER BY game_id, sort_order")
        characters = sqlite_cursor.fetchall()
        
        # SQLiteのカラム名を確認
        columns = [description[0] for description in sqlite_cursor.description]
        print(f"   SQLiteカラム: {columns}")
        
        with connect_mysql() as mysql_conn:
            with mysql_conn.cursor() as mysql_cursor:
                # game_charactersは既にクリア済み（migrate_games内で実行）
                
                for character in characters:
                    char_dict = dict(zip(columns, character))
                    
                    # MySQLの構造に合わせてデータを変換
                    mysql_cursor.execute("""
                        INSERT INTO game_characters (game_id, character_name, description, sort_order)
                        VALUES (%s, %s, %s, %s)
                    """, (
                        char_dict['game_id'],
                        char_dict['character_name'],
                        char_dict['description'] or '',
                        char_dict['sort_order']
                    ))
                
                mysql_conn.commit()
                print(f"   ✅ {len(characters)}機体のデータ移行完了")

def verify_migration():
    """移行結果確認"""
    print("🔍 移行結果を確認中...")
    
    with connect_mysql() as mysql_conn:
        with mysql_conn.cursor() as cursor:
            # ゲーム数確認
            cursor.execute("SELECT COUNT(*) FROM games")
            games_count = cursor.fetchone()[0]
            
            # 機体数確認
            cursor.execute("SELECT COUNT(*) FROM game_characters")
            characters_count = cursor.fetchone()[0]
            
            print(f"\n📊 移行結果:")
            print(f"  🎮 ゲーム数: {games_count}作品")
            print(f"  👥 機体数: {characters_count}種類")
            
            # サンプル表示
            cursor.execute("""
                SELECT g.id, g.title, COUNT(gc.id) as character_count
                FROM games g
                LEFT JOIN game_characters gc ON g.id = gc.game_id
                GROUP BY g.id, g.title
                ORDER BY g.id
                LIMIT 5
            """)
            
            print(f"\n📚 サンプル（最初の5作品）:")
            for game_id, title, char_count in cursor.fetchall():
                print(f"  {game_id:3}: {title} ({char_count}機体)")

def main():
    """メイン関数"""
    print("=== 🚀 SQLite → MySQL データ移行開始 ===")
    print(f"📡 移行先: {DATABASE_URL}")
    
    try:
        migrate_games()
        migrate_game_characters()
        verify_migration()
        
        print("\n🎉 データ移行完了！")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())