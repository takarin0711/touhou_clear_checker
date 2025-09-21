"""
clear_recordテーブルのデータを全て削除するスクリプト
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from infrastructure.database.connection import DATABASE_URL

def cleanup_clear_records():
    """clear_recordテーブルのデータを全て削除"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # 現在のデータ数を確認
        print("=== 削除前の確認 ===")
        result = connection.execute(text("SELECT COUNT(*) FROM clear_records"))
        count = result.fetchone()[0]
        print(f"現在のclear_recordsテーブルのレコード数: {count}")
        
        if count > 0:
            # テーブル構造を確認
            print("\nclear_recordsテーブルの構造:")
            result = connection.execute(text("PRAGMA table_info(clear_records)"))
            columns = result.fetchall()
            for col in columns:
                print(f"  {col[1]} ({col[2]})")
            
            # データの一部を表示
            print("\n現在のデータの一部:")
            result = connection.execute(text("SELECT * FROM clear_records LIMIT 5"))
            records = result.fetchall()
            for record in records:
                print(f"Record: {record}")
        
        # トランザクション開始
        trans = connection.begin()
        
        try:
            # 全てのデータを削除
            print(f"\n{count}件のレコードを削除中...")
            result = connection.execute(text("DELETE FROM clear_records"))
            print(f"削除完了: {result.rowcount}件のレコードが削除されました")
            
            # 確認
            result = connection.execute(text("SELECT COUNT(*) FROM clear_records"))
            new_count = result.fetchone()[0]
            print(f"削除後のレコード数: {new_count}")
            
            # コミット
            trans.commit()
            print("削除処理が正常に完了しました。")
            
        except Exception as e:
            trans.rollback()
            print(f"エラーが発生しました: {e}")
            raise

if __name__ == "__main__":
    cleanup_clear_records()