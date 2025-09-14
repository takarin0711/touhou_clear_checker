from pydantic import BaseModel
from typing import Optional

class GameBase(BaseModel):
    title: str
    series_number: int
    release_year: int

class GameCreate(GameBase):
    pass

class GameUpdate(GameBase):
    pass

class GameResponse(GameBase):
    id: int
    
    class Config:
        from_attributes = True