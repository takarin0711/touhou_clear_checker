#!/usr/bin/env python3
"""
ゲームテーブルのIDを1から順番に振り直すスクリプト
紅魔郷=1, 妖々夢=2, 永夜抄=3, ... 錦上京=16, 妖精大戦争=17
"""

import sqlite3
import sys
import os

def reset_game_ids_sequential():
    """ゲームIDを1から順番に振り直し"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 現在のゲームデータを取得（シリーズ番号順）
        cursor.execute("SELECT id, title, series_number, release_year, game_type, created_at, updated_at FROM games ORDER BY series_number")
        current_games = cursor.fetchall()
        
        print("現在のゲームデータ:")
        for game in current_games:
            print(f"  ID:{game[0]} シリーズ:{game[2]} タイトル:{game[1]}")
        
        # 新しいIDマッピングを作成（1から連番）
        id_mapping = {}
        new_id = 1
        for old_id, title, series_number, release_year, game_type, created_at, updated_at in current_games:
            id_mapping[old_id] = new_id
            new_id += 1
        
        print("\nIDマッピング:")
        for old_id, new_id in id_mapping.items():
            old_game = next(g for g in current_games if g[0] == old_id)
            print(f"  {old_game[1]} : {old_id} -> {new_id}")
        
        # 外部キー制約を無効化
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # トランザクション開始
        cursor.execute("BEGIN TRANSACTION")
        
        # 一時テーブルを作成して新しいIDでデータを移行
        cursor.execute("""
            CREATE TABLE games_new (
                id INTEGER PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                series_number DECIMAL(4,1) NOT NULL,
                release_year INTEGER NOT NULL,
                game_type VARCHAR(50) NOT NULL DEFAULT 'main_series',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 新しいIDでゲームデータを挿入
        for old_id, title, series_number, release_year, game_type, created_at, updated_at in current_games:
            new_id = id_mapping[old_id]
            cursor.execute("""
                INSERT INTO games_new (id, title, series_number, release_year, game_type, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (new_id, title, series_number, release_year, game_type, created_at, updated_at))
        
        # game_charactersテーブルのgame_idを更新
        cursor.execute("""
            CREATE TABLE game_characters_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id INTEGER NOT NULL,
                character_name VARCHAR(100) NOT NULL,
                description TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (game_id) REFERENCES games_new(id) ON DELETE CASCADE,
                UNIQUE(game_id, character_name)
            )
        """)
        
        # game_charactersのデータを新しいgame_idで移行
        cursor.execute("SELECT id, game_id, character_name, description, sort_order, created_at FROM game_characters")
        characters = cursor.fetchall()
        
        for char_id, old_game_id, character_name, description, sort_order, created_at in characters:
            new_game_id = id_mapping.get(old_game_id, old_game_id)
            cursor.execute("""
                INSERT INTO game_characters_new (game_id, character_name, description, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (new_game_id, character_name, description, sort_order, created_at))
        
        # 古いテーブルを削除して新しいテーブルをリネーム
        cursor.execute("DROP TABLE game_characters")
        cursor.execute("DROP TABLE games")
        cursor.execute("ALTER TABLE games_new RENAME TO games")
        cursor.execute("ALTER TABLE game_characters_new RENAME TO game_characters")
        
        # 外部キー制約を有効化
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # コミット
        cursor.execute("COMMIT")
        
        # 結果確認
        cursor.execute("SELECT id, title, series_number FROM games ORDER BY id")
        new_games = cursor.fetchall()
        
        print("\n更新後のゲームデータ:")
        for game in new_games:
            print(f"  ID:{game[0]} シリーズ:{game[2]} タイトル:{game[1]}")
        
        # 紅魔郷（ID:1）のキャラクター確認
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = 1")
        koumakan_chars = cursor.fetchone()[0]
        print(f"\n紅魔郷（ID:1）のキャラクター数: {koumakan_chars}")
        
        return True
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        cursor.execute("ROLLBACK")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("=== ゲームID連番振り直しスクリプト ===")
    success = reset_game_ids_sequential()
    if success:
        print("✅ ゲームIDの連番振り直しが完了しました。")
    else:
        print("❌ 処理に失敗しました。")