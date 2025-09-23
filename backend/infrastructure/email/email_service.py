import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from abc import ABC, abstractmethod


class EmailService(ABC):
    @abstractmethod
    def send_verification_email(self, to_email: str, username: str, verification_token: str) -> bool:
        pass


class SMTPEmailService(EmailService):
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.base_url = os.getenv("BASE_URL", "http://localhost:3000")

    def send_verification_email(self, to_email: str, username: str, verification_token: str) -> bool:
        try:
            if not self.smtp_username or not self.smtp_password:
                print("Warning: SMTP credentials not configured. Email not sent.")
                return False

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

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            part1 = MIMEText(text_body, "plain", "utf-8")
            part2 = MIMEText(html_body, "html", "utf-8")

            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            return True

        except Exception as e:
            print(f"Failed to send verification email: {str(e)}")
            return False


class MockEmailService(EmailService):
    """開発・テスト用のモックメールサービス"""
    
    def send_verification_email(self, to_email: str, username: str, verification_token: str) -> bool:
        verification_url = f"http://localhost:3000/verify-email?token={verification_token}"
        
        print("=" * 60)
        print("📧 メール認証（開発モード）")
        print("=" * 60)
        print(f"宛先: {to_email}")
        print(f"ユーザー名: {username}")
        print(f"認証URL: {verification_url}")
        print("=" * 60)
        print("本番環境では実際のメールが送信されます。")
        print("=" * 60)
        
        return True