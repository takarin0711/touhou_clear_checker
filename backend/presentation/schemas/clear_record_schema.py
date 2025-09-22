"""
クリア記録のPydanticスキーマ
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class ClearRecordBase(BaseModel):
    game_id: int
    character_name: str
    difficulty: str
    mode: str = "normal"
    is_cleared: bool = False
    is_no_continue_clear: bool = False
    is_no_bomb_clear: bool = False
    is_no_miss_clear: bool = False
    is_full_spell_card: bool = False
    is_special_clear_1: bool = False
    is_special_clear_2: bool = False
    is_special_clear_3: bool = False
    cleared_at: Optional[date] = None

class ClearRecordCreate(ClearRecordBase):
    pass

class ClearRecordUpdate(BaseModel):
    is_cleared: Optional[bool] = None
    is_no_continue_clear: Optional[bool] = None
    is_no_bomb_clear: Optional[bool] = None
    is_no_miss_clear: Optional[bool] = None
    is_full_spell_card: Optional[bool] = None
    is_special_clear_1: Optional[bool] = None
    is_special_clear_2: Optional[bool] = None
    is_special_clear_3: Optional[bool] = None
    mode: Optional[str] = None
    cleared_at: Optional[date] = None

class ClearRecordResponse(ClearRecordBase):
    id: int
    created_at: Optional[datetime]
    last_updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ClearRecordBatch(BaseModel):
    records: List[ClearRecordCreate]