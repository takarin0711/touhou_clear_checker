from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class CreateUserDto:
    username: str
    email: str
    password: str


@dataclass
class UpdateUserDto:
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


@dataclass
class UserResponseDto:
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    email_verified: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class LoginRequestDto:
    username: str
    password: str


@dataclass
class TokenResponseDto:
    access_token: str
    token_type: str