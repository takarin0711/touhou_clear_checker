#!/usr/bin/env python3
"""
神霊廟（東方神霊廟）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_shinreibyou_characters():
    """神霊廟のキャラクター（機体・ショットタイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 神霊廟のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%神霊廟%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 神霊廟のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"神霊廟のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"神霊廟には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 神霊廟のキャラクター（機体・ショットタイプ）データ
        characters = [
            # 博麗霊夢
            {
                'character_name': '霊夢',
                'description': '広範囲ホーミング・霊収集優秀 - 自動追尾と霊力回収が得意',
                'sort_order': 10
            },
            # 霧雨魔理沙
            {
                'character_name': '魔理沙',
                'description': 'トランス攻撃力特化 - トランス状態での攻撃力に優れる',
                'sort_order': 20
            },
            # 東風谷早苗
            {
                'character_name': '早苗',
                'description': '広範囲・ライフボム獲得 - 広範囲攻撃とライフボム回収',
                'sort_order': 30
            },
            # 魂魄妖夢
            {
                'character_name': '妖夢',
                'description': '溜め撃ち斬撃・高難易度向け - 溜め攻撃による高威力斬撃',
                'sort_order': 40
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
        
        print(f"✅ 神霊廟に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 神霊廟キャラクターデータ追加スクリプト ===")
    success = add_shinreibyou_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")