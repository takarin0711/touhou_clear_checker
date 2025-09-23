from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        }


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        json_schema_extra = {
            "example": {
                "username": "updated_username",
                "email": "updated@example.com",
                "is_active": True
            }
        }


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "testuser",
                "email": "test@example.com",
                "is_active": True,
                "is_admin": False,
                "email_verified": True,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }


class LoginRequest(BaseModel):
    username: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "testuser",
                "password": "password123"
            }
        }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "username": "testuser",
                    "email": "test@example.com",
                    "is_active": True,
                    "is_admin": False,
                    "created_at": "2023-01-01T00:00:00",
                    "updated_at": "2023-01-01T00:00:00"
                }
            }
        }


class EmailVerificationRequest(BaseModel):
    token: str

    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yzA567BCD890EFG123"
            }
        }


class ResendVerificationRequest(BaseModel):
    email: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "test@example.com"
            }
        }


class MessageResponse(BaseModel):
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operation completed successfully"
            }
        }