"""
ゲーム機体API（統合game_charactersテーブル対応）
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.repositories.game_character_repository import GameCharacterRepository
from infrastructure.database.connection import get_db
from infrastructure.security.auth_middleware import get_current_user, get_optional_current_user
from domain.entities.user import User
from typing import Optional
from domain.entities.game_character import GameCharacter

router = APIRouter()


def get_game_character_repository(session: Session = Depends(get_db)) -> GameCharacterRepository:
    """ゲーム機体リポジトリを取得"""
    return GameCharacterRepository(session)


@router.get("/{game_id}/characters", response_model=List[dict])
async def get_game_characters(
    game_id: int,
    repository: GameCharacterRepository = Depends(get_game_character_repository)
):
    """ゲーム別機体一覧を取得（認証なし）"""
    try:
        characters = repository.find_by_game_id(game_id)
        return [character.to_dict() for character in characters]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"機体取得に失敗しました: {str(e)}")


@router.get("/characters/{character_id}", response_model=dict)
async def get_game_character_by_id(
    character_id: int,
    repository: GameCharacterRepository = Depends(get_game_character_repository)
):
    """IDで機体を取得（認証なし）"""
    try:
        character = repository.find_by_id(character_id)
        if not character:
            raise HTTPException(status_code=404, detail="機体が見つかりません")
        return character.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"機体取得に失敗しました: {str(e)}")


@router.post("/{game_id}/characters", response_model=dict)
async def create_game_character(
    game_id: int,
    character_data: dict,
    repository: GameCharacterRepository = Depends(get_game_character_repository),
    current_user: User = Depends(get_current_user)
):
    """ゲーム機体を作成（管理者のみ）"""
    try:
        character = GameCharacter(
            game_id=game_id,
            character_name=character_data.get('character_name', ''),
            description=character_data.get('description'),
            sort_order=character_data.get('sort_order', 0)
        )
        
        # 重複チェック
        existing = repository.find_by_game_and_name(game_id, character.character_name)
        if existing:
            raise HTTPException(status_code=400, detail="同じ名前の機体が既に存在します")
        
        created_character = repository.save(character)
        return created_character.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"機体作成に失敗しました: {str(e)}")


@router.put("/characters/{character_id}", response_model=dict)
async def update_game_character(
    character_id: int,
    character_data: dict,
    repository: GameCharacterRepository = Depends(get_game_character_repository),
    current_user: User = Depends(get_current_user)
):
    """ゲーム機体を更新（管理者のみ）"""
    try:
        # 既存機体を取得
        existing_character = repository.find_by_id(character_id)
        if not existing_character:
            raise HTTPException(status_code=404, detail="機体が見つかりません")
        
        # 更新データを適用
        existing_character.character_name = character_data.get('character_name', existing_character.character_name)
        existing_character.description = character_data.get('description', existing_character.description)
        existing_character.sort_order = character_data.get('sort_order', existing_character.sort_order)
        
        # 名前重複チェック（自分以外）
        duplicate = repository.find_by_game_and_name(existing_character.game_id, existing_character.character_name)
        if duplicate and duplicate.id != character_id:
            raise HTTPException(status_code=400, detail="同じ名前の機体が既に存在します")
        
        updated_character = repository.save(existing_character)
        return updated_character.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"機体更新に失敗しました: {str(e)}")


@router.delete("/characters/{character_id}")
async def delete_game_character(
    character_id: int,
    repository: GameCharacterRepository = Depends(get_game_character_repository),
    current_user: User = Depends(get_current_user)
):
    """ゲーム機体を削除（管理者のみ）"""
    try:
        success = repository.delete(character_id)
        if not success:
            raise HTTPException(status_code=404, detail="機体が見つかりません")
        return {"message": "機体が削除されました"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"機体削除に失敗しました: {str(e)}")


@router.get("/{game_id}/characters/count", response_model=dict)
async def get_game_character_count(
    game_id: int,
    repository: GameCharacterRepository = Depends(get_game_character_repository)
):
    """ゲーム別機体数を取得（認証なし）"""
    try:
        count = repository.get_character_count_by_game(game_id)
        return {"game_id": game_id, "character_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"機体数取得に失敗しました: {str(e)}")