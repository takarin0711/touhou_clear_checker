"""
ゲーム機体API（統合game_charactersテーブル対応）
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.database.repositories.game_character_repository_impl import GameCharacterRepositoryImpl
from domain.repositories.game_character_repository import GameCharacterRepository
from application.services.game_character_service import GameCharacterService
from application.dtos.game_character_dto import CreateGameCharacterDto, UpdateGameCharacterDto
from presentation.schemas.game_character_schema import (
    GameCharacterCreate,
    GameCharacterUpdate,
    GameCharacterResponse,
    GameCharacterListResponse
)
from infrastructure.database.connection import get_db
from infrastructure.security.auth_middleware import get_current_user
from domain.entities.user import User
from infrastructure.logging.logger import LoggerFactory

router = APIRouter()
logger = LoggerFactory.get_logger(__name__)


def get_game_character_repository(session: Session = Depends(get_db)) -> GameCharacterRepository:
    """ゲーム機体リポジトリを取得"""
    return GameCharacterRepositoryImpl(session)


def get_game_character_service(session: Session = Depends(get_db)) -> GameCharacterService:
    """ゲーム機体サービスを取得"""
    repository = GameCharacterRepositoryImpl(session)
    return GameCharacterService(repository)


@router.get("/{game_id}/characters", response_model=GameCharacterListResponse)
async def get_game_characters(
    game_id: int,
    service: GameCharacterService = Depends(get_game_character_service)
):
    """ゲーム別機体一覧を取得（認証なし）"""
    logger.debug(f"Get game characters request: game_id={game_id}")
    try:
        result = service.get_characters_by_game_id(game_id)
        logger.info(f"Retrieved {result.total_count} characters for game_id={game_id}")
        return GameCharacterListResponse(
            game_characters=[
                GameCharacterResponse(
                    id=dto.id,
                    game_id=dto.game_id,
                    character_name=dto.character_name,
                    description=dto.description,
                    sort_order=dto.sort_order,
                    created_at=dto.created_at
                ) for dto in result.game_characters
            ],
            total_count=result.total_count
        )
    except Exception as e:
        logger.error(f"Failed to get game characters: game_id={game_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail=f"機体取得に失敗しました: {str(e)}")


@router.get("/characters/{character_id}", response_model=GameCharacterResponse)
async def get_game_character_by_id(
    character_id: int,
    service: GameCharacterService = Depends(get_game_character_service)
):
    """IDで機体を取得（認証なし）"""
    logger.debug(f"Get game character by ID: character_id={character_id}")
    try:
        dto = service.get_character_by_id(character_id)
        if not dto:
            logger.warning(f"Game character not found: character_id={character_id}")
            raise HTTPException(status_code=404, detail="機体が見つかりません")
        logger.info(f"Retrieved game character: character_id={character_id}, name={dto.character_name}")
        return GameCharacterResponse(
            id=dto.id,
            game_id=dto.game_id,
            character_name=dto.character_name,
            description=dto.description,
            sort_order=dto.sort_order,
            created_at=dto.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get game character: character_id={character_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail=f"機体取得に失敗しました: {str(e)}")


@router.post("/{game_id}/characters", response_model=GameCharacterResponse)
async def create_game_character(
    game_id: int,
    character_data: GameCharacterCreate,
    service: GameCharacterService = Depends(get_game_character_service),
    current_user: User = Depends(get_current_user)
):
    """ゲーム機体を作成（管理者のみ）"""
    logger.info(f"Create game character attempt: game_id={game_id}, character_name={character_data.character_name}")
    try:
        create_dto = CreateGameCharacterDto(
            game_id=game_id,
            character_name=character_data.character_name,
            description=character_data.description,
            sort_order=character_data.sort_order
        )

        dto = service.create_character(create_dto)
        logger.info(f"Game character created: character_id={dto.id}, name={dto.character_name}")
        return GameCharacterResponse(
            id=dto.id,
            game_id=dto.game_id,
            character_name=dto.character_name,
            description=dto.description,
            sort_order=dto.sort_order,
            created_at=dto.created_at
        )
    except ValueError as e:
        logger.warning(f"Game character creation failed: game_id={game_id}, name={character_data.character_name}, error={str(e)}")
        if "already exists" in str(e):
            raise HTTPException(status_code=400, detail="同じ名前の機体が既に存在します")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create game character: game_id={game_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail=f"機体作成に失敗しました: {str(e)}")


@router.put("/characters/{character_id}", response_model=GameCharacterResponse)
async def update_game_character(
    character_id: int,
    character_data: GameCharacterUpdate,
    service: GameCharacterService = Depends(get_game_character_service),
    current_user: User = Depends(get_current_user)
):
    """ゲーム機体を更新（管理者のみ）"""
    logger.info(f"Update game character attempt: character_id={character_id}, new_name={character_data.character_name}")
    try:
        update_dto = UpdateGameCharacterDto(
            character_name=character_data.character_name,
            description=character_data.description,
            sort_order=character_data.sort_order
        )

        dto = service.update_character(character_id, update_dto)
        if not dto:
            logger.warning(f"Game character not found for update: character_id={character_id}")
            raise HTTPException(status_code=404, detail="機体が見つかりません")

        logger.info(f"Game character updated: character_id={dto.id}, name={dto.character_name}")
        return GameCharacterResponse(
            id=dto.id,
            game_id=dto.game_id,
            character_name=dto.character_name,
            description=dto.description,
            sort_order=dto.sort_order,
            created_at=dto.created_at
        )
    except ValueError as e:
        logger.warning(f"Game character update failed: character_id={character_id}, error={str(e)}")
        if "already exists" in str(e):
            raise HTTPException(status_code=400, detail="同じ名前の機体が既に存在します")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update game character: character_id={character_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail=f"機体更新に失敗しました: {str(e)}")


@router.delete("/characters/{character_id}")
async def delete_game_character(
    character_id: int,
    service: GameCharacterService = Depends(get_game_character_service),
    current_user: User = Depends(get_current_user)
):
    """ゲーム機体を削除（管理者のみ）"""
    logger.info(f"Delete game character attempt: character_id={character_id}")
    try:
        success = service.delete_character(character_id)
        if not success:
            logger.warning(f"Game character not found for delete: character_id={character_id}")
            raise HTTPException(status_code=404, detail="機体が見つかりません")
        logger.info(f"Game character deleted: character_id={character_id}")
        return {"message": "機体が削除されました"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete game character: character_id={character_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail=f"機体削除に失敗しました: {str(e)}")


@router.get("/{game_id}/characters/count", response_model=dict)
async def get_game_character_count(
    game_id: int,
    service: GameCharacterService = Depends(get_game_character_service)
):
    """ゲーム別機体数を取得（認証なし）"""
    logger.debug(f"Get game character count: game_id={game_id}")
    try:
        count = service.get_character_count_by_game(game_id)
        logger.info(f"Retrieved game character count: game_id={game_id}, count={count}")
        return {"game_id": game_id, "character_count": count}
    except Exception as e:
        logger.error(f"Failed to get game character count: game_id={game_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail=f"機体数取得に失敗しました: {str(e)}")