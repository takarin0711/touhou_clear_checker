from dataclasses import dataclass
from typing import Optional

@dataclass
class GameDto:
    id: Optional[int]
    title: str
    series_number: int
    release_year: int

@dataclass
class CreateGameDto:
    title: str
    series_number: int
    release_year: int

@dataclass
class UpdateGameDto:
    title: str
    series_number: int
    release_year: int