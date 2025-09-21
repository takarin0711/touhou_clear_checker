"""
現在のキャラクターテーブルの内容を確認するスクリプト
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from infrastructure.database.connection import DATABASE_URL

def check_current_characters():
    """現在のキャラクターデータを確認"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # charactersテーブルをチェック
        print("=== charactersテーブル ===")
        result = connection.execute(text("SELECT id, name FROM characters ORDER BY id"))
        characters = result.fetchall()
        
        print(f"現在のキャラクター数: {len(characters)}")
        print("現在のキャラクター一覧:")
        for char in characters:
            print(f"ID: {char[0]}, Name: {char[1]}")
            
        # game_charactersテーブルをチェック
        print("\n=== game_charactersテーブル ===")
        try:
            result = connection.execute(text("SELECT * FROM game_characters ORDER BY game_id, id"))
            game_characters = result.fetchall()
            
            print(f"現在のゲームキャラクター数: {len(game_characters)}")
            print("現在のゲームキャラクター一覧:")
            for gc in game_characters:
                print(f"ID: {gc[0]}, Game_ID: {gc[1]}, Name: {gc[2]}")
        except Exception as e:
            print(f"game_charactersテーブルの確認でエラー: {e}")
            
        # テーブル構造も確認
        print("\n=== テーブル構造確認 ===")
        try:
            result = connection.execute(text("PRAGMA table_info(game_characters)"))
            columns = result.fetchall()
            print("game_charactersテーブルの構造:")
            for col in columns:
                print(f"  {col[1]} ({col[2]})")
        except Exception as e:
            print(f"テーブル構造確認でエラー: {e}")

if __name__ == "__main__":
    check_current_characters()