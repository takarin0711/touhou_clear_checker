from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class GameCharacterDto:
    """ゲーム機体DTO"""
    id: Optional[int]
    game_id: int
    character_name: str
    description: Optional[str]
    sort_order: int
    created_at: Optional[datetime]


@dataclass
class CreateGameCharacterDto:
    """ゲーム機体作成用DTO"""
    game_id: int
    character_name: str
    description: Optional[str] = None
    sort_order: int = 0


@dataclass
class UpdateGameCharacterDto:
    """ゲーム機体更新用DTO"""
    character_name: str
    description: Optional[str] = None
    sort_order: int = 0


@dataclass
class GameCharacterListDto:
    """ゲーム機体一覧レスポンス用DTO"""
    game_characters: list[GameCharacterDto]
    total_count: int = 0