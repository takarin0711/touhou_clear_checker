#!/usr/bin/env python3
"""
星蓮船（東方星蓮船）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_seirenshipan_characters():
    """星蓮船のキャラクター（機体・ショットタイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 星蓮船のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%星蓮船%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 星蓮船のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"星蓮船のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"星蓮船には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 星蓮船のキャラクター（機体・ショットタイプ）データ
        characters = [
            # 博麗霊夢
            {
                'character_name': '霊夢A（一点集中攻撃力重視型）',
                'description': 'ホーミング安定型 - 自動追尾で安定した攻撃',
                'sort_order': 10
            },
            {
                'character_name': '霊夢B（アンチパターン重視超誘導型）',
                'description': '直線火力型 - パターン破りの強力な直線攻撃',
                'sort_order': 20
            },
            # 霧雨魔理沙
            {
                'character_name': '魔理沙A（無限貫通＆常時攻撃型）',
                'description': '前方集中型 - 無限貫通による前方集中攻撃',
                'sort_order': 30
            },
            {
                'character_name': '魔理沙B（超攻撃範囲重視型）',
                'description': '貫通特化 - 広範囲への貫通攻撃特化',
                'sort_order': 40
            },
            # 東風谷早苗
            {
                'character_name': '早苗A（一点集中＆誘導型）',
                'description': '一点集中・誘導型 - 集中攻撃と誘導の組み合わせ',
                'sort_order': 50
            },
            {
                'character_name': '早苗B（高威力＆広範囲炸裂型）',
                'description': '高威力・広範囲爆発型 - 爆発による広範囲攻撃',
                'sort_order': 60
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
        
        print(f"✅ 星蓮船に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 星蓮船キャラクターデータ追加スクリプト ===")
    success = add_seirenshipan_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")