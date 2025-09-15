from abc import ABC, abstractmethod
from typing import List, Optional
from decimal import Decimal
from ..entities.game import Game
from ..value_objects.game_type import GameType

class GameRepository(ABC):
    @abstractmethod
    def find_all(self) -> List[Game]:
        pass
    
    @abstractmethod
    def find_by_id(self, game_id: int) -> Optional[Game]:
        pass
    
    @abstractmethod
    def find_filtered(self, 
                     series_number: Optional[Decimal] = None,
                     game_type: Optional[GameType] = None) -> List[Game]:
        pass
    
    @abstractmethod
    def save(self, game: Game) -> Game:
        pass
    
    @abstractmethod
    def delete(self, game_id: int) -> bool:
        pass