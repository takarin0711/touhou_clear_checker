"""
ゲームIDを確認するスクリプト（花映塚と獣王園のIDを特定）
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from infrastructure.database.connection import DATABASE_URL

def check_game_ids():
    """ゲーム一覧とIDを確認"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, title FROM games ORDER BY id"))
        games = result.fetchall()
        
        print("=== 全ゲーム一覧 ===")
        for game in games:
            print(f"ID: {game[0]}, Title: {game[1]}")
            
        print("\n=== 花映塚と獣王園の確認 ===")
        for game in games:
            if "花映塚" in game[1] or "獣王園" in game[1]:
                print(f"対戦型STG - ID: {game[0]}, Title: {game[1]}")

if __name__ == "__main__":
    check_game_ids()