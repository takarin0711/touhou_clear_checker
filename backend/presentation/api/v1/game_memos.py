"""
ゲームメモAPI
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from application.services.game_memo_service import GameMemoService
from domain.entities.user import User
from ..dependencies import get_game_memo_service, get_current_user

router = APIRouter()


class GameMemoRequest(BaseModel):
    """ゲームメモリクエスト"""
    memo: str


class GameMemoResponse(BaseModel):
    """ゲームメモレスポンス"""
    id: int
    user_id: int
    game_id: int
    memo: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.get("", response_model=List[GameMemoResponse])
async def get_my_game_memos(
    current_user: User = Depends(get_current_user),
    game_memo_service: GameMemoService = Depends(get_game_memo_service)
):
    """ユーザーの全ゲームメモを取得"""
    try:
        memos = await game_memo_service.get_user_memos(current_user.id)
        return [
            GameMemoResponse(
                id=memo.id,
                user_id=memo.user_id,
                game_id=memo.game_id,
                memo=memo.memo,
                created_at=memo.created_at.isoformat() if memo.created_at else None,
                updated_at=memo.updated_at.isoformat() if memo.updated_at else None
            ) for memo in memos
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ゲームメモ取得に失敗しました: {str(e)}")


@router.get("/{game_id}", response_model=GameMemoResponse)
async def get_game_memo(
    game_id: int,
    current_user: User = Depends(get_current_user),
    game_memo_service: GameMemoService = Depends(get_game_memo_service)
):
    """特定ゲームのメモを取得"""
    try:
        memo = await game_memo_service.get_user_game_memo(current_user.id, game_id)
        if not memo:
            raise HTTPException(status_code=404, detail="ゲームメモが見つかりません")
        
        return GameMemoResponse(
            id=memo.id,
            user_id=memo.user_id,
            game_id=memo.game_id,
            memo=memo.memo,
            created_at=memo.created_at.isoformat() if memo.created_at else None,
            updated_at=memo.updated_at.isoformat() if memo.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ゲームメモ取得に失敗しました: {str(e)}")


@router.post("/{game_id}", response_model=GameMemoResponse)
async def create_game_memo(
    game_id: int,
    request: GameMemoRequest,
    current_user: User = Depends(get_current_user),
    game_memo_service: GameMemoService = Depends(get_game_memo_service)
):
    """ゲームメモを作成"""
    try:
        memo = await game_memo_service.create_game_memo(
            current_user.id, game_id, request.memo
        )
        return GameMemoResponse(
            id=memo.id,
            user_id=memo.user_id,
            game_id=memo.game_id,
            memo=memo.memo,
            created_at=memo.created_at.isoformat() if memo.created_at else None,
            updated_at=memo.updated_at.isoformat() if memo.updated_at else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ゲームメモ作成に失敗しました: {str(e)}")


@router.put("/{game_id}", response_model=GameMemoResponse)
async def update_game_memo(
    game_id: int,
    request: GameMemoRequest,
    current_user: User = Depends(get_current_user),
    game_memo_service: GameMemoService = Depends(get_game_memo_service)
):
    """ゲームメモを更新"""
    try:
        # 既存メモを取得
        existing_memo = await game_memo_service.get_user_game_memo(current_user.id, game_id)
        if not existing_memo:
            raise HTTPException(status_code=404, detail="ゲームメモが見つかりません")
        
        memo = await game_memo_service.update_game_memo(
            existing_memo.id, current_user.id, request.memo
        )
        if not memo:
            raise HTTPException(status_code=404, detail="ゲームメモが見つかりません")
        
        return GameMemoResponse(
            id=memo.id,
            user_id=memo.user_id,
            game_id=memo.game_id,
            memo=memo.memo,
            created_at=memo.created_at.isoformat() if memo.created_at else None,
            updated_at=memo.updated_at.isoformat() if memo.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ゲームメモ更新に失敗しました: {str(e)}")


@router.delete("/{game_id}")
async def delete_game_memo(
    game_id: int,
    current_user: User = Depends(get_current_user),
    game_memo_service: GameMemoService = Depends(get_game_memo_service)
):
    """ゲームメモを削除"""
    try:
        # 既存メモを取得
        existing_memo = await game_memo_service.get_user_game_memo(current_user.id, game_id)
        if not existing_memo:
            raise HTTPException(status_code=404, detail="ゲームメモが見つかりません")
        
        success = await game_memo_service.delete_game_memo(existing_memo.id, current_user.id)
        if not success:
            raise HTTPException(status_code=404, detail="ゲームメモが見つかりません")
        
        return {"message": "ゲームメモを削除しました"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ゲームメモ削除に失敗しました: {str(e)}")


@router.post("/{game_id}/upsert", response_model=GameMemoResponse)
async def create_or_update_game_memo(
    game_id: int,
    request: GameMemoRequest,
    current_user: User = Depends(get_current_user),
    game_memo_service: GameMemoService = Depends(get_game_memo_service)
):
    """ゲームメモを作成または更新（UPSERT）"""
    try:
        memo = await game_memo_service.create_or_update_game_memo(
            current_user.id, game_id, request.memo
        )
        return GameMemoResponse(
            id=memo.id,
            user_id=memo.user_id,
            game_id=memo.game_id,
            memo=memo.memo,
            created_at=memo.created_at.isoformat() if memo.created_at else None,
            updated_at=memo.updated_at.isoformat() if memo.updated_at else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ゲームメモ保存に失敗しました: {str(e)}")