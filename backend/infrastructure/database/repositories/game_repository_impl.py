from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from domain.entities.game import Game
from domain.repositories.game_repository import GameRepository
from domain.value_objects.game_type import GameType
from ..models.game_model import GameModel

class GameRepositoryImpl(GameRepository):
    def __init__(self, session: Session):
        self.session = session
    
    def find_all(self) -> List[Game]:
        models = self.session.query(GameModel).order_by(GameModel.series_number).all()
        return [self._to_entity(model) for model in models]
    
    def find_filtered(self, 
                     series_number: Optional[Decimal] = None,
                     game_type: Optional[GameType] = None) -> List[Game]:
        query = self.session.query(GameModel)
        
        if series_number is not None:
            query = query.filter(GameModel.series_number == float(series_number))
        
        if game_type is not None:
            query = query.filter(GameModel.game_type == game_type.value)
        
        models = query.order_by(GameModel.series_number).all()
        return [self._to_entity(model) for model in models]
    
    def find_by_id(self, game_id: int) -> Optional[Game]:
        model = self.session.query(GameModel).filter(GameModel.id == game_id).first()
        return self._to_entity(model) if model else None
    
    def save(self, game: Game) -> Game:
        if game.id is None:
            model = GameModel(
                title=game.title,
                series_number=float(game.series_number),
                release_year=game.release_year,
                game_type=game.game_type.value
            )
            self.session.add(model)
        else:
            model = self.session.query(GameModel).filter(GameModel.id == game.id).first()
            if model:
                model.title = game.title
                model.series_number = float(game.series_number)
                model.release_year = game.release_year
                if hasattr(model, 'game_type'):
                    model.game_type = game.game_type.value
        
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
            series_number=Decimal(str(model.series_number)),
            release_year=model.release_year,
            game_type=GameType(model.game_type) if hasattr(model, 'game_type') and model.game_type else GameType.MAIN_SERIES
        )