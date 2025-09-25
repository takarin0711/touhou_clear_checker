import os
from abc import ABC, abstractmethod
from typing import Optional


class EmailSender(ABC):
    """メール送信の技術的実装を担当するインターフェース"""
    
    @abstractmethod
    def send_email(self, to_email: str, subject: str, text_body: str, html_body: str) -> bool:
        """メール送信の実装"""
        pass


class EmailService:
    """メール送信のビジネスロジックを担当するサービス"""
    
    def __init__(self, email_sender: EmailSender):
        self.email_sender = email_sender
        self.base_url = os.getenv("BASE_URL", "http://localhost:3000")
    
    def send_verification_email(self, to_email: str, username: str, verification_token: str) -> bool:
        """メールアドレス認証メールを送信"""
        verification_url = f"{self.base_url}/verify-email?token={verification_token}"
        
        subject = "東方プロジェクト クリアチェッカー - メールアドレス認証"
        
        html_body = f"""
        <html>
        <head></head>
        <body>
            <h2>メールアドレス認証</h2>
            <p>{username} さん、</p>
            <p>東方プロジェクト クリアチェッカーへのご登録ありがとうございます。</p>
            <p>以下のリンクをクリックして、メールアドレスの認証を完了してください：</p>
            <p><a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">メールアドレスを認証</a></p>
            <p>このリンクは24時間有効です。</p>
            <p>もしこのメールに心当たりがない場合は、このメールを無視してください。</p>
            <br>
            <p>東方プロジェクト クリアチェッカー運営チーム</p>
        </body>
        </html>
        """
        
        text_body = f"""
メールアドレス認証

{username} さん、

東方プロジェクト クリアチェッカーへのご登録ありがとうございます。

以下のURLにアクセスして、メールアドレスの認証を完了してください：
{verification_url}

このリンクは24時間有効です。

もしこのメールに心当たりがない場合は、このメールを無視してください。

東方プロジェクト クリアチェッカー運営チーム
        """
        
        return self.email_sender.send_email(to_email, subject, text_body, html_body)


class MockEmailSender(EmailSender):
    """開発・テスト用のモックメール送信実装"""
    
    def send_email(self, to_email: str, subject: str, text_body: str, html_body: str) -> bool:
        print("=" * 60)
        print("📧 メール送信（開発モード）")
        print("=" * 60)
        print(f"宛先: {to_email}")
        print(f"件名: {subject}")
        print("=" * 60)
        print("本文:")
        print(text_body)
        print("=" * 60)
        print("本番環境では実際のメールが送信されます。")
        print("=" * 60)
        
        return True