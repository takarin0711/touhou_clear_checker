from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from application.services.clear_status_service import ClearStatusService
from application.dtos.clear_status_dto import CreateClearStatusDto, UpdateClearStatusDto
from domain.value_objects.difficulty import Difficulty
from ..dependencies import get_clear_status_service
from ...schemas.clear_status_schema import ClearStatusCreate, ClearStatusUpdate, ClearStatusResponse

router = APIRouter(prefix="/api/v1/clear-status", tags=["clear-status"])

@router.get("/", response_model=List[ClearStatusResponse])
async def get_clear_status(clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    clear_statuses = clear_status_service.get_all_clear_status()
    return [ClearStatusResponse(
        id=cs.id,
        game_id=cs.game_id,
        difficulty=cs.difficulty,
        is_cleared=cs.is_cleared,
        cleared_at=cs.cleared_at
    ) for cs in clear_statuses]

@router.get("/game/{game_id}", response_model=List[ClearStatusResponse])
async def get_clear_status_by_game(game_id: int, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    clear_statuses = clear_status_service.get_clear_status_by_game_id(game_id)
    return [ClearStatusResponse(
        id=cs.id,
        game_id=cs.game_id,
        difficulty=cs.difficulty,
        is_cleared=cs.is_cleared,
        cleared_at=cs.cleared_at
    ) for cs in clear_statuses]

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
async def create_clear_status(clear_status_data: ClearStatusCreate, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    create_dto = CreateClearStatusDto(
        game_id=clear_status_data.game_id,
        difficulty=clear_status_data.difficulty,
        is_cleared=clear_status_data.is_cleared,
        cleared_at=clear_status_data.cleared_at
    )
    clear_status = clear_status_service.create_clear_status(create_dto)
    return ClearStatusResponse(
        id=clear_status.id,
        game_id=clear_status.game_id,
        difficulty=clear_status.difficulty,
        is_cleared=clear_status.is_cleared,
        cleared_at=clear_status.cleared_at
    )

@router.put("/{clear_status_id}", response_model=ClearStatusResponse)
async def update_clear_status(clear_status_id: int, clear_status_data: ClearStatusUpdate, clear_status_service: ClearStatusService = Depends(get_clear_status_service)):
    update_dto = UpdateClearStatusDto(
        is_cleared=clear_status_data.is_cleared,
        cleared_at=clear_status_data.cleared_at
    )
    clear_status = clear_status_service.update_clear_status(clear_status_id, update_dto)
    if not clear_status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear status not found")
    return ClearStatusResponse(
        id=clear_status.id,
        game_id=clear_status.game_id,
        difficulty=clear_status.difficulty,
        is_cleared=clear_status.is_cleared,
        cleared_at=clear_status.cleared_at
    )

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