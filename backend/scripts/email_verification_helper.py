#!/usr/bin/env python3
"""
メール認証システム開発支援スクリプト
東方プロジェクトクリア状況チェッカー用

Usage:
    python scripts/email_verification_helper.py [options]
    
Options:
    --show-url <username>     : 特定ユーザーの認証URLを表示
    --show-latest-url         : 最新の未認証ユーザーの認証URLを表示
    --check-status <username> : ユーザーの認証状態を確認
    --list-unverified         : 全未認証ユーザーを一覧表示
    --cleanup-expired         : 期限切れトークンをクリーンアップ
    --help                    : このヘルプを表示
"""

import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from infrastructure.database.connection import get_db
from infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl


class EmailVerificationHelper:
    """メール認証支援クラス"""
    
    def __init__(self):
        self.db = next(get_db())
        self.repo = UserRepositoryImpl(self.db)
        self.base_url = "http://localhost:3000"
    
    def __del__(self):
        """デストラクタでDBコネクションを閉じる"""
        if hasattr(self, 'db'):
            self.db.close()
    
    def show_verification_url(self, username: str):
        """特定ユーザーの認証URLを表示"""
        user = self.repo.get_by_username(username)
        
        if not user:
            print(f"❌ ユーザー '{username}' が見つかりません。")
            return False
        
        print('=' * 60)
        print('📧 メール認証URL（開発環境）')
        print('=' * 60)
        print(f'ユーザー名: {user.username}')
        print(f'メールアドレス: {user.email}')
        print(f'メール認証済み: {"✅ はい" if user.email_verified else "❌ いいえ"}')
        
        if user.verification_token:
            # トークンの有効期限確認
            if user.verification_token_expires_at:
                expires_at = user.verification_token_expires_at
                now = datetime.utcnow()
                if expires_at > now:
                    remaining = expires_at - now
                    print(f'トークン有効期限: {expires_at} (残り{remaining})')
                else:
                    print(f'⚠️  トークン期限切れ: {expires_at}')
            
            print(f'認証URL:')
            print(f'{self.base_url}?token={user.verification_token}')
            print('=' * 60)
            print('上記URLをブラウザでアクセスしてください')
            print('=' * 60)
            return True
        else:
            print('認証トークンがありません。')
            if user.email_verified:
                print('✅ このユーザーは既にメール認証済みです！')
            else:
                print('❌ 認証トークンが見つかりません。')
            return False
    
    def show_latest_unverified_url(self):
        """最新の未認証ユーザーの認証URLを表示"""
        users = self.repo.get_all()
        unverified_users = [u for u in users if not u.email_verified and u.verification_token]
        
        if not unverified_users:
            print('❌ 未認証のユーザーがいません。')
            return False
        
        # 最新のユーザー（作成日時順）
        user = max(unverified_users, key=lambda u: u.created_at)
        
        print('=' * 60)
        print('📧 最新の未認証ユーザーの認証URL')
        print('=' * 60)
        print(f'ユーザー名: {user.username}')
        print(f'メールアドレス: {user.email}')
        print(f'作成日時: {user.created_at}')
        
        # トークンの有効期限確認
        if user.verification_token_expires_at:
            expires_at = user.verification_token_expires_at
            now = datetime.utcnow()
            if expires_at > now:
                remaining = expires_at - now
                print(f'トークン有効期限: {expires_at} (残り{remaining})')
            else:
                print(f'⚠️  トークン期限切れ: {expires_at}')
        
        print(f'認証URL:')
        print(f'{self.base_url}?token={user.verification_token}')
        print('=' * 60)
        return True
    
    def check_user_status(self, username: str):
        """ユーザーの認証状態を確認"""
        user = self.repo.get_by_username(username)
        
        if not user:
            print(f"❌ ユーザー '{username}' が見つかりません。")
            return False
        
        print('=' * 50)
        print('👤 ユーザー認証状態')
        print('=' * 50)
        print(f'ユーザー名: {user.username}')
        print(f'メールアドレス: {user.email}')
        print(f'メール認証済み: {"✅ はい" if user.email_verified else "❌ いいえ"}')
        print(f'認証トークン: {"なし" if not user.verification_token else "あり"}')
        print(f'アクティブ: {"✅ はい" if user.is_active else "❌ いいえ"}')
        print(f'管理者権限: {"✅ はい" if user.is_admin else "❌ いいえ"}')
        print(f'作成日時: {user.created_at}')
        
        if user.verification_token_expires_at:
            expires_at = user.verification_token_expires_at
            now = datetime.utcnow()
            if expires_at > now:
                remaining = expires_at - now
                print(f'トークン有効期限: {expires_at} (残り{remaining})')
            else:
                print(f'⚠️  トークン期限切れ: {expires_at}')
        
        print('=' * 50)
        return True
    
    def list_unverified_users(self):
        """全未認証ユーザーを一覧表示"""
        users = self.repo.get_all()
        unverified_users = [u for u in users if not u.email_verified]
        
        if not unverified_users:
            print('✅ 未認証のユーザーはいません。')
            return
        
        print('=' * 80)
        print('📋 未認証ユーザー一覧')
        print('=' * 80)
        print(f'{"No":<3} {"ユーザー名":<15} {"メールアドレス":<25} {"トークン":<8} {"作成日時":<20}')
        print('-' * 80)
        
        for i, user in enumerate(unverified_users, 1):
            has_token = "あり" if user.verification_token else "なし"
            created_at = user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else 'N/A'
            print(f'{i:<3} {user.username:<15} {user.email:<25} {has_token:<8} {created_at:<20}')
        
        print('=' * 80)
        print(f'合計: {len(unverified_users)}名の未認証ユーザー')
        print('=' * 80)
    
    def cleanup_expired_tokens(self):
        """期限切れトークンをクリーンアップ"""
        print('🧹 期限切れトークンのクリーンアップを開始...')
        
        users = self.repo.get_all()
        now = datetime.utcnow()
        expired_count = 0
        
        for user in users:
            if (user.verification_token and 
                user.verification_token_expires_at and 
                user.verification_token_expires_at < now):
                
                print(f'期限切れトークンを削除: {user.username} (期限: {user.verification_token_expires_at})')
                
                # トークンをクリア
                user.verification_token = None
                user.verification_token_expires_at = None
                user.updated_at = now
                
                # データベースに保存
                self.db.commit()
                expired_count += 1
        
        if expired_count > 0:
            print(f'✅ {expired_count}個の期限切れトークンを削除しました。')
        else:
            print('✅ 期限切れトークンはありませんでした。')


def main():
    parser = argparse.ArgumentParser(description='メール認証システム開発支援スクリプト')
    parser.add_argument('--show-url', metavar='USERNAME', help='特定ユーザーの認証URLを表示')
    parser.add_argument('--show-latest-url', action='store_true', help='最新の未認証ユーザーの認証URLを表示')
    parser.add_argument('--check-status', metavar='USERNAME', help='ユーザーの認証状態を確認')
    parser.add_argument('--list-unverified', action='store_true', help='全未認証ユーザーを一覧表示')
    parser.add_argument('--cleanup-expired', action='store_true', help='期限切れトークンをクリーンアップ')
    
    args = parser.parse_args()
    
    # 引数が何も指定されていない場合はヘルプを表示
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    try:
        helper = EmailVerificationHelper()
        
        if args.show_url:
            helper.show_verification_url(args.show_url)
        
        if args.show_latest_url:
            helper.show_latest_url()
        
        if args.check_status:
            helper.check_user_status(args.check_status)
        
        if args.list_unverified:
            helper.list_unverified_users()
        
        if args.cleanup_expired:
            helper.cleanup_expired_tokens()
            
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())