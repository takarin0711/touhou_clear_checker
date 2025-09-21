#!/usr/bin/env python3
"""
花映塚（東方花映塚）のキャラクターデータをgame_charactersテーブルに追加するスクリプト
"""

import sqlite3
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_hanaeizuka_characters():
    """花映塚のキャラクター（対戦型16名）データを追加"""
    
    # データベース接続
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'touhou_clear_checker.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 花映塚のゲームIDを取得
        cursor.execute("SELECT id FROM games WHERE title LIKE '%花映塚%'")
        result = cursor.fetchone()
        if not result:
            print("エラー: 花映塚のゲームデータが見つかりません")
            return False
            
        game_id = result[0]
        print(f"花映塚のゲームID: {game_id}")
        
        # 既存のキャラクターデータをチェック
        cursor.execute("SELECT COUNT(*) FROM game_characters WHERE game_id = ?", (game_id,))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"花映塚には既に {existing_count} 件のキャラクターデータが存在します。既存データを削除して再追加します。")
            cursor.execute("DELETE FROM game_characters WHERE game_id = ?", (game_id,))
            print("既存データを削除しました。")
        
        # 花映塚のキャラクター（対戦型プレイアブル16名）データ
        characters = [
            # メインキャラクター
            {
                'character_name': '霊夢',
                'description': 'チャージ特化 - 霊力チャージで強力な攻撃',
                'sort_order': 10
            },
            {
                'character_name': '魔理沙',
                'description': '速度特化 - 高速移動と機動力',
                'sort_order': 20
            },
            {
                'character_name': '咲夜',
                'description': '時間操作 - 時間停止による戦術',
                'sort_order': 30
            },
            {
                'character_name': '妖夢',
                'description': '半霊攻撃 - 半霊を使った特殊攻撃',
                'sort_order': 40
            },
            {
                'character_name': '鈴仙',
                'description': '狂気効果 - 相手に幻覚と混乱を与える',
                'sort_order': 50
            },
            {
                'character_name': 'チルノ',
                'description': '氷結攻撃 - 氷の攻撃で敵を凍らせる',
                'sort_order': 60
            },
            # プリズムリバー三姉妹
            {
                'character_name': 'リリカ',
                'description': '騒霊・音響 - キーボードによる音響攻撃',
                'sort_order': 70
            },
            {
                'character_name': 'メルラン',
                'description': '幻想演奏 - トランペットによる幻想演奏',
                'sort_order': 80
            },
            {
                'character_name': 'ルナサ',
                'description': '憂鬱音色 - バイオリンによる憂鬱な音色',
                'sort_order': 90
            },
            # その他キャラクター
            {
                'character_name': 'ミスティア',
                'description': '夜雀歌声 - 夜雀の歌声で相手を惑わす',
                'sort_order': 100
            },
            {
                'character_name': 'てゐ',
                'description': 'ラッキー効果 - 幸運による特殊効果',
                'sort_order': 110
            },
            {
                'character_name': '文',
                'description': '風・取材 - 風の力と取材による攻撃',
                'sort_order': 120
            },
            {
                'character_name': 'メディスン',
                'description': '毒攻撃 - 毒による継続ダメージ',
                'sort_order': 130
            },
            {
                'character_name': '幽香',
                'description': '花・自然 - 花と自然の力による攻撃',
                'sort_order': 140
            },
            {
                'character_name': '小町',
                'description': '距離操作 - 距離を操る特殊能力',
                'sort_order': 150
            },
            {
                'character_name': '映姫',
                'description': '審判の力 - 白黒の審判による攻撃',
                'sort_order': 160
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
        
        print(f"✅ 花映塚に {count} 件のキャラクターデータを追加しました:")
        
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
    print("=== 花映塚キャラクターデータ追加スクリプト ===")
    success = add_hanaeizuka_characters()
    if success:
        print("✅ 処理が完了しました。")
    else:
        print("❌ 処理に失敗しました。")