from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from domain.value_objects.difficulty import Difficulty

class ClearStatusBase(BaseModel):
    game_id: int
    difficulty: Difficulty
    is_cleared: bool
    cleared_at: Optional[datetime] = None

class ClearStatusCreate(BaseModel):
    game_id: int
    difficulty: Difficulty
    is_cleared: bool = False
    cleared_at: Optional[datetime] = None

class ClearStatusUpdate(BaseModel):
    is_cleared: bool
    cleared_at: Optional[datetime] = None

class ClearStatusResponse(ClearStatusBase):
    id: int
    
    class Config:
        from_attributes = True