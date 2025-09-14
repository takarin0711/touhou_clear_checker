from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.game import Game

class GameRepository(ABC):
    @abstractmethod
    def find_all(self) -> List[Game]:
        pass
    
    @abstractmethod
    def find_by_id(self, game_id: int) -> Optional[Game]:
        pass
    
    @abstractmethod
    def save(self, game: Game) -> Game:
        pass
    
    @abstractmethod
    def delete(self, game_id: int) -> bool:
        pass