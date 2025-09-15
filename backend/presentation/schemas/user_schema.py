from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    class Config:
        schema_extra = {
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
        schema_extra = {
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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "username": "testuser",
                "email": "test@example.com",
                "is_active": True,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }


class LoginRequest(BaseModel):
    username: str
    password: str

    class Config:
        schema_extra = {
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
        schema_extra = {
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