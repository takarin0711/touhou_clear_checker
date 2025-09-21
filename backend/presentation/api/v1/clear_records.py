"""
クリア記録API（機体別個別条件対応）
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from application.services.clear_record_service import ClearRecordService
from domain.entities.user import User
from infrastructure.security.auth_middleware import get_current_active_user
from ..dependencies import get_clear_record_service
from ...schemas.clear_record_schema import ClearRecordCreate, ClearRecordUpdate, ClearRecordResponse, ClearRecordBatch

router = APIRouter()


def _to_response(record) -> ClearRecordResponse:
    """エンティティをレスポンススキーマに変換"""
    return ClearRecordResponse(
        id=record.id,
        game_id=record.game_id,
        character_name=record.character_name,
        difficulty=record.difficulty,
        mode=getattr(record, 'mode', 'normal'),
        is_cleared=record.is_cleared,
        is_no_continue_clear=record.is_no_continue_clear,
        is_no_bomb_clear=record.is_no_bomb_clear,
        is_no_miss_clear=record.is_no_miss_clear,
        is_full_spell_card=record.is_full_spell_card,
        cleared_at=record.cleared_at,
        created_at=record.created_at,
        last_updated_at=record.last_updated_at
    )


@router.get("", response_model=List[ClearRecordResponse])
async def get_my_clear_records(
    game_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """現在のユーザーのクリア記録一覧取得"""
    if game_id:
        records = await clear_record_service.get_user_game_clear_records(current_user.id, game_id)
    else:
        records = await clear_record_service.get_user_clear_records(current_user.id)
    return [_to_response(record) for record in records]


@router.get("/{record_id}", response_model=ClearRecordResponse)
async def get_clear_record_by_id(
    record_id: int,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """クリア記録を取得"""
    record = await clear_record_service.get_clear_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear record not found")
    
    # ユーザー権限チェック
    if record.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return _to_response(record)


@router.post("", response_model=ClearRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_clear_record(
    record_data: ClearRecordCreate,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """クリア記録を作成"""
    record = await clear_record_service.create_clear_record(current_user.id, record_data.dict())
    return _to_response(record)


@router.put("/{record_id}", response_model=ClearRecordResponse)
async def update_clear_record(
    record_id: int,
    update_data: ClearRecordUpdate,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """クリア記録を更新"""
    record = await clear_record_service.update_clear_record(record_id, current_user.id, update_data.dict())
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear record not found")
    return _to_response(record)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clear_record(
    record_id: int,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """クリア記録を削除"""
    success = await clear_record_service.delete_clear_record(record_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clear record not found")


@router.post("/upsert", response_model=ClearRecordResponse)
async def upsert_clear_record(
    record_data: ClearRecordCreate,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """クリア記録をUpsert（作成または更新）"""
    record = await clear_record_service.upsert_clear_record(current_user.id, record_data.dict())
    return _to_response(record)


@router.post("/batch", response_model=List[ClearRecordResponse])
async def batch_create_or_update_records(
    batch_data: ClearRecordBatch,
    current_user: User = Depends(get_current_active_user),
    clear_record_service: ClearRecordService = Depends(get_clear_record_service)
):
    """複数のクリア記録を一括作成/更新"""
    records_data = [record.dict() for record in batch_data.records]
    records = await clear_record_service.batch_upsert_clear_records(current_user.id, records_data)
    return [_to_response(record) for record in records]