#!/usr/bin/env python3
"""
鬼形獣と虹龍洞のキャラクターデータを正しく更新
Wiki調査結果:
- 鬼形獣: 霊夢・魔理沙・妖夢 × 3アニマルスピリット
- 虹龍洞: 霊夢・魔理沙・咲夜・早苗 × アビリティカード
"""

import sqlite3
import sys
from pathlib import Path

# バックエンドディレクトリをパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

def update_kikeijuu_koryuudou_characters():
    """鬼形獣と虹龍洞のキャラクターデータを更新"""
    
    db_path = backend_dir / "touhou_clear_checker.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 鬼形獣と虹龍洞のゲームIDを確認
        cursor.execute("SELECT id, title FROM games WHERE title LIKE '%鬼形獣%' OR title LIKE '%虹龍洞%' ORDER BY id")
        games = cursor.fetchall()
        
        kikeijuu_id = None
        koryuudou_id = None
        
        for game_id, title in games:
            if '鬼形獣' in title:
                kikeijuu_id = game_id
            elif '虹龍洞' in title:
                koryuudou_id = game_id
        
        if not kikeijuu_id:
            print("❌ 鬼形獣のゲームデータが見つかりません")
            return
        if not koryuudou_id:
            print("❌ 虹龍洞のゲームデータが見つかりません")
            return
        
        print(f"✅ 鬼形獣ゲームID: {kikeijuu_id}")
        print(f"✅ 虹龍洞ゲームID: {koryuudou_id}")
        
        # === 鬼形獣の更新 ===
        print("\n=== 鬼形獣キャラクターデータ更新 ===")
        print("既存の鬼形獣キャラクターデータを削除...")
        cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (kikeijuu_id,))
        
        # Wiki調査結果に基づく正しい鬼形獣キャラクターデータ
        kikeijuu_characters = [
            # 霊夢 × 3アニマルスピリット
            ('霊夢（オオカミ）', '集中ショット強化、3個以上でハイパー化', 1),
            ('霊夢（カワウソ）', 'スペルカード強化、初期数+1、3個以上でバリア', 2),
            ('霊夢（オオワシ）', '拡散ショット強化、3個以上でハイパー化', 3),
            
            # 魔理沙 × 3アニマルスピリット  
            ('魔理沙（オオカミ）', '集中ショット強化、3個以上でハイパー化', 4),
            ('魔理沙（カワウソ）', 'スペルカード強化、初期数+1、3個以上でバリア', 5),
            ('魔理沙（オオワシ）', '拡散ショット強化、3個以上でハイパー化', 6),
            
            # 妖夢 × 3アニマルスピリット（早苗から変更）
            ('妖夢（オオカミ）', '集中ショット強化、3個以上でハイパー化', 7),
            ('妖夢（カワウソ）', 'スペルカード強化、初期数+1、3個以上でバリア', 8),
            ('妖夢（オオワシ）', '拡散ショット強化、3個以上でハイパー化', 9),
        ]
        
        # 鬼形獣キャラクター挿入
        for char_name, description, sort_order in kikeijuu_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order)
                VALUES (?, ?, ?, ?)
            """, (kikeijuu_id, char_name, description, sort_order))
        
        print("✅ 鬼形獣キャラクター更新完了")
        
        # === 虹龍洞の更新 ===
        print("\n=== 虹龍洞キャラクターデータ更新 ===")
        print("既存の虹龍洞キャラクターデータを削除...")
        cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (koryuudou_id,))
        
        # Wiki調査結果に基づく正しい虹龍洞キャラクターデータ（4キャラ）
        koryuudou_characters = [
            # 霊夢 × アビリティカード
            ('霊夢（陰陽玉）', 'アビリティカード組み合わせ', 1),
            ('霊夢（ホーミング特化）', 'アビリティカード組み合わせ', 2),
            ('霊夢（火力特化）', 'アビリティカード組み合わせ', 3),
            ('霊夢（バランス）', 'アビリティカード組み合わせ', 4),
            
            # 魔理沙 × アビリティカード
            ('魔理沙（ミニ八卦炉）', 'アビリティカード組み合わせ', 5),
            ('魔理沙（レーザー特化）', 'アビリティカード組み合わせ', 6),
            ('魔理沙（ミサイル）', 'アビリティカード組み合わせ', 7),
            ('魔理沙（火力特化）', 'アビリティカード組み合わせ', 8),
            
            # 咲夜 × アビリティカード（追加）
            ('咲夜（時間停止）', 'アビリティカード組み合わせ', 9),
            ('咲夜（ナイフ特化）', 'アビリティカード組み合わせ', 10),
            ('咲夜（防御特化）', 'アビリティカード組み合わせ', 11),
            ('咲夜（バランス）', 'アビリティカード組み合わせ', 12),
            
            # 早苗 × アビリティカード
            ('早苗（お守り）', 'アビリティカード組み合わせ', 13),
            ('早苗（ドラゴンキセル）', 'アビリティカード組み合わせ', 14),
            ('早苗（火力支援）', 'アビリティカード組み合わせ', 15),
            ('早苗（バランス）', 'アビリティカード組み合わせ', 16),
        ]
        
        # 虹龍洞キャラクター挿入
        for char_name, description, sort_order in koryuudou_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order)
                VALUES (?, ?, ?, ?)
            """, (koryuudou_id, char_name, description, sort_order))
        
        print("✅ 虹龍洞キャラクター更新完了")
        
        # データ確認
        print("\n📊 データ確認:")
        
        # 鬼形獣データ確認
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (kikeijuu_id,))
        kikeijuu_count = cursor.fetchone()[0]
        print(f"鬼形獣キャラクター数: {kikeijuu_count}")
        
        cursor.execute("""
            SELECT character_name FROM game_characters
            WHERE game_id = ? ORDER BY sort_order
        """, (kikeijuu_id,))
        kikeijuu_chars = [row[0] for row in cursor.fetchall()]
        
        print("\n📝 鬼形獣キャラクター一覧:")
        for base_char in ['霊夢', '魔理沙', '妖夢']:
            char_variants = [c for c in kikeijuu_chars if c.startswith(base_char)]
            print(f"{base_char}: {len(char_variants)}バリエーション")
            for variant in char_variants:
                print(f"  - {variant}")
        
        # 虹龍洞データ確認
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (koryuudou_id,))
        koryuudou_count = cursor.fetchone()[0]
        print(f"\n虹龍洞キャラクター数: {koryuudou_count}")
        
        cursor.execute("""
            SELECT character_name FROM game_characters
            WHERE game_id = ? ORDER BY sort_order
        """, (koryuudou_id,))
        koryuudou_chars = [row[0] for row in cursor.fetchall()]
        
        print("\n📝 虹龍洞キャラクター一覧:")
        for base_char in ['霊夢', '魔理沙', '咲夜', '早苗']:
            char_variants = [c for c in koryuudou_chars if c.startswith(base_char)]
            print(f"{base_char}: {len(char_variants)}バリエーション")
            for variant in char_variants:
                print(f"  - {variant}")
        
        # データベース変更をコミット
        conn.commit()
        print(f"\n🎉 鬼形獣・虹龍洞のキャラクターデータ更新完了！")
        print(f"📂 データベースファイル: {db_path}")
        print("\n📋 更新内容:")
        print("  - 鬼形獣: 早苗 → 妖夢に変更（霊夢・魔理沙・妖夢）")
        print("  - 虹龍洞: 咲夜を追加（霊夢・魔理沙・咲夜・早苗）")
        print("  - Wiki調査結果に基づく正確なデータ")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    update_kikeijuu_koryuudou_characters()