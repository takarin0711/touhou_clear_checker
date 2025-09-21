#!/usr/bin/env python3
"""
妖精大戦争（東方妖精大戦争）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_daisensou_characters():
    """妖精大戦争のキャラクター（機体・ショットタイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 妖精大戦争のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%妖精大戦争%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 妖精大戦争のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"妖精大戦争のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"妖精大戦争には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 妖精大戦争のキャラクター（機体・ショットタイプ）データ
        characters = [
            # チルノ
            {
                'character_name': 'チルノ',
                'description': 'アイスバリア・フリージング機能 - 氷の盾で防御、敵の動きを凍らせる特殊攻撃',
                'sort_order': 10
            }
        ]
        
        # キャラクターデータを挿入
        for char in characters:
            cursor.execute("""
                INSERT INTO game_characters (game_id, character_name, description, sort_order)
                VALUES (?, ?, ?, ?)
            """, (game_id, char['character_name'], char['description'], char['sort_order']))
            
        conn.commit()
        
        # 結果を確認
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        count = cursor.fetchone()[0]
        
        print(f"✅ 妖精大戦争に {count} 件のキャラクターデータを追加しました:")
        
        # 追加されたデータを表示
        cursor.execute("""
            SELECT id, character_name, description 
            FROM game_characters 
            WHERE game_id = ? 
            ORDER BY sort_order ASC
        """, (game_id,))
        
        for row in cursor.fetchall():
            print(f"  - ID:{row[0]} {row[1]} ({row[2][:50]}{'...' if len(row[2]) > 50 else ''})")
            
        return True
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("=== 妖精大戦争キャラクターデータ追加スクリプト ===")
    success = add_daisensou_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")