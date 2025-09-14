from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from domain.value_objects.difficulty import Difficulty

@dataclass
class ClearStatusDto:
    id: Optional[int]
    game_id: int
    difficulty: Difficulty
    is_cleared: bool
    cleared_at: Optional[datetime]

@dataclass
class CreateClearStatusDto:
    game_id: int
    difficulty: Difficulty
    is_cleared: bool = False
    cleared_at: Optional[datetime] = None

@dataclass
class UpdateClearStatusDto:
    is_cleared: bool
    cleared_at: Optional[datetime] = None