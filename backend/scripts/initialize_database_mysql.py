#!/usr/bin/env python3
"""
MySQL対応データベース一括初期化スクリプト
東方プロジェクトクリア状況チェッカー用

Usage:
    python scripts/initialize_database_mysql.py [options]
    
Options:
    --fresh: 既存テーブルを削除して新規作成
    --games-only: ゲームデータのみ追加
    --characters-only: キャラクターデータのみ追加
    --verify: データベース内容を確認
"""
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from infrastructure.database.connection import DATABASE_URL
from infrastructure.database.models.user_model import UserModel
from infrastructure.database.models.game_model import GameModel
from infrastructure.database.models.game_character_model import GameCharacterModel
from infrastructure.database.models.clear_record_model import ClearRecordModel
from infrastructure.database.models.game_memo_model import GameMemoModel
from infrastructure.database.connection import Base


class MySQLDatabaseInitializer:
    """MySQL対応データベース初期化クラス"""
    
    def __init__(self):
        print(f"📡 接続先: {DATABASE_URL}")
        self.engine = create_engine(DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
    def create_tables(self):
        """テーブル作成"""
        print("📋 テーブルを作成中...")
        Base.metadata.create_all(bind=self.engine)
        print("✅ 全テーブル作成完了")
        
    def drop_tables(self):
        """テーブル削除"""
        print("🗑️ 既存テーブルを削除中...")
        Base.metadata.drop_all(bind=self.engine)
        print("✅ 全テーブル削除完了")
        
    def insert_game_data(self):
        """ゲームデータ投入"""
        print("🎮 ゲームデータを投入中...")
        
        games_data = [
            (6.0, "東方紅魔郷", "The Embodiment of Scarlet Devil"),
            (7.0, "東方妖々夢", "Perfect Cherry Blossom"),
            (8.0, "東方永夜抄", "Imperishable Night"),
            (9.0, "東方花映塚", "Phantasmagoria of Flower View"),
            (10.0, "東方風神録", "Mountain of Faith"),
            (11.0, "東方地霊殿", "Subterranean Animism"),
            (12.0, "東方星蓮船", "Undefined Fantastic Object"),
            (12.8, "妖精大戦争", "Great Fairy Wars"),
            (13.0, "東方神霊廟", "Ten Desires"),
            (14.0, "東方輝針城", "Double Dealing Character"),
            (15.0, "東方紺珠伝", "Legacy of Lunatic Kingdom"),
            (16.0, "東方天空璋", "Hidden Star in Four Seasons"),
            (17.0, "東方鬼形獣", "Wily Beast and Weakest Creature"),
            (18.0, "東方虹龍洞", "Unconnected Marketeers"),
            (19.0, "東方獣王園", "Unfinished Dream of All Living Ghost"),
            (20.0, "東方錦上京", "Lotus Eaters")
        ]
        
        with self.SessionLocal() as session:
            for game_id, title_jp, title_en in games_data:
                # 12.8を適切なIDに変換
                actual_id = int(game_id * 10) if game_id == 12.8 else int(game_id)
                game = GameModel(id=actual_id, title_jp=title_jp, title_en=title_en)
                session.merge(game)  # 既存の場合は更新
            session.commit()
            
        print(f"✅ {len(games_data)}作品のゲームデータ投入完了")
        
    def insert_character_data(self):
        """キャラクターデータ投入"""
        print("👥 キャラクターデータを投入中...")
        
        # ゲーム機体データ
        characters_data = [
            # 東方紅魔郷 (4機体)
            (6, "博麗霊夢", "ReimuA"),
            (6, "霧雨魔理沙", "MarisaA"),
            (6, "博麗霊夢", "ReimuB"),
            (6, "霧雨魔理沙", "MarisaB"),
            
            # 東方妖々夢 (6機体)
            (7, "博麗霊夢", "ReimuA"),
            (7, "博麗霊夢", "ReimuB"),
            (7, "霧雨魔理沙", "MarisaA"),
            (7, "霧雨魔理沙", "MarisaB"),
            (7, "十六夜咲夜", "SakuyaA"),
            (7, "十六夜咲夜", "SakuyaB"),
            
            # 東方永夜抄 (12機体)
            (8, "博麗霊夢", "Reimu_Yukari"),
            (8, "博麗霊夢", "Reimu_Suika"),
            (8, "博麗霊夢", "Reimu_Aya"),
            (8, "霧雨魔理沙", "Marisa_Alice"),
            (8, "霧雨魔理沙", "Marisa_Patchouli"),
            (8, "霧雨魔理沙", "Marisa_Nitori"),
            (8, "十六夜咲夜", "Sakuya_Remilia"),
            (8, "十六夜咲夜", "Sakuya_Youmu"),
            (8, "十六夜咲夜", "Sakuya_Reisen"),
            (8, "魂魄妖夢", "Youmu_Yuyuko"),
            (8, "魂魄妖夢", "Youmu_Lyrica"),
            (8, "魂魄妖夢", "Youmu_Mystia"),
            
            # 東方花映塚 (16機体)
            (9, "博麗霊夢", "Reimu"),
            (9, "霧雨魔理沙", "Marisa"),
            (9, "十六夜咲夜", "Sakuya"),
            (9, "魂魄妖夢", "Youmu"),
            (9, "チルノ", "Cirno"),
            (9, "リリーホワイト", "Lily"),
            (9, "ルナサ・プリズムリバー", "Lunasa"),
            (9, "メルラン・プリズムリバー", "Merlin"),
            (9, "リリカ・プリズムリバー", "Lyrica"),
            (9, "魅魔", "Mima"),
            (9, "幽香", "Yuuka"),
            (9, "アリス・マーガトロイド", "Alice"),
            (9, "パチュリー・ノーレッジ", "Patchouli"),
            (9, "妖夢", "Youmu2"),
            (9, "レミリア・スカーレット", "Remilia"),
            (9, "西行寺幽々子", "Yuyuko"),
            
            # 東方風神録 (6機体)
            (10, "博麗霊夢", "ReimuA"),
            (10, "博麗霊夢", "ReimuB"),
            (10, "博麗霊夢", "ReimuC"),
            (10, "霧雨魔理沙", "MarisaA"),
            (10, "霧雨魔理沙", "MarisaB"),
            (10, "霧雨魔理沙", "MarisaC"),
            
            # 東方地霊殿 (6機体)
            (11, "博麗霊夢", "ReimuA"),
            (11, "博麗霊夢", "ReimuB"),
            (11, "博麗霊夢", "ReimuC"),
            (11, "霧雨魔理沙", "MarisaA"),
            (11, "霧雨魔理沙", "MarisaB"),
            (11, "霧雨魔理沙", "MarisaC"),
            
            # 東方星蓮船 (6機体)
            (12, "博麗霊夢", "ReimuA"),
            (12, "博麗霊夢", "ReimuB"),
            (12, "博麗霊夢", "ReimuC"),
            (12, "霧雨魔理沙", "MarisaA"),
            (12, "霧雨魔理沙", "MarisaB"),
            (12, "霧雨魔理沙", "MarisaC"),
            
            # 妖精大戦争 (7機体) - 特殊構造 (ID: 128 = 12.8 * 10)
            (128, "チルノ（Route A1）", "Cirno_A1"),
            (128, "チルノ（Route A2）", "Cirno_A2"),
            (128, "チルノ（Route B1）", "Cirno_B1"),
            (128, "チルノ（Route B2）", "Cirno_B2"),
            (128, "チルノ（Route C1）", "Cirno_C1"),
            (128, "チルノ（Route C2）", "Cirno_C2"),
            (128, "チルノ（Extra）", "Cirno_Extra"),
            
            # 東方神霊廟 (4機体)
            (13, "博麗霊夢", "Reimu"),
            (13, "霧雨魔理沙", "Marisa"),
            (13, "東風谷早苗", "Sanae"),
            (13, "魂魄妖夢", "Youmu"),
            
            # 東方輝針城 (6機体)
            (14, "博麗霊夢", "ReimuA"),
            (14, "博麗霊夢", "ReimuB"),
            (14, "霧雨魔理沙", "MarisaA"),
            (14, "霧雨魔理沙", "MarisaB"),
            (14, "十六夜咲夜", "SakuyaA"),
            (14, "十六夜咲夜", "SakuyaB"),
            
            # 東方紺珠伝 (4機体)
            (15, "博麗霊夢", "Reimu"),
            (15, "霧雨魔理沙", "Marisa"),
            (15, "東風谷早苗", "Sanae"),
            (15, "鈴仙・優曇華院・イナバ", "Reisen"),
            
            # 東方天空璋 (16機体)
            (16, "博麗霊夢", "ReimuSpring"),
            (16, "博麗霊夢", "ReimuSummer"),
            (16, "博麗霊夢", "ReimuAutumn"),
            (16, "博麗霊夢", "ReimuWinter"),
            (16, "霧雨魔理沙", "MarisaSpring"),
            (16, "霧雨魔理沙", "MarisaSummer"),
            (16, "霧雨魔理沙", "MarisaAutumn"),
            (16, "霧雨魔理沙", "MarisaWinter"),
            (16, "十六夜咲夜", "SakuyaSpring"),
            (16, "十六夜咲夜", "SakuyaSummer"),
            (16, "十六夜咲夜", "SakuyaAutumn"),
            (16, "十六夜咲夜", "SakuyaWinter"),
            (16, "魂魄妖夢", "YoumuSpring"),
            (16, "魂魄妖夢", "YoumuSummer"),
            (16, "魂魄妖夢", "YoumuAutumn"),
            (16, "魂魄妖夢", "YoumuWinter"),
            
            # 東方鬼形獣 (9機体)
            (17, "博麗霊夢", "ReimuWolf"),
            (17, "博麗霊夢", "ReimuOtter"),
            (17, "博麗霊夢", "ReimuEagle"),
            (17, "霧雨魔理沙", "MarisaWolf"),
            (17, "霧雨魔理沙", "MarisaOtter"),
            (17, "霧雨魔理沙", "MarisaEagle"),
            (17, "魂魄妖夢", "YoumuWolf"),
            (17, "魂魄妖夢", "YoumuOtter"),
            (17, "魂魄妖夢", "YoumuEagle"),
            
            # 東方虹龍洞 (4機体)
            (18, "博麗霊夢", "Reimu"),
            (18, "霧雨魔理沙", "Marisa"),
            (18, "十六夜咲夜", "Sakuya"),
            (18, "東風谷早苗", "Sanae"),
            
            # 東方獣王園 (19機体)
            (19, "博麗霊夢", "ReimuCard1"),
            (19, "博麗霊夢", "ReimuCard2"),
            (19, "博麗霊夢", "ReimuCard3"),
            (19, "博麗霊夢", "ReimuCard4"),
            (19, "博麗霊夢", "ReimuCard5"),
            (19, "霧雨魔理沙", "MarisaCard1"),
            (19, "霧雨魔理沙", "MarisaCard2"),
            (19, "霧雨魔理沙", "MarisaCard3"),
            (19, "霧雨魔理沙", "MarisaCard4"),
            (19, "霧雨魔理沙", "MarisaCard5"),
            (19, "十六夜咲夜", "SakuyaCard1"),
            (19, "十六夜咲夜", "SakuyaCard2"),
            (19, "十六夜咲夜", "SakuyaCard3"),
            (19, "東風谷早苗", "SanaeCard1"),
            (19, "東風谷早苗", "SanaeCard2"),
            (19, "東風谷早苗", "SanaeCard3"),
            (19, "鈴仙・優曇華院・イナバ", "ReisenCard1"),
            (19, "鈴仙・優曇華院・イナバ", "ReisenCard2"),
            (19, "鈴仙・優曇華院・イナバ", "ReisenCard3"),
            
            # 東方錦上京 (16機体)
            (20, "博麗霊夢", "ReimuCard1"),
            (20, "博麗霊夢", "ReimuCard2"),
            (20, "博麗霊夢", "ReimuCard3"),
            (20, "博麗霊夢", "ReimuCard4"),
            (20, "霧雨魔理沙", "MarisaCard1"),
            (20, "霧雨魔理沙", "MarisaCard2"),
            (20, "霧雨魔理沙", "MarisaCard3"),
            (20, "霧雨魔理沙", "MarisaCard4"),
            (20, "十六夜咲夜", "SakuyaCard1"),
            (20, "十六夜咲夜", "SakuyaCard2"),
            (20, "十六夜咲夜", "SakuyaCard3"),
            (20, "十六夜咲夜", "SakuyaCard4"),
            (20, "東風谷早苗", "SanaeCard1"),
            (20, "東風谷早苗", "SanaeCard2"),
            (20, "東風谷早苗", "SanaeCard3"),
            (20, "東風谷早苗", "SanaeCard4")
        ]
        
        with self.SessionLocal() as session:
            for game_id, character_name, character_key in characters_data:
                character = GameCharacterModel(
                    game_id=game_id,
                    character_name=character_name,
                    character_key=character_key
                )
                session.merge(character)  # 既存の場合は更新
            session.commit()
            
        print(f"✅ {len(characters_data)}種類のキャラクターデータ投入完了")
        
    def verify_database(self):
        """データベース内容確認"""
        print("🔍 データベース内容を確認中...")
        
        with self.SessionLocal() as session:
            # ゲーム数確認
            games = session.query(GameModel).all()
            print("\n📚 登録済みゲーム:")
            for game in games:
                character_count = session.query(GameCharacterModel).filter(GameCharacterModel.game_id == game.id).count()
                print(f"  {game.id:4.1f}: {game.title_jp} ({character_count}機体)")
            
            # 統計情報
            total_games = len(games)
            total_characters = session.query(GameCharacterModel).count()
            
            print(f"\n📊 統計情報:")
            print(f"  🎮 合計ゲーム数: {total_games}作品")
            print(f"  👥 合計機体数: {total_characters}種類")
            
            # テーブル一覧
            tables = session.execute(text("SHOW TABLES")).fetchall()
            table_names = [table[0] for table in tables]
            print(f"\n🗃️ 作成済みテーブル: {', '.join(table_names)}")
            
    def run_fresh_install(self):
        """完全初期化実行"""
        print("=== 🚀 MySQL データベース完全初期化開始 ===")
        self.drop_tables()
        self.create_tables()
        self.insert_game_data()
        self.insert_character_data()
        self.verify_database()
        print("\n🎉 MySQL データベース初期化完了！")
        print(f"📡 接続先: {DATABASE_URL}")


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="MySQL対応データベース初期化スクリプト")
    parser.add_argument("--fresh", action="store_true", help="既存テーブルを削除して新規作成")
    parser.add_argument("--games-only", action="store_true", help="ゲームデータのみ追加")
    parser.add_argument("--characters-only", action="store_true", help="キャラクターデータのみ追加")
    parser.add_argument("--verify", action="store_true", help="データベース内容を確認")
    
    args = parser.parse_args()
    
    try:
        initializer = MySQLDatabaseInitializer()
        
        if args.fresh:
            initializer.run_fresh_install()
        elif args.games_only:
            initializer.insert_game_data()
        elif args.characters_only:
            initializer.insert_character_data()
        elif args.verify:
            initializer.verify_database()
        else:
            # デフォルトは確認のみ
            initializer.verify_database()
            
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())