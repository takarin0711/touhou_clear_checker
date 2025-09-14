from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from application.services.game_service import GameService
from application.dtos.game_dto import CreateGameDto, UpdateGameDto
from ..dependencies import get_game_service
from ...schemas.game_schema import GameCreate, GameUpdate, GameResponse

router = APIRouter(prefix="/api/v1/games", tags=["games"])

@router.get("/", response_model=List[GameResponse])
async def get_games(game_service: GameService = Depends(get_game_service)):
    games = game_service.get_all_games()
    return [GameResponse(
        id=game.id,
        title=game.title,
        series_number=game.series_number,
        release_year=game.release_year
    ) for game in games]

@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, game_service: GameService = Depends(get_game_service)):
    game = game_service.get_game_by_id(game_id)
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")
    return GameResponse(
        id=game.id,
        title=game.title,
        series_number=game.series_number,
        release_year=game.release_year
    )

@router.post("/", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(game_data: GameCreate, game_service: GameService = Depends(get_game_service)):
    create_dto = CreateGameDto(
        title=game_data.title,
        series_number=game_data.series_number,
        release_year=game_data.release_year
    )
    game = game_service.create_game(create_dto)
    return GameResponse(
        id=game.id,
        title=game.title,
        series_number=game.series_number,
        release_year=game.release_year
    )

@router.put("/{game_id}", response_model=GameResponse)
async def update_game(game_id: int, game_data: GameUpdate, game_service: GameService = Depends(get_game_service)):
    update_dto = UpdateGameDto(
        title=game_data.title,
        series_number=game_data.series_number,
        release_year=game_data.release_year
    )
    game = game_service.update_game(game_id, update_dto)
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")
    return GameResponse(
        id=game.id,
        title=game.title,
        series_number=game.series_number,
        release_year=game.release_year
    )

@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(game_id: int, game_service: GameService = Depends(get_game_service)):
    success = game_service.delete_game(game_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")