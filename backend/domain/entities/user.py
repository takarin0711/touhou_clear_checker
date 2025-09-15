from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class User:
    id: Optional[int]
    username: str
    email: str
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.username or len(self.username.strip()) == 0:
            raise ValueError("Username is required")
        
        if not self.email or len(self.email.strip()) == 0:
            raise ValueError("Email is required")
        
        if not self.hashed_password or len(self.hashed_password.strip()) == 0:
            raise ValueError("Hashed password is required")
        
        # メールアドレスの基本的な形式チェック
        if "@" not in self.email:
            raise ValueError("Invalid email format")
        
        # ユーザー名の長さチェック
        if len(self.username.strip()) < 3:
            raise ValueError("Username must be at least 3 characters long")