#!/usr/bin/env python3
"""
adminユーザー作成スクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.database.connection import SessionLocal
from infrastructure.database.models.user_model import UserModel
from infrastructure.security.password_hasher import PasswordHasher
from infrastructure.security.token_generator import TokenGenerator
from datetime import datetime
from pathlib import Path


def load_admin_password() -> str:
    """secrets/.admin_passwordからパスワードを読み込む"""
    # Docker環境とネイティブ環境両方に対応
    password_paths = [
        Path(__file__).parent.parent.parent / "secrets" / ".admin_password",  # ネイティブ環境
        Path("/app/secrets/.admin_password"),  # Docker環境（マウント想定）
        Path("/secrets/.admin_password"),     # Docker環境（代替パス）
    ]
    
    password_file = None
    for path in password_paths:
        if path.exists():
            password_file = path
            break
    
    if password_file is None:
        print(f"⚠️ パスワードファイルが見つかりません。確認したパス:")
        for path in password_paths:
            print(f"   - {path}")
        print("   デフォルトパスワードを使用します: admin123")
        return "admin123"
        
    try:
        password = password_file.read_text().strip()
        if not password:
            print("⚠️ パスワードファイルが空です。デフォルトパスワードを使用します。")
            return "admin123"
        print(f"🔐 パスワードファイルから読み込み完了: {password_file}")
        return password
    except Exception as e:
        print(f"❌ パスワードファイル読み込みエラー: {e}")
        print("   デフォルトパスワードを使用します: admin123")
        return "admin123"


def create_admin_user(username: str = "admin", email: str = "admin@example.com", password: str = None):
    """adminユーザーを作成する"""
    
    # パスワードが指定されていない場合はファイルから読み込み
    if password is None:
        password = load_admin_password()
    
    with SessionLocal() as session:
        # 既存のユーザーを確認
        existing_user = session.query(UserModel).filter(
            (UserModel.username == username) | (UserModel.email == email)
        ).first()
        
        if existing_user:
            print(f"❌ ユーザーが既に存在します:")
            print(f"   - ID: {existing_user.id}")
            print(f"   - ユーザー名: {existing_user.username}")
            print(f"   - メール: {existing_user.email}")
            print(f"   - 管理者: {existing_user.is_admin}")
            print(f"   - 認証済み: {existing_user.email_verified}")
            return False
            
        # パスワードハッシュ化
        password_hasher = PasswordHasher()
        hashed_password = password_hasher.hash_password(password)
        
        # 認証トークン生成
        verification_token = TokenGenerator.generate_verification_token()
        
        # adminユーザー作成
        admin_user = UserModel(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_admin=True,
            email_verified=True,  # adminは認証済みとする
            verification_token=verification_token
        )
        
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        
        print(f"✅ adminユーザーが作成されました:")
        print(f"   - ID: {admin_user.id}")
        print(f"   - ユーザー名: {admin_user.username}")
        print(f"   - メール: {admin_user.email}")
        print(f"   - 管理者: {admin_user.is_admin}")
        print(f"   - 認証済み: {admin_user.email_verified}")
        print(f"   - パスワード: {password}")
        
        return True


def list_all_users():
    """全ユーザーを一覧表示する"""
    
    with SessionLocal() as session:
        users = session.query(UserModel).all()
        
        print(f"📋 登録済みユーザー数: {len(users)}")
        if users:
            for user in users:
                print(f"  - ID: {user.id}, ユーザー名: {user.username}, メール: {user.email}, 管理者: {user.is_admin}, 認証済み: {user.email_verified}")
        else:
            print("  ユーザーが登録されていません")


def main():
    """メイン処理"""
    print("🔍 現在のユーザー一覧:")
    list_all_users()
    
    print("\n" + "="*50)
    
    # adminユーザー作成
    if len(sys.argv) > 1:
        if sys.argv[1] == "--create":
            username = input("adminユーザー名 (デフォルト: admin): ") or "admin"
            email = input("adminメールアドレス (デフォルト: admin@example.com): ") or "admin@example.com"
            
            # パスワードファイルから読み込みを試行
            default_password = load_admin_password()
            password = input(f"adminパスワード (デフォルト: {default_password}): ") or default_password
            
            print(f"\n📝 adminユーザーを作成します:")
            print(f"   - ユーザー名: {username}")
            print(f"   - メール: {email}")
            print(f"   - パスワード: {password}")
            
            confirm = input("\n作成しますか? (y/N): ")
            if confirm.lower() in ['y', 'yes']:
                create_admin_user(username, email, password)
            else:
                print("❌ キャンセルされました")
        elif sys.argv[1] == "--list":
            # 一覧表示のみ
            pass
        else:
            print("使用方法: python create_admin_user.py [--create|--list]")
    else:
        print("📝 使用方法:")
        print("  python create_admin_user.py --create  # adminユーザー作成")
        print("  python create_admin_user.py --list    # ユーザー一覧表示")


if __name__ == "__main__":
    main()