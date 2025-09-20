from sqlalchemy.orm import Session
from infrastructure.database.connection import get_db
from infrastructure.database.repositories.game_repository_impl import GameRepositoryImpl
from infrastructure.database.repositories.clear_record_repository_impl import ClearRecordRepositoryImpl
from infrastructure.database.repositories.character_repository_impl import CharacterRepositoryImpl
from application.services.game_service import GameService
from application.services.clear_record_service import ClearRecordService
from application.services.character_service import CharacterService
from infrastructure.security.auth_middleware import get_current_user, get_current_admin_user
from fastapi import Depends

def get_game_service(db: Session = Depends(get_db)) -> GameService:
    game_repository = GameRepositoryImpl(db)
    return GameService(game_repository)

def get_clear_record_service(db: Session = Depends(get_db)) -> ClearRecordService:
    clear_record_repository = ClearRecordRepositoryImpl(db)
    return ClearRecordService(clear_record_repository)

def get_character_service(db: Session = Depends(get_db)) -> CharacterService:
    character_repository = CharacterRepositoryImpl(db)
    return CharacterService(character_repository)