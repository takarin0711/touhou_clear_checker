from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.clear_status import ClearStatus
from ..value_objects.difficulty import Difficulty

class ClearStatusRepository(ABC):
    @abstractmethod
    def find_all(self) -> List[ClearStatus]:
        pass
    
    @abstractmethod
    def find_by_id(self, clear_status_id: int) -> Optional[ClearStatus]:
        pass
    
    @abstractmethod
    def find_by_game_id(self, game_id: int) -> List[ClearStatus]:
        pass
    
    @abstractmethod
    def find_by_game_and_difficulty(self, game_id: int, difficulty: Difficulty) -> Optional[ClearStatus]:
        pass
    
    @abstractmethod
    def save(self, clear_status: ClearStatus) -> ClearStatus:
        pass
    
    @abstractmethod
    def delete(self, clear_status_id: int) -> bool:
        pass