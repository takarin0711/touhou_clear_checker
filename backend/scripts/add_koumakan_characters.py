#!/usr/bin/env python3
"""
紅魔郷（東方紅魔郷）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_koumakan_characters():
    """紅魔郷のキャラクター（機体・ショットタイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 紅魔郷のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%紅魔郷%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 紅魔郷のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"紅魔郷のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"紅魔郷には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 紅魔郷のキャラクター（機体・ショットタイプ）データ
        characters = [
            # 博麗霊夢
            {
                'character_name': '霊夢A（霊符）',
                'description': 'ホーミングアミュレット - 誘導型、道中が楽、雑なパターンでも敵を倒せる',
                'sort_order': 10
            },
            {
                'character_name': '霊夢B（夢符）',
                'description': 'パスウェイジョンニードル - 前方範囲型、攻撃力と範囲に優れる',
                'sort_order': 20
            },
            # 霧雨魔理沙
            {
                'character_name': '魔理沙A（魔符）',
                'description': 'マジックミサイル - 正面集中型、最高の遠距離攻撃力、炸裂効果あり',
                'sort_order': 30
            },
            {
                'character_name': '魔理沙B（恋符）',
                'description': 'イリュージョンレーザー - 貫通レーザー型',
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
        
        print(f"✅ 紅魔郷に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 紅魔郷キャラクターデータ追加スクリプト ===")
    success = add_koumakan_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")