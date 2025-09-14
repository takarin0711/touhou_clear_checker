from typing import List, Optional
from domain.entities.clear_status import ClearStatus
from domain.repositories.clear_status_repository import ClearStatusRepository
from domain.value_objects.difficulty import Difficulty
from ..dtos.clear_status_dto import ClearStatusDto, CreateClearStatusDto, UpdateClearStatusDto

class ClearStatusService:
    def __init__(self, clear_status_repository: ClearStatusRepository):
        self.clear_status_repository = clear_status_repository
    
    def get_all_clear_status(self) -> List[ClearStatusDto]:
        clear_statuses = self.clear_status_repository.find_all()
        return [self._to_dto(clear_status) for clear_status in clear_statuses]
    
    def get_clear_status_by_id(self, clear_status_id: int) -> Optional[ClearStatusDto]:
        clear_status = self.clear_status_repository.find_by_id(clear_status_id)
        return self._to_dto(clear_status) if clear_status else None
    
    def get_clear_status_by_game_id(self, game_id: int) -> List[ClearStatusDto]:
        clear_statuses = self.clear_status_repository.find_by_game_id(game_id)
        return [self._to_dto(clear_status) for clear_status in clear_statuses]
    
    def create_clear_status(self, create_dto: CreateClearStatusDto) -> ClearStatusDto:
        clear_status = ClearStatus(
            id=None,
            game_id=create_dto.game_id,
            difficulty=create_dto.difficulty,
            is_cleared=create_dto.is_cleared,
            cleared_at=create_dto.cleared_at
        )
        saved_clear_status = self.clear_status_repository.save(clear_status)
        return self._to_dto(saved_clear_status)
    
    def update_clear_status(self, clear_status_id: int, update_dto: UpdateClearStatusDto) -> Optional[ClearStatusDto]:
        existing_clear_status = self.clear_status_repository.find_by_id(clear_status_id)
        if not existing_clear_status:
            return None
        
        clear_status = ClearStatus(
            id=clear_status_id,
            game_id=existing_clear_status.game_id,
            difficulty=existing_clear_status.difficulty,
            is_cleared=update_dto.is_cleared,
            cleared_at=update_dto.cleared_at
        )
        saved_clear_status = self.clear_status_repository.save(clear_status)
        return self._to_dto(saved_clear_status)
    
    def mark_as_cleared(self, game_id: int, difficulty: Difficulty) -> Optional[ClearStatusDto]:
        clear_status = self.clear_status_repository.find_by_game_and_difficulty(game_id, difficulty)
        if not clear_status:
            clear_status = ClearStatus(
                id=None,
                game_id=game_id,
                difficulty=difficulty,
                is_cleared=False,
                cleared_at=None
            )
        
        clear_status.mark_as_cleared()
        saved_clear_status = self.clear_status_repository.save(clear_status)
        return self._to_dto(saved_clear_status)
    
    def delete_clear_status(self, clear_status_id: int) -> bool:
        return self.clear_status_repository.delete(clear_status_id)
    
    def _to_dto(self, clear_status: ClearStatus) -> ClearStatusDto:
        return ClearStatusDto(
            id=clear_status.id,
            game_id=clear_status.game_id,
            difficulty=clear_status.difficulty,
            is_cleared=clear_status.is_cleared,
            cleared_at=clear_status.cleared_at
        )