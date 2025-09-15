from dataclasses import dataclass
from typing import Optional
from decimal import Decimal

@dataclass
class GameDto:
    id: Optional[int]
    title: str
    series_number: Decimal
    release_year: int
    game_type: str = "main_series"

@dataclass
class CreateGameDto:
    title: str
    series_number: Decimal
    release_year: int
    game_type: str = "main_series"

@dataclass
class UpdateGameDto:
    title: str
    series_number: Decimal
    release_year: int
    game_type: str = "main_series"