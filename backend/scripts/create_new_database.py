#!/usr/bin/env python3
"""
新しい統合game_charactersテーブル設計でデータベースを作成
"""
import sqlite3
import os
from datetime import datetime
from pathlib import Path

# データベースファイルのパス
DB_PATH = Path(__file__).parent.parent / "touhou_clear_checker.db"

def create_database():
    """新しい設計でデータベースを作成"""
    print("=== 新しい統合game_charactersテーブル設計でデータベースを作成 ===")
    
    # 既存のデータベースがあれば削除
    if DB_PATH.exists():
        print(f"既存のデータベースを削除: {DB_PATH}")
        os.remove(DB_PATH)
    
    try:
        # データベースに接続
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        print("テーブルを作成中...")
        
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
        
        # 3. 統合game_charactersテーブル
        cursor.execute("""
            CREATE TABLE game_characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id INTEGER NOT NULL,
                character_name VARCHAR(100) NOT NULL,
                description TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                UNIQUE(game_id, character_name)
            )
        """)
        
        # インデックスを作成
        cursor.execute("CREATE INDEX idx_game_characters_game ON game_characters(game_id)")
        cursor.execute("CREATE INDEX idx_game_characters_sort ON game_characters(game_id, sort_order)")
        print("✅ game_characters テーブル作成完了")
        
        # 4. clear_records テーブル（統合設計対応）
        cursor.execute("""
            CREATE TABLE clear_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                game_id INTEGER NOT NULL,
                character_name VARCHAR(100) NOT NULL,
                difficulty VARCHAR(20) NOT NULL,
                mode VARCHAR(20) DEFAULT 'normal',
                is_cleared BOOLEAN DEFAULT FALSE,
                is_no_continue_clear BOOLEAN DEFAULT FALSE,
                is_no_bomb_clear BOOLEAN DEFAULT FALSE,
                is_no_miss_clear BOOLEAN DEFAULT FALSE,
                is_full_spell_card BOOLEAN DEFAULT FALSE,
                is_special_clear_1 BOOLEAN DEFAULT FALSE,
                is_special_clear_2 BOOLEAN DEFAULT FALSE,
                is_special_clear_3 BOOLEAN DEFAULT FALSE,
                cleared_at DATE,
                last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                UNIQUE(user_id, game_id, character_name, difficulty, mode)
            )
        """)
        
        # clear_recordsテーブルのインデックス
        cursor.execute("CREATE INDEX idx_clear_records_user_game ON clear_records(user_id, game_id)")
        cursor.execute("CREATE INDEX idx_clear_records_user ON clear_records(user_id)")
        cursor.execute("CREATE INDEX idx_clear_records_game ON clear_records(game_id)")
        print("✅ clear_records テーブル作成完了")
        
        # 5. game_memos テーブル
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
        cursor.execute("CREATE INDEX idx_game_memos_user_game ON game_memos(user_id, game_id)")
        print("✅ game_memos テーブル作成完了")
        
        # 初期データの投入
        print("\n初期データを投入中...")
        
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
        
        # サンプル機体データを挿入
        print("サンプル機体データを挿入中...")
        
        sample_characters = [
            # 東方紅魔郷（1作目）
            (1, '霊夢A', 'ホーミングアミュレット中心の霊力重視タイプ', 1),
            (1, '霊夢B', '封魔針中心の攻撃力重視タイプ', 2),
            (1, '魔理沙A', 'マジックミサイル中心の魔力重視タイプ', 3),
            (1, '魔理沙B', 'イリュージョンレーザー中心の貫通力重視タイプ', 4),
            
            # 東方妖々夢（2作目）
            (2, '霊夢A', 'ホーミングアミュレット中心', 1),
            (2, '霊夢B', '封魔針中心', 2),
            (2, '魔理沙A', 'マジックミサイル中心', 3),
            (2, '魔理沙B', 'イリュージョンレーザー中心', 4),
            (2, '咲夜A', '時間操作とナイフ攻撃', 5),
            (2, '咲夜B', '時間停止特化', 6),
            
            # 東方永夜抄（3作目）：ペアシステム
            (3, '霊夢&紫（単独）', '結界操作による単独攻撃特化', 1),
            (3, '霊夢&紫（協力）', '結界操作による協力攻撃特化', 2),
            (3, '魔理沙&アリス（単独）', '人形と魔法の単独連携', 3),
            (3, '魔理沙&アリス（協力）', '人形と魔法の協力連携', 4),
            (3, '咲夜&レミリア（単独）', '時間操作と吸血の単独連携', 5),
            (3, '咲夜&レミリア（協力）', '時間操作と吸血の協力連携', 6),
            (3, '慧音&妹紅（単独）', '歴史と不死の単独連携', 7),
            (3, '慧音&妹紅（協力）', '歴史と不死の協力連携', 8),
        ]
        
        now = datetime.now()
        for game_id, name, description, sort_order in sample_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (game_id, name, description, sort_order, now))
        
        print("✅ サンプル機体データの挿入が完了しました")
        
        # 変更をコミット
        conn.commit()
        print(f"\n🎉 データベース作成完了！")
        print(f"📂 データベースファイル: {DB_PATH}")
        print(f"🎮 登録済みゲーム: {len(games_data)}作品")
        print(f"👥 登録済みサンプル機体: {len(sample_characters)}種類")
        
    except Exception as e:
        print(f"エラー: データベース作成に失敗しました: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    create_database()