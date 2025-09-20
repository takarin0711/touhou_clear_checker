#!/usr/bin/env python3
"""
統合game_charactersテーブルシステムへのマイグレーション
"""
import sqlite3
from datetime import datetime
from pathlib import Path

# データベースファイルのパス
DB_PATH = Path(__file__).parent.parent / "touhou_clear_checker.db"


def create_unified_game_characters_table(cursor):
    """統合game_charactersテーブルを作成"""
    print("統合game_charactersテーブルを作成中...")
    
    # 既存のgame_charactersテーブルがあるかチェック
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='game_characters'
    """)
    
    if cursor.fetchone():
        print("既存のgame_charactersテーブルを削除中...")
        cursor.execute("DROP TABLE game_characters")
    
    # 新しい統合game_charactersテーブルを作成
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
    cursor.execute("""
        CREATE INDEX idx_game_characters_game ON game_characters(game_id)
    """)
    
    cursor.execute("""
        CREATE INDEX idx_game_characters_sort ON game_characters(game_id, sort_order)
    """)
    
    print("統合game_charactersテーブルが作成されました")


def add_mode_column_to_clear_records(cursor):
    """clear_recordsテーブルにmodeカラムを追加"""
    print("clear_recordsテーブルにmodeカラムを追加中...")
    
    # clear_recordsテーブルの存在チェック
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='clear_records'
    """)
    
    if not cursor.fetchone():
        print("clear_recordsテーブルが見つかりません。スキップします。")
        return
    
    # modeカラムが既に存在するかチェック
    cursor.execute("PRAGMA table_info(clear_records)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'mode' not in columns:
        cursor.execute("""
            ALTER TABLE clear_records 
            ADD COLUMN mode VARCHAR(20) DEFAULT 'normal'
        """)
        print("modeカラムが追加されました")
    else:
        print("modeカラムは既に存在します")


def insert_sample_game_characters(cursor):
    """サンプル機体データを挿入"""
    print("サンプル機体データを挿入中...")
    
    sample_characters = [
        # 東方紅魔郷（6作目）
        (1, '霊夢A', 'ホーミングアミュレット中心の霊力重視タイプ', 1),
        (1, '霊夢B', '封魔針中心の攻撃力重視タイプ', 2),
        (1, '魔理沙A', 'マジックミサイル中心の魔力重視タイプ', 3),
        (1, '魔理沙B', 'イリュージョンレーザー中心の貫通力重視タイプ', 4),
        
        # 東方妖々夢（7作目）
        (2, '霊夢A', 'ホーミングアミュレット中心', 1),
        (2, '霊夢B', '封魔針中心', 2),
        (2, '魔理沙A', 'マジックミサイル中心', 3),
        (2, '魔理沙B', 'イリュージョンレーザー中心', 4),
        (2, '咲夜A', '時間操作とナイフ攻撃', 5),
        (2, '咲夜B', '時間停止特化', 6),
        
        # 東方永夜抄（8作目）：ペアシステム
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
        try:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (game_id, name, description, sort_order, now))
        except sqlite3.IntegrityError:
            # 重複の場合はスキップ
            print(f"機体 '{name}' (game_id={game_id}) は既に存在します。スキップ。")
    
    print("サンプル機体データの挿入が完了しました")


def main():
    """メイン処理"""
    print("=== 統合game_charactersシステムへのマイグレーション開始 ===")
    
    if not DB_PATH.exists():
        print(f"エラー: データベースファイルが見つかりません: {DB_PATH}")
        return
    
    try:
        # データベースに接続
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # マイグレーション実行
        create_unified_game_characters_table(cursor)
        add_mode_column_to_clear_records(cursor)
        insert_sample_game_characters(cursor)
        
        # 変更をコミット
        conn.commit()
        print("=== マイグレーション完了 ===")
        
    except Exception as e:
        print(f"エラー: マイグレーションに失敗しました: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()