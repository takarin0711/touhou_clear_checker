from typing import List, Optional
from sqlalchemy.orm import Session
from domain.entities.clear_status import ClearStatus
from domain.repositories.clear_status_repository import ClearStatusRepository
from domain.value_objects.difficulty import Difficulty
from ..models.clear_status_model import ClearStatusModel

class ClearStatusRepositoryImpl(ClearStatusRepository):
    def __init__(self, session: Session):
        self.session = session
    
    def find_all(self) -> List[ClearStatus]:
        models = self.session.query(ClearStatusModel).all()
        return [self._to_entity(model) for model in models]
    
    def find_by_id(self, clear_status_id: int) -> Optional[ClearStatus]:
        model = self.session.query(ClearStatusModel).filter(ClearStatusModel.id == clear_status_id).first()
        return self._to_entity(model) if model else None
    
    def find_by_game_id(self, game_id: int) -> List[ClearStatus]:
        models = self.session.query(ClearStatusModel).filter(ClearStatusModel.game_id == game_id).all()
        return [self._to_entity(model) for model in models]
    
    def find_by_game_and_difficulty(self, game_id: int, difficulty: Difficulty) -> Optional[ClearStatus]:
        model = self.session.query(ClearStatusModel).filter(
            ClearStatusModel.game_id == game_id,
            ClearStatusModel.difficulty == difficulty.value
        ).first()
        return self._to_entity(model) if model else None
    
    def save(self, clear_status: ClearStatus) -> ClearStatus:
        if clear_status.id is None:
            model = ClearStatusModel(
                game_id=clear_status.game_id,
                difficulty=clear_status.difficulty.value,
                is_cleared=clear_status.is_cleared,
                cleared_at=clear_status.cleared_at
            )
            self.session.add(model)
        else:
            model = self.session.query(ClearStatusModel).filter(ClearStatusModel.id == clear_status.id).first()
            if model:
                model.game_id = clear_status.game_id
                model.difficulty = clear_status.difficulty.value
                model.is_cleared = clear_status.is_cleared
                model.cleared_at = clear_status.cleared_at
        
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)
    
    def delete(self, clear_status_id: int) -> bool:
        model = self.session.query(ClearStatusModel).filter(ClearStatusModel.id == clear_status_id).first()
        if model:
            self.session.delete(model)
            self.session.commit()
            return True
        return False
    
    def _to_entity(self, model: ClearStatusModel) -> ClearStatus:
        return ClearStatus(
            id=model.id,
            game_id=model.game_id,
            difficulty=Difficulty(model.difficulty),
            is_cleared=model.is_cleared,
            cleared_at=model.cleared_at
        )