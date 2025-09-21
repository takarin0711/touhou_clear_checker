#!/usr/bin/env python3
"""
風神録（東方風神録）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_fuujinroku_characters():
    """風神録のキャラクター（機体・装備タイプ）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 風神録のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%風神録%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 風神録のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"風神録のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"風神録には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 風神録のキャラクター（機体・装備タイプ）データ
        characters = [
            # 博麗霊夢
            {
                'character_name': '霊夢A（誘導装備）',
                'description': 'ホーミング弾 - 自動追尾弾で初心者向け',
                'sort_order': 10
            },
            {
                'character_name': '霊夢B（前方集中装備）',
                'description': '前方集中高火力 - 正面への集中攻撃',
                'sort_order': 20
            },
            {
                'character_name': '霊夢C（封印装備）',
                'description': '近距離特化 - 接近戦に特化した装備',
                'sort_order': 30
            },
            # 霧雨魔理沙
            {
                'character_name': '魔理沙A（高威力装備）',
                'description': '遠距離火力 - 遠距離からの高威力攻撃',
                'sort_order': 40
            },
            {
                'character_name': '魔理沙B（貫通装備）',
                'description': 'バグマリ - 貫通攻撃で複数敵を同時攻撃',
                'sort_order': 50
            },
            {
                'character_name': '魔理沙C（魔法使い装備）',
                'description': 'オプション戦略型 - オプションを使った戦略的攻撃',
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
        
        print(f"✅ 風神録に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 風神録キャラクターデータ追加スクリプト ===")
    success = add_fuujinroku_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")