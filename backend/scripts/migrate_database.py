import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from infrastructure.database.connection import engine, Base
from infrastructure.database.models.user_model import UserModel
from infrastructure.database.models.clear_status_model import ClearStatusModel
from infrastructure.database.models.game_model import GameModel


def migrate_database():
    print("Starting database migration...")
    
    # 既存のデータを取得
    with engine.connect() as conn:
        # 既存のclear_statusデータを保存
        try:
            result = conn.execute(text("SELECT * FROM clear_status"))
            existing_clear_status = result.fetchall()
            print(f"Found {len(existing_clear_status)} existing clear status records")
        except Exception as e:
            print(f"No existing clear_status table found: {e}")
            existing_clear_status = []
        
        # 既存のgamesデータを保存
        try:
            result = conn.execute(text("SELECT * FROM games"))
            existing_games = result.fetchall()
            print(f"Found {len(existing_games)} existing game records")
        except Exception as e:
            print(f"No existing games table found: {e}")
            existing_games = []
    
    # テーブルを削除（存在する場合）
    print("Dropping existing tables...")
    try:
        with engine.begin() as conn:
            conn.execute(text("DROP TABLE IF EXISTS clear_status"))
            conn.execute(text("DROP TABLE IF EXISTS games"))
            conn.execute(text("DROP TABLE IF EXISTS users"))
    except Exception as e:
        print(f"Error dropping tables: {e}")
    
    # 新しいテーブル構造を作成
    print("Creating new table structure...")
    Base.metadata.create_all(bind=engine)
    
    # データを復元
    with engine.begin() as conn:
        # gamesデータを復元
        if existing_games:
            print("Restoring games data...")
            for game in existing_games:
                conn.execute(text("""
                    INSERT INTO games (id, title, series_number, release_year) 
                    VALUES (:id, :title, :series_number, :release_year)
                """), {
                    "id": game[0],
                    "title": game[1], 
                    "series_number": game[2],
                    "release_year": game[3]
                })
        
        # デフォルトユーザーを作成
        print("Creating default user...")
        from infrastructure.security.password_hasher import PasswordHasher
        password_hasher = PasswordHasher()
        default_password_hash = password_hasher.hash_password("password123")
        
        conn.execute(text("""
            INSERT INTO users (id, username, email, hashed_password, is_active) 
            VALUES (1, 'admin', 'admin@example.com', :password_hash, 1)
        """), {"password_hash": default_password_hash})
        
        # clear_statusデータを復元（user_id=1で）
        if existing_clear_status:
            print("Restoring clear status data with default user...")
            for status in existing_clear_status:
                conn.execute(text("""
                    INSERT INTO clear_status (
                        id, game_id, user_id, difficulty, is_cleared, cleared_at,
                        no_continue_clear, no_bomb_clear, no_miss_clear, score, clear_count
                    ) VALUES (
                        :id, :game_id, 1, :difficulty, :is_cleared, :cleared_at,
                        0, 0, 0, NULL, 0
                    )
                """), {
                    "id": status[0],
                    "game_id": status[1],
                    "difficulty": status[2],
                    "is_cleared": status[3],
                    "cleared_at": status[4]
                })
    
    print("Database migration completed successfully!")
    print("Default user created:")
    print("  Username: admin")
    print("  Password: password123")
    print("  Email: admin@example.com")


if __name__ == "__main__":
    migrate_database()