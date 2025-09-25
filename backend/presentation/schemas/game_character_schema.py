from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GameCharacterBase(BaseModel):
    """ゲーム機体基底スキーマ"""
    character_name: str = Field(..., min_length=1, max_length=100, description="機体名")
    description: Optional[str] = Field(None, max_length=500, description="機体説明")
    sort_order: int = Field(default=0, description="表示順序")


class GameCharacterCreate(GameCharacterBase):
    """ゲーム機体作成スキーマ"""
    game_id: int = Field(..., gt=0, description="ゲームID")


class GameCharacterUpdate(GameCharacterBase):
    """ゲーム機体更新スキーマ"""
    pass


class GameCharacterResponse(GameCharacterBase):
    """ゲーム機体レスポンススキーマ"""
    id: int
    game_id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class GameCharacterListResponse(BaseModel):
    """ゲーム機体一覧レスポンススキーマ"""
    game_characters: List[GameCharacterResponse]
    total_count: int = 0
    
    class Config:
        from_attributes = True