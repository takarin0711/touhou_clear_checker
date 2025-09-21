from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from application.services.game_service import GameService
from application.services.character_service import CharacterService
from domain.value_objects.game_type import GameType
from ..dependencies import get_game_service, get_character_service, get_current_user
from ...schemas.game_schema import GameResponse
from domain.entities.user import User

router = APIRouter()

@router.get("", response_model=List[GameResponse])
async def get_games(
    series_number: Optional[Decimal] = Query(None, description="シリーズ番号で検索"),
    game_type: Optional[str] = Query(None, description="ゲームタイプで検索"),
    game_service: GameService = Depends(get_game_service)
):
    """ゲーム一覧取得（検索パラメータ対応）"""
    
    # game_typeの文字列をEnumに変換
    parsed_game_type = None
    if game_type:
        try:
            parsed_game_type = GameType(game_type)
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid game_type: {game_type}. Valid values: {[gt.value for gt in GameType]}"
            )
    
    # フィルタリングされたゲーム一覧を取得
    if series_number is not None or parsed_game_type is not None:
        game_dtos = game_service.get_games_filtered(
            series_number=series_number, 
            game_type=parsed_game_type
        )
    else:
        game_dtos = game_service.get_all_games()
    
    return [GameResponse(
        id=dto.id,
        title=dto.title,
        series_number=dto.series_number,
        release_year=dto.release_year,
        game_type=dto.game_type if hasattr(dto, 'game_type') else 'main_series'
    ) for dto in game_dtos]


@router.get("/{game_id}/characters", response_model=List[dict])
async def get_game_characters(
    game_id: int,
    character_service: CharacterService = Depends(get_character_service),
    current_user: User = Depends(get_current_user)
):
    """特定ゲームで利用可能なキャラクター一覧を取得"""
    try:
        characters = await character_service.get_characters_by_game_id(game_id)
        return [character.to_dict() for character in characters]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"キャラクター取得に失敗しました: {str(e)}")

