from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from domain.value_objects.difficulty import Difficulty

@dataclass
class ClearStatusDto:
    id: Optional[int]
    game_id: int
    user_id: int
    difficulty: Difficulty
    is_cleared: bool
    cleared_at: Optional[datetime]
    no_continue_clear: bool = False
    no_bomb_clear: bool = False
    no_miss_clear: bool = False
    score: Optional[int] = None
    memo: Optional[str] = None
    clear_count: int = 0

@dataclass
class CreateClearStatusDto:
    game_id: int
    user_id: int
    difficulty: Difficulty
    is_cleared: bool = False
    cleared_at: Optional[datetime] = None
    no_continue_clear: bool = False
    no_bomb_clear: bool = False
    no_miss_clear: bool = False
    score: Optional[int] = None
    memo: Optional[str] = None
    clear_count: int = 0

@dataclass
class UpdateClearStatusDto:
    is_cleared: bool
    cleared_at: Optional[datetime] = None
    no_continue_clear: bool = False
    no_bomb_clear: bool = False
    no_miss_clear: bool = False
    score: Optional[int] = None
    memo: Optional[str] = None
    clear_count: int = 0