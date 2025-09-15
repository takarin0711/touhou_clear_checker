import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from infrastructure.database.connection import engine


def add_admin_flag():
    print("Adding admin flag to users table...")
    
    with engine.begin() as conn:
        # usersテーブルにis_adminカラムを追加（存在しない場合）
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0 NOT NULL"))
            print("Added is_admin column to users table")
        except Exception as e:
            print(f"is_admin column might already exist: {e}")
        
        # adminユーザーに管理者権限を付与
        result = conn.execute(text("UPDATE users SET is_admin = 1 WHERE username = 'admin'"))
        if result.rowcount > 0:
            print("Successfully granted admin privileges to 'admin' user")
        else:
            print("Admin user not found or already has admin privileges")
        
        # 現在のユーザー状況を確認
        result = conn.execute(text("SELECT username, is_admin FROM users"))
        users = result.fetchall()
        print("\nCurrent users:")
        for user in users:
            print(f"  {user[0]}: {'Admin' if user[1] else 'Regular User'}")
    
    print("Admin flag migration completed!")


if __name__ == "__main__":
    add_admin_flag()