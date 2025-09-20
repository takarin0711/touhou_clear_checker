#!/usr/bin/env python3
"""
永夜抄のキャラクターデータを正しく更新
Wiki調査結果: 人妖タッグ4種 + 人間単体4名 + 妖怪単体4名
"""

import sqlite3
import sys
from pathlib import Path

# バックエンドディレクトリをパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

def update_eiyashou_characters():
    """永夜抄のキャラクターデータを正しく更新"""
    
    db_path = backend_dir / "touhou_clear_checker.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 永夜抄のゲームIDを確認
        cursor.execute("SELECT id, title FROM games WHERE title LIKE '%永夜抄%'")
        game_result = cursor.fetchone()
        
        if not game_result:
            print("❌ 永夜抄のゲームデータが見つかりません")
            return
        
        game_id = game_result[0]
        print(f"✅ 永夜抄ゲームID: {game_id}")
        
        # 既存の永夜抄キャラクターデータを削除
        print("既存の永夜抄キャラクターデータを削除...")
        cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
        print("✅ 既存の永夜抄データ削除完了")
        
        # Wiki調査結果に基づく正しい永夜抄キャラクターデータ
        print("\nWiki調査結果に基づく正しいキャラクターデータを投入中...")
        
        eiyashou_characters = [
            # 人妖タッグ（初期利用可能）
            ('霊夢&紫（タッグ）', '幻想の結界組', 1),
            ('魔理沙&アリス（タッグ）', '禁呪の詠唱組', 2),
            ('咲夜&レミリア（タッグ）', '夢幻の紅魔組', 3),
            ('妖夢&幽々子（タッグ）', '幽冥の住人組', 4),
            
            # 人間単体（全タッグで6B面クリア後解放）
            ('霊夢（単体）', '人間キャラクター、全タッグ6B面クリア後解放', 5),
            ('魔理沙（単体）', '人間キャラクター、全タッグ6B面クリア後解放', 6),
            ('咲夜（単体）', '人間キャラクター、全タッグ6B面クリア後解放', 7),
            ('妖夢（単体）', '人間キャラクター、全タッグ6B面クリア後解放', 8),
            
            # 妖怪単体（全タッグで6B面クリア後解放）
            ('紫（単体）', '妖怪キャラクター、全タッグ6B面クリア後解放', 9),
            ('アリス（単体）', '妖怪キャラクター、全タッグ6B面クリア後解放', 10),
            ('レミリア（単体）', '妖怪キャラクター、全タッグ6B面クリア後解放', 11),
            ('幽々子（単体）', '妖怪キャラクター、全タッグ6B面クリア後解放', 12),
        ]
        
        # game_charactersテーブルに正しいデータを挿入
        print("ゲーム・キャラクター対応関係を設定中...")
        for char_name, description, sort_order in eiyashou_characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order)
                VALUES (?, ?, ?, ?)
            """, (game_id, char_name, description, sort_order))
        
        print("✅ ゲーム・キャラクター対応関係設定完了")
        
        # データ確認
        print("\n📊 永夜抄データ確認:")
        
        cursor.execute("""
            SELECT COUNT(*) FROM game_characters WHERE game_id = ?
        """, (game_id,))
        count = cursor.fetchone()[0]
        print(f"永夜抄キャラクター数: {count}")
        
        # キャラクター一覧表示
        cursor.execute("""
            SELECT character_name, description FROM game_characters
            WHERE game_id = ?
            ORDER BY sort_order
        """, (game_id,))
        characters = cursor.fetchall()
        
        print("\n📝 永夜抄キャラクター一覧:")
        
        print("\n🤝 人妖タッグ（初期利用可能）:")
        for i, (char_name, desc) in enumerate(characters[:4], 1):
            print(f"  {i}. {char_name} - {desc}")
        
        print("\n👤 人間単体（全タッグ6B面クリア後解放）:")
        for i, (char_name, desc) in enumerate(characters[4:8], 1):
            print(f"  {i}. {char_name}")
        
        print("\n👻 妖怪単体（全タッグ6B面クリア後解放）:")
        for i, (char_name, desc) in enumerate(characters[8:12], 1):
            print(f"  {i}. {char_name}")
        
        # 8キャラクター分類表示
        print("\n📝 8キャラクター分類:")
        human_chars = ['霊夢', '魔理沙', '咲夜', '妖夢']
        youkai_chars = ['紫', 'アリス', 'レミリア', '幽々子']
        
        print(f"人間キャラクター: {', '.join(human_chars)}")
        print(f"妖怪キャラクター: {', '.join(youkai_chars)}")
        
        # データベース変更をコミット
        conn.commit()
        print(f"\n🎉 永夜抄のキャラクターデータ更新完了！")
        print(f"📂 データベースファイル: {db_path}")
        print("\n📋 更新内容:")
        print("  - Wiki調査結果に基づく正確な8キャラクター")
        print("  - 人妖タッグ4種（初期利用可能）")
        print("  - 人間単体4名（解放後）")
        print("  - 妖怪単体4名（解放後）")
        print("  - 慧音&妹紅を削除（正式キャラクターではない）")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    update_eiyashou_characters()