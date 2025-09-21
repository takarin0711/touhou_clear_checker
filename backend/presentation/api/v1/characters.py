"""
キャラクターAPI
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from application.services.character_service import CharacterService
from infrastructure.database.repositories.character_repository_impl import CharacterRepositoryImpl
from presentation.api.dependencies import get_current_user, get_current_admin_user
from domain.entities.user import User
from domain.entities.character import Character

router = APIRouter()


def get_character_service() -> CharacterService:
    """キャラクターサービスを取得"""
    character_repository = CharacterRepositoryImpl()
    return CharacterService(character_repository)


@router.get("", response_model=List[dict])
async def get_characters(
    character_service: CharacterService = Depends(get_character_service),
    current_user: User = Depends(get_current_user)
):
    """全キャラクター一覧を取得"""
    try:
        characters = await character_service.get_all_characters()
        return [character.to_dict() for character in characters]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"キャラクター取得に失敗しました: {str(e)}")


@router.get("/{character_id}", response_model=dict)
async def get_character_by_id(
    character_id: int,
    character_service: CharacterService = Depends(get_character_service),
    current_user: User = Depends(get_current_user)
):
    """IDでキャラクターを取得"""
    try:
        character = await character_service.get_character_by_id(character_id)
        if not character:
            raise HTTPException(status_code=404, detail="キャラクターが見つかりません")
        return character.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"キャラクター取得に失敗しました: {str(e)}")


@router.post("", response_model=dict)
async def create_character(
    character_data: dict,
    character_service: CharacterService = Depends(get_character_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """キャラクターを作成（管理者のみ）"""
    try:
        character = Character(
            name=character_data.get('name', '')
        )
        
        created_character = await character_service.create_character(character)
        return created_character.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"キャラクター作成に失敗しました: {str(e)}")


@router.put("/{character_id}", response_model=dict)
async def update_character(
    character_id: int,
    character_data: dict,
    character_service: CharacterService = Depends(get_character_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """キャラクターを更新（管理者のみ）"""
    try:
        # 既存キャラクターを取得
        existing_character = await character_service.get_character_by_id(character_id)
        if not existing_character:
            raise HTTPException(status_code=404, detail="キャラクターが見つかりません")
        
        # 更新
        existing_character.name = character_data.get('name', existing_character.name)
        updated_character = await character_service.update_character(existing_character)
        return updated_character.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"キャラクター更新に失敗しました: {str(e)}")


@router.delete("/{character_id}")
async def delete_character(
    character_id: int,
    character_service: CharacterService = Depends(get_character_service),
    current_admin: User = Depends(get_current_admin_user)
):
    """キャラクターを削除（管理者のみ）"""
    try:
        success = await character_service.delete_character(character_id)
        if not success:
            raise HTTPException(status_code=404, detail="キャラクターが見つかりません")
        return {"message": "キャラクターが削除されました"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"キャラクター削除に失敗しました: {str(e)}")