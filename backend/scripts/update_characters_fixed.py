"""
提供されたキャラクターデータでgame_charactersテーブルを更新するスクリプト
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from infrastructure.database.connection import DATABASE_URL

def update_game_characters():
    """ゲームキャラクターデータを更新"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # トランザクション開始
        trans = connection.begin()
        
        try:
            # 紅魔郷（Game ID: 1）のキャラクターを更新
            print("紅魔郷のキャラクターを更新中...")
            connection.execute(text("DELETE FROM game_characters WHERE game_id = 1"))
            
            koumakan_characters = [
                "霊夢A（霊の御札）",     # 霊符（ホーミングアミュレット）
                "霊夢B（夢の御札）",     # 夢符（パスウェイジョンニードル）
                "魔理沙A（魔の御札）",   # 魔符（マジックミサイル）
                "魔理沙B（恋の御札）"    # 恋符（イリュージョンレーザー）
            ]
            
            for i, char_name in enumerate(koumakan_characters, 1):
                connection.execute(text("""
                    INSERT INTO game_characters (game_id, character_name, sort_order) 
                    VALUES (:game_id, :character_name, :sort_order)
                """), {
                    "game_id": 1,
                    "character_name": char_name,
                    "sort_order": i
                })
            
            # 妖々夢（Game ID: 2）のキャラクターを更新
            print("妖々夢のキャラクターを更新中...")
            connection.execute(text("DELETE FROM game_characters WHERE game_id = 2"))
            
            youyoumu_characters = [
                "霊夢A（霊符）",        # 霊符（ホーミング・誘導型）
                "霊夢B（夢符）",        # 夢符（連射型）
                "魔理沙A（魔符）",      # 魔符（パワー重視型）
                "魔理沙B（恋符）",      # 恋符（貫通レーザー型）
                "咲夜A（幻符）",        # 幻符（広範囲型）
                "咲夜B（時符）"         # 時符（特殊型）
            ]
            
            for i, char_name in enumerate(youyoumu_characters, 1):
                connection.execute(text("""
                    INSERT INTO game_characters (game_id, character_name, sort_order) 
                    VALUES (:game_id, :character_name, :sort_order)
                """), {
                    "game_id": 2,
                    "character_name": char_name,
                    "sort_order": i
                })
            
            # 永夜抄（Game ID: 3）のキャラクターを更新
            print("永夜抄のキャラクターを更新中...")
            connection.execute(text("DELETE FROM game_characters WHERE game_id = 3"))
            
            eiyashou_characters = [
                # 人妖タッグ（初期利用可能）
                "霊夢&紫（人妖タッグ）",       # 幻想の結界組
                "魔理沙&アリス（人妖タッグ）", # 禁呪の詠唱組
                "咲夜&レミリア（人妖タッグ）", # 夢幻の紅魔組
                "妖夢&幽々子（人妖タッグ）",   # 幽冥の住人組
                # 人間単体（全タッグで6B面クリア後解放）
                "霊夢（人間単体）",
                "魔理沙（人間単体）",
                "咲夜（人間単体）",
                "妖夢（人間単体）",
                # 妖怪単体（全タッグで6B面クリア後解放）
                "紫（妖怪単体）",
                "アリス（妖怪単体）",
                "レミリア（妖怪単体）",
                "幽々子（妖怪単体）"
            ]
            
            for i, char_name in enumerate(eiyashou_characters, 1):
                connection.execute(text("""
                    INSERT INTO game_characters (game_id, character_name, sort_order) 
                    VALUES (:game_id, :character_name, :sort_order)
                """), {
                    "game_id": 3,
                    "character_name": char_name,
                    "sort_order": i
                })
            
            # コミット
            trans.commit()
            print("キャラクターデータの更新が完了しました。")
            
            # 更新後の確認
            print("\n=== 更新後の確認 ===")
            for game_id, game_name in [(1, "紅魔郷"), (2, "妖々夢"), (3, "永夜抄")]:
                result = connection.execute(text("""
                    SELECT character_name FROM game_characters 
                    WHERE game_id = :game_id 
                    ORDER BY sort_order
                """), {"game_id": game_id})
                characters = result.fetchall()
                
                print(f"\n{game_name} (Game ID: {game_id}):")
                for char in characters:
                    print(f"  - {char[0]}")
                    
        except Exception as e:
            trans.rollback()
            print(f"エラーが発生しました: {e}")
            raise

if __name__ == "__main__":
    update_game_characters()