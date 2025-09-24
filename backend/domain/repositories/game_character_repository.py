from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.game_character import GameCharacter


class GameCharacterRepository(ABC):
    @abstractmethod
    def find_by_game_id(self, game_id: int) -> List[GameCharacter]:
        pass
    
    @abstractmethod
    def find_by_id(self, character_id: int) -> Optional[GameCharacter]:
        pass
    
    @abstractmethod
    def find_by_game_and_name(self, game_id: int, character_name: str) -> Optional[GameCharacter]:
        pass
    
    @abstractmethod
    def save(self, character: GameCharacter) -> GameCharacter:
        pass
    
    @abstractmethod
    def delete(self, character_id: int) -> bool:
        pass
    
    @abstractmethod
    def get_character_count_by_game(self, game_id: int) -> int:
        pass