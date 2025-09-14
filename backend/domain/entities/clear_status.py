from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from ..value_objects.difficulty import Difficulty

@dataclass
class ClearStatus:
    id: Optional[int]
    game_id: int
    difficulty: Difficulty
    is_cleared: bool
    cleared_at: Optional[datetime]
    
    def __post_init__(self):
        if self.game_id <= 0:
            raise ValueError("Game ID must be positive")
        if self.is_cleared and not self.cleared_at:
            raise ValueError("Cleared at must be set when is_cleared is True")
    
    def mark_as_cleared(self) -> None:
        self.is_cleared = True
        self.cleared_at = datetime.now()
    
    def mark_as_not_cleared(self) -> None:
        self.is_cleared = False
        self.cleared_at = None