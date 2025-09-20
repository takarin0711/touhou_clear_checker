#!/usr/bin/env python3
"""
データベース完全再作成スクリプト（新設計）
機体別条件式対応のテーブル構造で一から作り直し
"""

import sqlite3
import os
import sys
from pathlib import Path

# バックエンドディレクトリをパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from infrastructure.security.password_hasher import PasswordHasher

def recreate_database():
    """データベースを削除して新設計で再作成"""
    
    db_path = backend_dir / "touhou_clear_checker.db"
    
    # 既存データベースファイルを削除
    if db_path.exists():
        print(f"既存データベースを削除: {db_path}")
        os.remove(db_path)
    
    # 新しいデータベース接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("新しいテーブル構造を作成中...")
        
        # 1. users テーブル
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                hashed_password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ users テーブル作成完了")
        
        # 2. games テーブル
        cursor.execute("""
            CREATE TABLE games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(255) NOT NULL,
                series_number DECIMAL(4,1) NOT NULL,
                release_year INTEGER NOT NULL,
                game_type VARCHAR(50) NOT NULL DEFAULT 'main_series',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ games テーブル作成完了")
        
        # 3. characters テーブル（新設計：シンプルなid+name）
        cursor.execute("""
            CREATE TABLE characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # charactersテーブルのインデックス
        cursor.execute("CREATE INDEX idx_characters_name ON characters(name)")
        print("✅ characters テーブル作成完了")
        
        # 4. game_characters テーブル（中間テーブル）
        cursor.execute("""
            CREATE TABLE game_characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id INTEGER NOT NULL,
                character_id INTEGER NOT NULL,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                UNIQUE(game_id, character_id)
            )
        """)
        
        # game_charactersテーブルのインデックス
        cursor.execute("CREATE INDEX idx_game_characters_game ON game_characters(game_id)")
        cursor.execute("CREATE INDEX idx_game_characters_character ON game_characters(character_id)")
        print("✅ game_characters テーブル作成完了")
        
        # 5. clear_records テーブル（機体別個別条件記録）
        cursor.execute("""
            CREATE TABLE clear_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                game_id INTEGER NOT NULL,
                character_id INTEGER NOT NULL,
                difficulty VARCHAR(20) NOT NULL,
                is_cleared BOOLEAN DEFAULT FALSE,
                is_no_continue_clear BOOLEAN DEFAULT FALSE,
                is_no_bomb_clear BOOLEAN DEFAULT FALSE,
                is_no_miss_clear BOOLEAN DEFAULT FALSE,
                cleared_at DATE,
                last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                UNIQUE(user_id, game_id, character_id, difficulty)
            )
        """)
        
        # clear_recordsテーブルのインデックス
        cursor.execute("CREATE INDEX idx_clear_records_user_game ON clear_records(user_id, game_id)")
        cursor.execute("CREATE INDEX idx_clear_records_user ON clear_records(user_id)")
        cursor.execute("CREATE INDEX idx_clear_records_game ON clear_records(game_id)")
        print("✅ clear_records テーブル作成完了")
        
        # 6. game_memos テーブル（作品ごとメモ）
        cursor.execute("""
            CREATE TABLE game_memos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                game_id INTEGER NOT NULL,
                memo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                UNIQUE(user_id, game_id)
            )
        """)
        
        # game_memosテーブルのインデックス
        cursor.execute("CREATE INDEX idx_game_memos_user_game ON game_memos(user_id, game_id)")
        print("✅ game_memos テーブル作成完了")
        
        # 初期データの投入
        print("\n初期データを投入中...")
        
        # デフォルト管理者ユーザー
        password_hasher = PasswordHasher()
        hashed_password = password_hasher.hash_password("admin123")
        
        cursor.execute("""
            INSERT INTO users (username, email, hashed_password, is_admin)
            VALUES (?, ?, ?, ?)
        """, ("admin", "admin@example.com", hashed_password, True))
        print("✅ 管理者ユーザー作成完了")
        
        # 東方シリーズゲーム（第6作〜第20作）
        games_data = [
            ('東方紅魔郷', 6.0, 2002, 'main_series'),
            ('東方妖々夢', 7.0, 2003, 'main_series'),
            ('東方永夜抄', 8.0, 2004, 'main_series'),
            ('東方花映塚', 9.0, 2005, 'main_series'),
            ('東方風神録', 10.0, 2007, 'main_series'),
            ('東方地霊殿', 11.0, 2008, 'main_series'),
            ('東方星蓮船', 12.0, 2009, 'main_series'),
            ('妖精大戦争', 12.8, 2010, 'main_series'),
            ('東方神霊廟', 13.0, 2011, 'main_series'),
            ('東方輝針城', 14.0, 2013, 'main_series'),
            ('東方紺珠伝', 15.0, 2015, 'main_series'),
            ('東方天空璋', 16.0, 2017, 'main_series'),
            ('東方鬼形獣', 17.0, 2019, 'main_series'),
            ('東方虹龍洞', 18.0, 2021, 'main_series'),
            ('東方獣王園', 19.0, 2023, 'main_series'),
            ('東方錦上京', 20.0, 2025, 'main_series')
        ]
        
        cursor.executemany("""
            INSERT INTO games (title, series_number, release_year, game_type)
            VALUES (?, ?, ?, ?)
        """, games_data)
        print(f"✅ {len(games_data)}作品のゲームデータ投入完了")
        
        # 主要キャラクターデータ（初期セット）
        characters_data = [
            # 基本キャラクター（多くの作品で共通）
            ('霊夢A',),
            ('霊夢B',),
            ('魔理沙A',),
            ('魔理沙B',),
            # 追加キャラクター（特定作品）
            ('霊夢C',),  # 風神録以降
            ('魔理沙C',),  # 風神録以降
            ('咲夜A',),  # 妖々夢、永夜抄
            ('咲夜B',),  # 妖々夢、永夜抄
            ('早苗A',),  # 星蓮船以降
            ('早苗B',),  # 星蓮船以降
            # 永夜抄特殊キャラ（ペア）
            ('霊夢&紫（単独）',),
            ('霊夢&紫（協力）',),
            ('魔理沙&アリス（単独）',),
            ('魔理沙&アリス（協力）',),
            ('咲夜&レミリア（単独）',),
            ('咲夜&レミリア（協力）',),
            ('慧音&妹紅（単独）',),
            ('慧音&妹紅（協力）',),
            # 鬼形獣特殊キャラ
            ('オオカミ',),
            ('カワウソ',),
            ('オオワシ',),
            # 妖精大戦争
            ('チルノA',),
            ('チルノB',),
            ('チルノC',),
        ]
        
        cursor.executemany("INSERT INTO characters (name) VALUES (?)", characters_data)
        print(f"✅ {len(characters_data)}キャラクターデータ投入完了")
        
        # ゲーム・キャラクター対応関係（基本的な組み合わせ）
        print("\nゲーム・キャラクター対応関係を設定中...")
        
        # 基本キャラクター（霊夢A/B、魔理沙A/B）は多くの作品で利用可能
        basic_characters = [1, 2, 3, 4]  # 霊夢A, 霊夢B, 魔理沙A, 魔理沙B
        
        # 各ゲームに基本キャラクターを関連付け
        for game_id in range(1, 17):  # 1-16: 東方6作目-20作目
            for char_id in basic_characters:
                cursor.execute("""
                    INSERT INTO game_characters (game_id, character_id, is_available)
                    VALUES (?, ?, ?)
                """, (game_id, char_id, True))
        
        # 特定作品の特殊キャラクター
        special_assignments = [
            # 妖々夢（2作目）: 咲夜追加
            (2, 7, True),  # 咲夜A
            (2, 8, True),  # 咲夜B
            # 永夜抄（3作目）: ペアキャラ
            (3, 11, True), (3, 12, True), (3, 13, True), (3, 14, True),
            (3, 15, True), (3, 16, True), (3, 17, True), (3, 18, True),
            # 風神録（5作目）: C ショット追加
            (5, 5, True),  # 霊夢C
            (5, 6, True),  # 魔理沙C
            # 星蓮船（7作目）: 早苗追加
            (7, 9, True),  # 早苗A
            (7, 10, True), # 早苗B
            # 妖精大戦争（8作目）: チルノのみ
            (8, 22, True), (8, 23, True), (8, 24, True),
            # 鬼形獣（13作目）: 動物キャラ
            (13, 19, True), (13, 20, True), (13, 21, True),
        ]
        
        for game_id, char_id, is_available in special_assignments:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_id, is_available)
                VALUES (?, ?, ?)
            """, (game_id, char_id, is_available))
        
        print("✅ ゲーム・キャラクター対応関係設定完了")
        
        # データベース変更をコミット
        conn.commit()
        print(f"\n🎉 データベース再作成完了！")
        print(f"📂 データベースファイル: {db_path}")
        print(f"👤 管理者アカウント: admin / admin123")
        print(f"🎮 登録済みゲーム: {len(games_data)}作品")
        print(f"👥 登録済みキャラクター: {len(characters_data)}種類")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    recreate_database()