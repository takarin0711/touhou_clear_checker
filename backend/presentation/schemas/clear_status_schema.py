from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from domain.value_objects.difficulty import Difficulty

class ClearStatusBase(BaseModel):
    game_id: int
    user_id: int
    difficulty: Difficulty
    is_cleared: bool
    cleared_at: Optional[datetime] = None
    no_continue_clear: bool = False
    no_bomb_clear: bool = False
    no_miss_clear: bool = False
    score: Optional[int] = None
    clear_count: int = 0

class ClearStatusCreate(BaseModel):
    game_id: int
    user_id: int
    difficulty: Difficulty
    is_cleared: bool = False
    cleared_at: Optional[datetime] = None
    no_continue_clear: bool = False
    no_bomb_clear: bool = False
    no_miss_clear: bool = False
    score: Optional[int] = None
    clear_count: int = 0

class ClearStatusUpdate(BaseModel):
    is_cleared: bool
    cleared_at: Optional[datetime] = None
    no_continue_clear: bool = False
    no_bomb_clear: bool = False
    no_miss_clear: bool = False
    score: Optional[int] = None
    clear_count: int = 0

class ClearStatusResponse(ClearStatusBase):
    id: int
    
    class Config:
        from_attributes = True