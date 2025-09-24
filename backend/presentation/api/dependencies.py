from sqlalchemy.orm import Session
from infrastructure.database.connection import get_db
from infrastructure.database.repositories.game_repository_impl import GameRepositoryImpl
from infrastructure.database.repositories.clear_record_repository_impl import ClearRecordRepositoryImpl
from infrastructure.database.repositories.game_memo_repository_impl import GameMemoRepositoryImpl
from application.services.game_service import GameService
from application.services.clear_record_service import ClearRecordService
from application.services.game_memo_service import GameMemoService
from infrastructure.security.auth_middleware import get_current_user, get_current_admin_user
from fastapi import Depends

def get_game_service(db: Session = Depends(get_db)) -> GameService:
    game_repository = GameRepositoryImpl(db)
    return GameService(game_repository)

def get_clear_record_service(db: Session = Depends(get_db)) -> ClearRecordService:
    clear_record_repository = ClearRecordRepositoryImpl(db)
    return ClearRecordService(clear_record_repository)

def get_game_memo_service(db: Session = Depends(get_db)) -> GameMemoService:
    game_memo_repository = GameMemoRepositoryImpl(db)
    return GameMemoService(game_memo_repository)