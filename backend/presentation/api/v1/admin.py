from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from application.services.game_service import GameService
from application.services.user_service import UserService
from application.dtos.game_dto import CreateGameDto, UpdateGameDto
from application.dtos.user_dto import UpdateUserDto
from domain.entities.user import User
from domain.value_objects.game_type import GameType
from infrastructure.security.auth_middleware import get_current_admin_user
from infrastructure.database.connection import get_db
from ..dependencies import get_game_service
from ...schemas.game_schema import GameCreate, GameUpdate, GameResponse
from ...schemas.user_schema import UserUpdate, UserResponse
from infrastructure.logging.logger import LoggerFactory

router = APIRouter()
logger = LoggerFactory.get_logger(__name__)

# ゲーム管理API

@router.get("/games", response_model=List[GameResponse])
async def admin_get_games(
    series_number: Optional[Decimal] = Query(None, description="シリーズ番号で検索"),
    game_type: Optional[str] = Query(None, description="ゲームタイプで検索"),
    current_admin: User = Depends(get_current_admin_user),
    game_service: GameService = Depends(get_game_service)
):
    """管理者専用: ゲーム一覧取得（検索パラメータ対応）"""
    logger.debug(f"Admin get games request: series_number={series_number}, game_type={game_type}")

    # game_typeの文字列をEnumに変換
    parsed_game_type = None
    if game_type:
        try:
            parsed_game_type = GameType(game_type)
        except ValueError:
            logger.warning(f"Invalid game_type provided: {game_type}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid game_type: {game_type}. Valid values: {[gt.value for gt in GameType]}"
            )

    # フィルタリングされたゲーム一覧を取得
    if series_number is not None or parsed_game_type is not None:
        games = game_service.get_games_filtered(
            series_number=series_number,
            game_type=parsed_game_type
        )
    else:
        games = game_service.get_all_games()

    logger.info(f"Admin retrieved {len(games)} games")
    return [GameResponse(
        id=game.id,
        title=game.title,
        series_number=game.series_number,
        release_year=game.release_year,
        game_type=game.game_type
    ) for game in games]

@router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    game_data: GameCreate,
    current_admin: User = Depends(get_current_admin_user),
    game_service: GameService = Depends(get_game_service)
):
    """管理者専用: 新しいゲーム作品を登録"""
    logger.info(f"Admin create game attempt: title={game_data.title}")
    try:
        create_dto = CreateGameDto(
            title=game_data.title,
            series_number=game_data.series_number,
            release_year=game_data.release_year,
            game_type=game_data.game_type
        )
        game = game_service.create_game(create_dto)
        logger.info(f"Admin created game: game_id={game.id}, title={game.title}")
        return GameResponse(
            id=game.id,
            title=game.title,
            series_number=game.series_number,
            release_year=game.release_year,
            game_type=game.game_type
        )
    except ValueError as e:
        logger.warning(f"Admin game creation failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/games/{series_number}", response_model=GameResponse)
async def update_game_by_series(
    series_number: Decimal,
    game_data: GameUpdate,
    current_admin: User = Depends(get_current_admin_user),
    game_service: GameService = Depends(get_game_service)
):
    """管理者専用: ゲーム更新（シリーズ番号指定）"""
    logger.info(f"Admin update game attempt: series_number={series_number}")
    try:
        # シリーズ番号で既存ゲームを検索
        existing_games = game_service.get_games_filtered(series_number=series_number)
        if not existing_games:
            logger.warning(f"Game not found for update: series_number={series_number}")
            raise HTTPException(status_code=404, detail="Game not found")

        existing_game = existing_games[0]  # series_numberはユニークなので最初の要素
        update_dto = UpdateGameDto(
            title=game_data.title,
            series_number=game_data.series_number,
            release_year=game_data.release_year,
            game_type=game_data.game_type
        )
        game = game_service.update_game(existing_game.id, update_dto)
        if not game:
            logger.warning(f"Failed to update game: series_number={series_number}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")

        logger.info(f"Admin updated game: game_id={game.id}, title={game.title}")
        return GameResponse(
            id=game.id,
            title=game.title,
            series_number=game.series_number,
            release_year=game.release_year,
            game_type=game.game_type
        )
    except ValueError as e:
        logger.warning(f"Admin game update failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/games/{series_number}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game_by_series(
    series_number: Decimal,
    current_admin: User = Depends(get_current_admin_user),
    game_service: GameService = Depends(get_game_service)
):
    """管理者専用: ゲーム削除（シリーズ番号指定）"""
    logger.info(f"Admin delete game attempt: series_number={series_number}")
    # シリーズ番号で既存ゲームを検索
    existing_games = game_service.get_games_filtered(series_number=series_number)
    if not existing_games:
        logger.warning(f"Game not found for delete: series_number={series_number}")
        raise HTTPException(status_code=404, detail="Game not found")

    existing_game = existing_games[0]  # series_numberはユニークなので最初の要素
    success = game_service.delete_game(existing_game.id)
    if not success:
        logger.error(f"Failed to delete game: series_number={series_number}, game_id={existing_game.id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete game")
    logger.info(f"Admin deleted game: game_id={existing_game.id}")

# ユーザー管理API

@router.get("/users", response_model=List[UserResponse])
async def admin_get_all_users(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """管理者専用: 全ユーザー一覧（管理用）"""
    logger.debug("Admin get all users request")
    from infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl
    user_repository = UserRepositoryImpl(db)
    user_service = UserService(user_repository)
    users = user_service.get_all_users()
    logger.info(f"Admin retrieved {len(users)} users")
    return users

@router.put("/users/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    user_data: UserUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """管理者専用: 任意のユーザー情報を更新（管理者権限変更含む）"""
    logger.info(f"Admin update user attempt: user_id={user_id}")
    try:
        from infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl
        user_repository = UserRepositoryImpl(db)
        user_service = UserService(user_repository)

        update_dto = UpdateUserDto(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            is_active=user_data.is_active,
            is_admin=user_data.is_admin  # 管理者は他のユーザーの管理者権限を変更可能
        )
        updated_user = user_service.update_user(user_id, update_dto)
        logger.info(f"Admin updated user: user_id={user_id}")
        return updated_user
    except ValueError as e:
        logger.warning(f"Admin user update failed: user_id={user_id}, error={str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """管理者専用: 任意のユーザーを削除"""
    logger.info(f"Admin delete user attempt: user_id={user_id}")
    from infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl
    user_repository = UserRepositoryImpl(db)
    user_service = UserService(user_repository)

    success = user_service.delete_user(user_id)
    if not success:
        logger.warning(f"User not found for delete: user_id={user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    logger.info(f"Admin deleted user: user_id={user_id}")