#!/usr/bin/env python3
"""
紺珠伝（東方紺珠伝）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_kanjuden_characters():
    """紺珠伝のキャラクター（機体・ショットタイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 紺珠伝のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%紺珠伝%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 紺珠伝のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"紺珠伝のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"紺珠伝には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 紺珠伝のキャラクター（機体・ショットタイプ）データ
        characters = [
            # 博麗霊夢
            {
                'character_name': '霊夢',
                'description': 'ホーミング・当たり判定小 - 初心者向け、誘導弾で楽に攻撃',
                'sort_order': 10
            },
            # 霧雨魔理沙
            {
                'character_name': '魔理沙',
                'description': '高火力・狭範囲 - 上級者向け、集中攻撃で高ダメージ',
                'sort_order': 20
            },
            # 東風谷早苗
            {
                'character_name': '早苗',
                'description': '広範囲・ホーミング集中 - バランス型、雑魚散らしが得意',
                'sort_order': 30
            },
            # 鈴仙・優曇華院・イナバ
            {
                'character_name': '鈴仙',
                'description': '貫通弾・3発バリア - 特殊性能、バリアによる耐久性向上',
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
        
        print(f"✅ 紺珠伝に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 紺珠伝キャラクターデータ追加スクリプト ===")
    success = add_kanjuden_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")