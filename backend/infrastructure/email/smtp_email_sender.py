import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from application.services.email_service import EmailSender


class SMTPEmailSender(EmailSender):
    """SMTP経由でのメール送信を担当するクラス"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)

    def send_email(self, to_email: str, subject: str, text_body: str, html_body: str) -> bool:
        """SMTPサーバーを使用してメールを送信"""
        try:
            if not self.smtp_username or not self.smtp_password:
                print("Warning: SMTP credentials not configured. Email not sent.")
                return False

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
            print(f"Failed to send email via SMTP: {str(e)}")
            return False