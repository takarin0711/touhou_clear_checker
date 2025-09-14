from dataclasses import dataclass
from typing import Optional

@dataclass
class Game:
    id: Optional[int]
    title: str
    series_number: int
    release_year: int
    
    def __post_init__(self):
        if not self.title:
            raise ValueError("Game title cannot be empty")
        if self.series_number <= 0:
            raise ValueError("Series number must be positive")
        if self.release_year <= 0:
            raise ValueError("Release year must be positive")