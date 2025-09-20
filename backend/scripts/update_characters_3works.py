#!/usr/bin/env python3
"""
Wiki調査結果を基に紅魔郷・妖々夢・永夜抄の正確なキャラクターデータを投入
"""

import sqlite3
import sys
from pathlib import Path

# バックエンドディレクトリをパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

def update_characters_3works():
    """紅魔郷・妖々夢・永夜抄のキャラクターデータを更新"""
    
    db_path = backend_dir / "touhou_clear_checker.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("既存のキャラクターデータを削除...")
        
        # 既存のキャラクター関連データを全削除
        cursor.execute("DELETE FROM game_characters")
        cursor.execute("DELETE FROM characters")
        cursor.execute("DELETE FROM clear_records")
        
        # AUTO_INCREMENTをリセット
        cursor.execute("DELETE FROM sqlite_sequence WHERE name = 'characters'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name = 'game_characters'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name = 'clear_records'")
        
        print("✅ 既存データ削除完了")
        
        print("\n正確なキャラクターデータを投入中...")
        
        # Wiki調査結果を基にした正確なキャラクターデータ
        characters_data = [
            # 東方紅魔郷（6作目）
            ('霊夢A',),    # 霊符（ホーミングアミュレット）
            ('霊夢B',),    # 夢符（パスウェイジョンニードル）
            ('魔理沙A',),  # 魔符（マジックミサイル）
            ('魔理沙B',),  # 恋符（イリュージョンレーザー）
            
            # 東方妖々夢（7作目）追加キャラ
            ('咲夜A',),    # 幻符（広範囲型）
            ('咲夜B',),    # 時符（特殊型）
            
            # 東方永夜抄（8作目）人妖タッグ
            ('霊夢&紫（タッグ）',),       # 幻想の結界組
            ('魔理沙&アリス（タッグ）',), # 禁呪の詠唱組
            ('咲夜&レミリア（タッグ）',), # 夢幻の紅魔組
            ('妖夢&幽々子（タッグ）',),   # 幽冥の住人組
            
            # 東方永夜抄（8作目）人間単体（6B面クリア後解放）
            ('霊夢（単体）',),
            ('魔理沙（単体）',),
            ('咲夜（単体）',),
            ('妖夢（単体）',),
            
            # 東方永夜抄（8作目）妖怪単体（6B面クリア後解放）
            ('紫（単体）',),
            ('アリス（単体）',),
            ('レミリア（単体）',),
            ('幽々子（単体）',),
        ]
        
        cursor.executemany("INSERT INTO characters (name) VALUES (?)", characters_data)
        print(f"✅ {len(characters_data)}キャラクター投入完了")
        
        # ゲーム・キャラクター対応関係の設定
        print("\nゲーム・キャラクター対応関係を設定中...")
        
        # 東方紅魔郷（game_id=1）: 霊夢A/B、魔理沙A/B
        kouma_characters = [1, 2, 3, 4]  # 霊夢A, 霊夢B, 魔理沙A, 魔理沙B
        for char_id in kouma_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_id, is_available)
                VALUES (?, ?, ?)
            """, (1, char_id, True))
        
        # 東方妖々夢（game_id=2）: 霊夢A/B、魔理沙A/B、咲夜A/B
        youyoumu_characters = [1, 2, 3, 4, 5, 6]  # 上記 + 咲夜A, 咲夜B
        for char_id in youyoumu_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_id, is_available)
                VALUES (?, ?, ?)
            """, (2, char_id, True))
        
        # 東方永夜抄（game_id=3）: タッグ + 単体キャラ
        eiyashou_characters = list(range(7, 19))  # ID 7-18（タッグ4種 + 単体8種）
        for char_id in eiyashou_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_id, is_available)
                VALUES (?, ?, ?)
            """, (3, char_id, True))
        
        print("✅ ゲーム・キャラクター対応関係設定完了")
        
        # データ確認
        print("\n📊 データ確認:")
        
        # キャラクター総数
        cursor.execute("SELECT COUNT(*) FROM characters")
        char_count = cursor.fetchone()[0]
        print(f"登録キャラクター数: {char_count}")
        
        # 作品別キャラクター数
        for game_id, game_name in [(1, "紅魔郷"), (2, "妖々夢"), (3, "永夜抄")]:
            cursor.execute("""
                SELECT COUNT(*) FROM game_characters WHERE game_id = ?
            """, (game_id,))
            count = cursor.fetchone()[0]
            print(f"{game_name}: {count}キャラクター")
        
        # 各作品のキャラクター一覧表示
        print("\n📝 作品別キャラクター一覧:")
        
        for game_id, game_name in [(1, "紅魔郷"), (2, "妖々夢"), (3, "永夜抄")]:
            cursor.execute("""
                SELECT c.name FROM game_characters gc
                JOIN characters c ON gc.character_id = c.id
                WHERE gc.game_id = ?
                ORDER BY c.id
            """, (game_id,))
            characters = [row[0] for row in cursor.fetchall()]
            print(f"\n{game_name}:")
            for i, char in enumerate(characters, 1):
                print(f"  {i}. {char}")
        
        # データベース変更をコミット
        conn.commit()
        print(f"\n🎉 紅魔郷・妖々夢・永夜抄のキャラクターデータ更新完了！")
        print(f"📂 データベースファイル: {db_path}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    update_characters_3works()