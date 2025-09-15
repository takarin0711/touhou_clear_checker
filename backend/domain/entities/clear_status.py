from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from ..value_objects.difficulty import Difficulty

@dataclass
class ClearStatus:
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
    clear_count: int = 0
    
    def __post_init__(self):
        if self.game_id <= 0:
            raise ValueError("Game ID must be positive")
        if self.user_id <= 0:
            raise ValueError("User ID must be positive")
        if self.is_cleared and not self.cleared_at:
            raise ValueError("Cleared at must be set when is_cleared is True")
        if self.score is not None and self.score < 0:
            raise ValueError("Score must be non-negative")
        if self.clear_count < 0:
            raise ValueError("Clear count must be non-negative")
    
    def mark_as_cleared(self, no_continue: bool = False, no_bomb: bool = False, no_miss: bool = False, score: Optional[int] = None) -> None:
        self.is_cleared = True
        self.cleared_at = datetime.now()
        self.no_continue_clear = no_continue
        self.no_bomb_clear = no_bomb
        self.no_miss_clear = no_miss
        if score is not None:
            self.score = score
        self.clear_count += 1
    
    def mark_as_not_cleared(self) -> None:
        self.is_cleared = False
        self.cleared_at = None
        self.no_continue_clear = False
        self.no_bomb_clear = False
        self.no_miss_clear = False