from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from domain.constants.validation_constants import ValidationConstants


class GameCharacterBase(BaseModel):
    """ゲーム機体基底スキーマ"""
    character_name: str = Field(..., min_length=ValidationConstants.CHARACTER_NAME_MIN_LENGTH, max_length=ValidationConstants.CHARACTER_NAME_MAX_LENGTH, description="機体名")
    description: Optional[str] = Field(None, max_length=ValidationConstants.CHARACTER_DESCRIPTION_MAX_LENGTH, description="機体説明")
    sort_order: int = Field(default=0, description="表示順序")


class GameCharacterCreate(GameCharacterBase):
    """ゲーム機体作成スキーマ"""
    game_id: int = Field(..., gt=0, description="ゲームID")


class GameCharacterUpdate(GameCharacterBase):
    """ゲーム機体更新スキーマ"""
    pass


class GameCharacterResponse(GameCharacterBase):
    """ゲーム機体レスポンススキーマ"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    game_id: int
    created_at: Optional[datetime] = None


class GameCharacterListResponse(BaseModel):
    """ゲーム機体一覧レスポンススキーマ"""
    model_config = ConfigDict(from_attributes=True)

    game_characters: List[GameCharacterResponse]
    total_count: int = 0