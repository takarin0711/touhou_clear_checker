from sqlalchemy.orm import Session
from infrastructure.database.connection import get_db
from infrastructure.database.repositories.game_repository_impl import GameRepositoryImpl
from infrastructure.database.repositories.clear_status_repository_impl import ClearStatusRepositoryImpl
from application.services.game_service import GameService
from application.services.clear_status_service import ClearStatusService
from fastapi import Depends

def get_game_service(db: Session = Depends(get_db)) -> GameService:
    game_repository = GameRepositoryImpl(db)
    return GameService(game_repository)

def get_clear_status_service(db: Session = Depends(get_db)) -> ClearStatusService:
    clear_status_repository = ClearStatusRepositoryImpl(db)
    return ClearStatusService(clear_status_repository)