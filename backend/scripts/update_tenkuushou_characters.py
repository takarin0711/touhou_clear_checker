#!/usr/bin/env python3
"""
天空璋のキャラクターデータを正しく更新
Wiki調査結果: 霊夢、チルノ、文、魔理沙 × 4サブシーズン
"""

import sqlite3
import sys
from pathlib import Path

# バックエンドディレクトリをパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

def update_tenkuushou_characters():
    """天空璋のキャラクターデータを更新"""
    
    db_path = backend_dir / "touhou_clear_checker.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 天空璋（game_id=16）のデータを確認
        cursor.execute("SELECT id, title FROM games WHERE title LIKE '%天空璋%'")
        game_result = cursor.fetchone()
        
        if not game_result:
            print("❌ 天空璋のゲームデータが見つかりません")
            return
        
        game_id = game_result[0]
        print(f"✅ 天空璋ゲームID: {game_id}")
        
        # 既存の天空璋キャラクターデータを削除
        print("既存の天空璋キャラクターデータを削除...")
        
        # game_charactersから天空璋のデータを削除
        cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
        
        print("✅ 既存の天空璋データ削除完了")
        
        # 正しい天空璋キャラクターデータを追加
        print("\nWiki調査結果に基づく正しいキャラクターデータを投入中...")
        
        # 天空璋キャラクター: 霊夢、チルノ、文、魔理沙 × 4サブシーズン
        tenkuushou_characters = [
            # 霊夢 × 4サブシーズン
            ('霊夢（春）',),   # 弱いホーミング、長い無敵時間
            ('霊夢（夏）',),   # 低ゲージ消費、直接ダメージ
            ('霊夢（秋）',),   # 高ショット威力、独特な移動性能
            ('霊夢（冬）',),   # レーザー倍加バグで高ダメージ
            
            # チルノ × 4サブシーズン  
            ('チルノ（春）',), # 氷弾系攻撃、低速度・高耐久
            ('チルノ（夏）',),
            ('チルノ（秋）',),
            ('チルノ（冬）',),
            
            # 文 × 4サブシーズン
            ('文（春）',),     # 高速移動、風系攻撃
            ('文（夏）',),
            ('文（秋）',),
            ('文（冬）',),
            
            # 魔理沙 × 4サブシーズン
            ('魔理沙（春）',),
            ('魔理沙（夏）',),
            ('魔理沙（秋）',),
            ('魔理沙（冬）',), # 集中前方ショット、ボス戦特化
        ]
        
        # game_charactersテーブルに直接キャラクター名を挿入
        print("ゲーム・キャラクター対応関係を設定中...")
        for char_name, in tenkuushou_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order)
                VALUES (?, ?, ?, ?)
            """, (game_id, char_name, f"天空璋{char_name}", 0))
        
        print("✅ ゲーム・キャラクター対応関係設定完了")
        
        # データ確認
        print("\n📊 天空璋データ確認:")
        
        cursor.execute("""
            SELECT COUNT(*) FROM game_characters WHERE game_id = ?
        """, (game_id,))
        count = cursor.fetchone()[0]
        print(f"天空璋キャラクター数: {count}")
        
        # キャラクター一覧表示
        cursor.execute("""
            SELECT character_name FROM game_characters
            WHERE game_id = ?
            ORDER BY character_name
        """, (game_id,))
        characters = [row[0] for row in cursor.fetchall()]
        
        print("\n📝 天空璋キャラクター一覧:")
        for i, char in enumerate(characters, 1):
            print(f"  {i}. {char}")
        
        # キャラクター別グループ表示
        print("\n📝 キャラクター別分類:")
        for base_char in ['霊夢', 'チルノ', '文', '魔理沙']:
            char_variants = [c for c in characters if c.startswith(base_char)]
            print(f"\n{base_char}: {len(char_variants)}バリエーション")
            for variant in char_variants:
                print(f"  - {variant}")
        
        # データベース変更をコミット
        conn.commit()
        print(f"\n🎉 天空璋のキャラクターデータ更新完了！")
        print(f"📂 データベースファイル: {db_path}")
        print("\n📋 更新内容:")
        print("  - 早苗 → チルノ・文に変更")
        print("  - 4キャラ × 4サブシーズン = 16組み合わせ")
        print("  - Wiki調査結果に基づく正確なデータ")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    update_tenkuushou_characters()