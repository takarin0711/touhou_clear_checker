#!/usr/bin/env python3
"""
輝針城（東方輝針城）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_kishinjo_characters():
    """輝針城のキャラクター（機体・妖器タイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 輝針城のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%輝針城%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 輝針城のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"輝針城のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"輝針城には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 輝針城のキャラクター（機体・妖器タイプ）データ
        characters = [
            # 博麗霊夢
            {
                'character_name': '霊夢A（お祓い棒）',
                'description': '妖器・魔理沙砲戦術 - お祓い棒による特殊攻撃',
                'sort_order': 10
            },
            {
                'character_name': '霊夢B（妖器なし）',
                'description': 'ホーミング針攻撃 - 標準的なホーミング攻撃',
                'sort_order': 20
            },
            # 霧雨魔理沙
            {
                'character_name': '魔理沙A（ミニ八卦路）',
                'description': '遠距離ダメージ低 - ミニ八卦路による特殊攻撃',
                'sort_order': 30
            },
            {
                'character_name': '魔理沙B（妖器なし）',
                'description': '最強ファーミング性能 - アイテム収集に最適',
                'sort_order': 40
            },
            # 十六夜咲夜
            {
                'character_name': '咲夜A（シルバーブレード）',
                'description': 'バリアボム・防御特化 - シルバーブレードによる防御型',
                'sort_order': 50
            },
            {
                'character_name': '咲夜B（妖器なし）',
                'description': '咲夜A劣化版 - 標準的な時間操作攻撃',
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
        
        print(f"✅ 輝針城に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 輝針城キャラクターデータ追加スクリプト ===")
    success = add_kishinjo_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")