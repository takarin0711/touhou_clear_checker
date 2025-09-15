from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from application.services.clear_status_service import ClearStatusService
from application.dtos.clear_status_dto import CreateClearStatusDto, UpdateClearStatusDto
from domain.value_objects.difficulty import Difficulty
from domain.entities.user import User
from infrastructure.security.auth_middleware import get_current_active_user
from ..dependencies import get_clear_status_service
from ...schemas.clear_status_schema import ClearStatusCreate, ClearStatusUpdate, ClearStatusResponse

router = APIRouter()


def _to_response(cs) -> ClearStatusResponse:
    return ClearStatusResponse(
        id=cs.id,
        game_id=cs.game_id,
        user_id=cs.user_id,
        difficulty=cs.difficulty,
        is_cleared=cs.is_cleared,
        cleared_at=cs.cleared_at,
        no_continue_clear=cs.no_continue_clear,
        no_bomb_clear=cs.no_bomb_clear,
        no_miss_clear=cs.no_miss_clear,
        score=cs.score,
        memo=cs.memo,
        clear_count=cs.clear_count
    )

@router.get("/", response_model=List[ClearStatusResponse])
async def get_my_clear_status(
    current_user: User = Depends(get_current_active_user),
    clear_status_service: ClearStatusService = Depends(get_clear_status_service)
):
    """現在のユーザーのクリア状況一覧取得"""
    clear_statuses = clear_status_service.get_clear_status_by_user_id(current_user.id)
    return [_to_response(cs) for cs in clear_statuses]

@router.get("/game/{game_id}", response_model=List[ClearStatusResponse])
async def get_my_clear_status_by_game(
    game_id: int,
    current_user: User = Depends(get_current_active_user),
    clear_status_service: ClearStatusService = Depends(get_clear_status_service)
):
    """現在のユーザーの特定ゲームのクリア状況取得"""
    clear_statuses = clear_status_service.get_clear_status_by_user_and_game(current_user.id, game_id)
    return [_to_response(cs) for cs in clear_statuses]

@router.get("/{clear_status_id}", response_model=ClearStatusResponse)
async def get_clear_status_by_id(clear_status_id: int, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    clear_status = clear_status_service.get_clear_status_by_id(clear_status_id)
    if not clear_status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear status not found")
    return ClearStatusResponse(
        id=clear_status.id,
        game_id=clear_status.game_id,
        difficulty=clear_status.difficulty,
        is_cleared=clear_status.is_cleared,
        cleared_at=clear_status.cleared_at
    )

@router.post("/", response_model=ClearStatusResponse, status_code=status.HTTP_201_CREATED)
async def create_clear_status(
    clear_status_data: ClearStatusCreate,
    current_user: User = Depends(get_current_active_user),
    clear_status_service: ClearStatusService = Depends(get_clear_status_service)
):
    """クリア状況の作成"""
    create_dto = CreateClearStatusDto(
        game_id=clear_status_data.game_id,
        user_id=current_user.id,  # 現在のユーザーIDを設定
        difficulty=clear_status_data.difficulty,
        is_cleared=clear_status_data.is_cleared,
        cleared_at=clear_status_data.cleared_at,
        no_continue_clear=clear_status_data.no_continue_clear,
        no_bomb_clear=clear_status_data.no_bomb_clear,
        no_miss_clear=clear_status_data.no_miss_clear,
        score=clear_status_data.score,
        memo=clear_status_data.memo,
        clear_count=clear_status_data.clear_count
    )
    clear_status = clear_status_service.create_clear_status(create_dto)
    return _to_response(clear_status)

@router.put("/{clear_status_id}", response_model=ClearStatusResponse)
async def update_clear_status(clear_status_id: int, clear_status_data: ClearStatusUpdate, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    update_dto = UpdateClearStatusDto(
        is_cleared=clear_status_data.is_cleared,
        cleared_at=clear_status_data.cleared_at,
        no_continue_clear=clear_status_data.no_continue_clear,
        no_bomb_clear=clear_status_data.no_bomb_clear,
        no_miss_clear=clear_status_data.no_miss_clear,
        score=clear_status_data.score,
        memo=clear_status_data.memo,
        clear_count=clear_status_data.clear_count
    )
    clear_status = clear_status_service.update_clear_status(clear_status_id, update_dto)
    if not clear_status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear status not found")
    return _to_response(clear_status)

@router.post("/mark-cleared/{game_id}/{difficulty}", response_model=ClearStatusResponse)
async def mark_as_cleared(game_id: int, difficulty: Difficulty, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    clear_status = clear_status_service.mark_as_cleared(game_id, difficulty)
    return ClearStatusResponse(
        id=clear_status.id,
        game_id=clear_status.game_id,
        difficulty=clear_status.difficulty,
        is_cleared=clear_status.is_cleared,
        cleared_at=clear_status.cleared_at
    )

@router.delete("/{clear_status_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clear_status(clear_status_id: int, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    success = clear_status_service.delete_clear_status(clear_status_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear status not found")