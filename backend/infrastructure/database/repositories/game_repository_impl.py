from typing import List, Optional
from sqlalchemy.orm import Session
from domain.entities.game import Game
from domain.repositories.game_repository import GameRepository
from ..models.game_model import GameModel

class GameRepositoryImpl(GameRepository):
    def __init__(self, session: Session):
        self.session = session
    
    def find_all(self) -> List[Game]:
        models = self.session.query(GameModel).all()
        return [self._to_entity(model) for model in models]
    
    def find_by_id(self, game_id: int) -> Optional[Game]:
        model = self.session.query(GameModel).filter(GameModel.id == game_id).first()
        return self._to_entity(model) if model else None
    
    def save(self, game: Game) -> Game:
        if game.id is None:
            model = GameModel(
                title=game.title,
                series_number=game.series_number,
                release_year=game.release_year
            )
            self.session.add(model)
        else:
            model = self.session.query(GameModel).filter(GameModel.id == game.id).first()
            if model:
                model.title = game.title
                model.series_number = game.series_number
                model.release_year = game.release_year
        
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)
    
    def delete(self, game_id: int) -> bool:
        model = self.session.query(GameModel).filter(GameModel.id == game_id).first()
        if model:
            self.session.delete(model)
            self.session.commit()
            return True
        return False
    
    def _to_entity(self, model: GameModel) -> Game:
        return Game(
            id=model.id,
            title=model.title,
            series_number=model.series_number,
            release_year=model.release_year
        )