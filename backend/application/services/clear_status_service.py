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
    
    def get_clear_status_by_user_id(self, user_id: int) -> List[ClearStatusDto]:
        clear_statuses = self.clear_status_repository.find_by_user_id(user_id)
        return [self._to_dto(clear_status) for clear_status in clear_statuses]
    
    def get_clear_status_by_user_and_game(self, user_id: int, game_id: int) -> List[ClearStatusDto]:
        clear_statuses = self.clear_status_repository.find_by_user_and_game(user_id, game_id)
        return [self._to_dto(clear_status) for clear_status in clear_statuses]
    
    def create_clear_status(self, create_dto: CreateClearStatusDto) -> ClearStatusDto:
        clear_status = ClearStatus(
            id=None,
            game_id=create_dto.game_id,
            user_id=create_dto.user_id,
            difficulty=create_dto.difficulty,
            is_cleared=create_dto.is_cleared,
            cleared_at=create_dto.cleared_at,
            no_continue_clear=create_dto.no_continue_clear,
            no_bomb_clear=create_dto.no_bomb_clear,
            no_miss_clear=create_dto.no_miss_clear,
            score=create_dto.score,
            memo=create_dto.memo,
            clear_count=create_dto.clear_count
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
            user_id=existing_clear_status.user_id,
            difficulty=existing_clear_status.difficulty,
            is_cleared=update_dto.is_cleared,
            cleared_at=update_dto.cleared_at,
            no_continue_clear=update_dto.no_continue_clear,
            no_bomb_clear=update_dto.no_bomb_clear,
            no_miss_clear=update_dto.no_miss_clear,
            score=update_dto.score,
            memo=update_dto.memo,
            clear_count=update_dto.clear_count
        )
        saved_clear_status = self.clear_status_repository.save(clear_status)
        return self._to_dto(saved_clear_status)
    
    def mark_as_cleared(self, user_id: int, game_id: int, difficulty: Difficulty, no_continue: bool = False, no_bomb: bool = False, no_miss: bool = False, score: Optional[int] = None) -> Optional[ClearStatusDto]:
        clear_status = self.clear_status_repository.find_by_user_game_and_difficulty(user_id, game_id, difficulty)
        if not clear_status:
            clear_status = ClearStatus(
                id=None,
                game_id=game_id,
                user_id=user_id,
                difficulty=difficulty,
                is_cleared=False,
                cleared_at=None
            )
        
        clear_status.mark_as_cleared(no_continue=no_continue, no_bomb=no_bomb, no_miss=no_miss, score=score)
        saved_clear_status = self.clear_status_repository.save(clear_status)
        return self._to_dto(saved_clear_status)
    
    def delete_clear_status(self, clear_status_id: int) -> bool:
        return self.clear_status_repository.delete(clear_status_id)
    
    def _to_dto(self, clear_status: ClearStatus) -> ClearStatusDto:
        return ClearStatusDto(
            id=clear_status.id,
            game_id=clear_status.game_id,
            user_id=clear_status.user_id,
            difficulty=clear_status.difficulty,
            is_cleared=clear_status.is_cleared,
            cleared_at=clear_status.cleared_at,
            no_continue_clear=clear_status.no_continue_clear,
            no_bomb_clear=clear_status.no_bomb_clear,
            no_miss_clear=clear_status.no_miss_clear,
            score=clear_status.score,
            memo=clear_status.memo,
            clear_count=clear_status.clear_count
        )