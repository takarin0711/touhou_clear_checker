from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class GameBase(BaseModel):
    title: str
    series_number: Decimal
    release_year: int
    game_type: str = "main_series"

class GameCreate(GameBase):
    pass

class GameUpdate(GameBase):
    pass

class GameResponse(GameBase):
    id: int
    
    class Config:
        from_attributes = True