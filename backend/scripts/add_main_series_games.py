#!/usr/bin/env python3
"""
東方プロジェクト通常シリーズ（第6作〜）の初期データ追加スクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from infrastructure.database.connection import get_database_url

def add_main_series_games():
    """通常シリーズのゲームデータを追加"""
    
    # 通常シリーズのゲームデータ（難易度体系が同じ作品を含む）
    main_series_games = [
        (6.0, "東方紅魔郷", 2002),
        (7.0, "東方妖々夢", 2003),
        (8.0, "東方永夜抄", 2004),
        (9.0, "東方花映塚", 2005),
        (10.0, "東方風神録", 2007),
        (11.0, "東方地霊殿", 2008),
        (12.0, "東方星蓮船", 2009),
        (12.8, "妖精大戦争", 2010),  # 難易度体系が通常シリーズと同じ
        (13.0, "東方神霊廟", 2011),
        (14.0, "東方輝針城", 2013),
        (15.0, "東方紺珠伝", 2015),
        (16.0, "東方天空璋", 2017),
        (17.0, "東方鬼形獣", 2019),
        (18.0, "東方虹龍洞", 2021),
        (19.0, "東方獣王園", 2023),
        (20.0, "東方錦上京", 2025),
    ]
    
    database_url = get_database_url()
    engine = create_engine(database_url)
    
    try:
        with engine.begin() as connection:
            # スキーマ更新（game_typeカラム追加、series_numberをDECIMALに変更）
            try:
                connection.execute(text("ALTER TABLE games ADD COLUMN game_type VARCHAR(50) DEFAULT 'main_series'"))
                print("game_typeカラムを追加しました")
            except Exception as e:
                print(f"game_typeカラムは既に存在します: {e}")
                
            # SQLiteではALTER COLUMNが制限されているため、新テーブル作成して移行
            try:
                # 既存データを確認
                result = connection.execute(text("SELECT COUNT(*) as count FROM games"))
                existing_count = result.fetchone().count
                
                if existing_count > 0:
                    print("series_numberをDECIMAL型に変更するため、テーブルを再作成します")
                    # バックアップ
                    connection.execute(text("CREATE TABLE games_backup AS SELECT * FROM games"))
                    connection.execute(text("DROP TABLE games"))
                
                # 新しいテーブル構造で作成
                connection.execute(text("""
                    CREATE TABLE games (
                        id INTEGER PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        series_number DECIMAL(4,1) NOT NULL,
                        release_year INTEGER NOT NULL,
                        game_type VARCHAR(50) NOT NULL DEFAULT 'main_series'
                    )
                """))
                print("gamesテーブルを新しい構造で再作成しました")
                
            except Exception as e:
                print(f"テーブル再作成でエラー: {e}")
            
            # 既存のゲームデータを確認
            result = connection.execute(text("SELECT COUNT(*) as count FROM games"))
            existing_count = result.fetchone().count
            
            if existing_count > 0:
                print(f"既に{existing_count}件のゲームデータが存在します。")
                response = input("既存データを削除して再作成しますか？ (y/N): ")
                if response.lower() == 'y':
                    connection.execute(text("DELETE FROM games"))
                    print("既存データを削除しました。")
                else:
                    print("処理を中断しました。")
                    return
            
            # 新しいゲームデータを挿入
            for series_number, title, release_year in main_series_games:
                connection.execute(
                    text("""
                        INSERT INTO games (series_number, title, release_year, game_type) 
                        VALUES (:series_number, :title, :release_year, 'main_series')
                    """),
                    {
                        'series_number': series_number,
                        'title': title,
                        'release_year': release_year
                    }
                )
            
            print(f"通常シリーズ{len(main_series_games)}作品のデータを追加しました。")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        raise

if __name__ == "__main__":
    add_main_series_games()