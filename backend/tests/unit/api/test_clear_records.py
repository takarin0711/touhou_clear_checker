"""
クリア記録APIの単体テスト
"""
import pytest
from datetime import datetime, date
from unittest.mock import Mock, AsyncMock
from fastapi import HTTPException, status
from presentation.api.v1.clear_records import (
    get_my_clear_records,
    get_clear_record_by_id,
    create_clear_record,
    update_clear_record,
    delete_clear_record,
    upsert_clear_record,
    batch_create_or_update_records,
    _to_response
)
from domain.entities.clear_record import ClearRecord
from domain.entities.user import User
from presentation.schemas.clear_record_schema import ClearRecordCreate, ClearRecordUpdate, ClearRecordBatch


class TestClearRecordsAPI:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_service = Mock()
        
        # サンプルユーザー
        self.sample_user = User(
            id=1,
            username="test_user",
            email="test@example.com",
            hashed_password="hashed_password",
            email_verified=True
        )
        
        # サンプルエンティティ
        self.sample_record = ClearRecord(
            id=1,
            user_id=1,
            game_id=1,
            character_name="霊夢",
            difficulty="Easy",
            mode="normal",
            is_cleared=True,
            is_no_continue_clear=False,
            is_no_bomb_clear=False,
            is_no_miss_clear=False,
            is_full_spell_card=False,
            is_special_clear_1=False,
            is_special_clear_2=False,
            is_special_clear_3=False,
            cleared_at=date(2024, 1, 1),
            last_updated_at=datetime(2024, 1, 1, 10, 0, 0),
            created_at=datetime(2024, 1, 1, 10, 0, 0)
        )
        
        # サンプル作成スキーマ
        self.sample_create_schema = ClearRecordCreate(
            game_id=1,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True,
            is_no_continue_clear=False,
            is_no_bomb_clear=False,
            is_no_miss_clear=False,
            is_full_spell_card=False,
            is_special_clear_1=False,
            is_special_clear_2=False,
            is_special_clear_3=False,
            cleared_at=date(2024, 1, 1)
        )
        
        # サンプル更新スキーマ
        self.sample_update_schema = ClearRecordUpdate(
            is_cleared=True,
            is_no_continue_clear=True
        )
        
    def test_to_response_conversion(self):
        """エンティティからレスポンススキーマへの変換テスト"""
        response = _to_response(self.sample_record)
        
        assert response.id == 1
        assert response.game_id == 1
        assert response.character_name == "霊夢"
        assert response.difficulty == "Easy"
        assert response.mode == "normal"
        assert response.is_cleared is True
        assert response.is_no_continue_clear is False
        assert response.cleared_at == date(2024, 1, 1)
        
    @pytest.mark.asyncio
    async def test_get_my_clear_records_all(self):
        """全クリア記録取得のテスト"""
        self.mock_service.get_user_clear_records = AsyncMock(return_value=[self.sample_record])
        
        result = await get_my_clear_records(
            game_id=None,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert len(result) == 1
        assert result[0].character_name == "霊夢"
        self.mock_service.get_user_clear_records.assert_called_once_with(1)
        
    @pytest.mark.asyncio
    async def test_get_my_clear_records_by_game(self):
        """ゲーム指定でクリア記録取得のテスト"""
        self.mock_service.get_user_game_clear_records = AsyncMock(return_value=[self.sample_record])
        
        result = await get_my_clear_records(
            game_id=1,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert len(result) == 1
        assert result[0].game_id == 1
        self.mock_service.get_user_game_clear_records.assert_called_once_with(1, 1)
        
    @pytest.mark.asyncio
    async def test_get_clear_record_by_id_success(self):
        """ID指定でクリア記録取得成功のテスト"""
        self.mock_service.get_clear_record_by_id = AsyncMock(return_value=self.sample_record)
        
        result = await get_clear_record_by_id(
            record_id=1,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert result.id == 1
        assert result.character_name == "霊夢"
        self.mock_service.get_clear_record_by_id.assert_called_once_with(1)
        
    @pytest.mark.asyncio
    async def test_get_clear_record_by_id_not_found(self):
        """ID指定でクリア記録取得失敗のテスト"""
        self.mock_service.get_clear_record_by_id = AsyncMock(return_value=None)
        
        with pytest.raises(HTTPException) as exc_info:
            await get_clear_record_by_id(
                record_id=999,
                current_user=self.sample_user,
                clear_record_service=self.mock_service
            )
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Clear record not found" in str(exc_info.value.detail)
        
    @pytest.mark.asyncio
    async def test_get_clear_record_by_id_forbidden(self):
        """ID指定でクリア記録取得（権限なし）のテスト"""
        # 他のユーザーの記録
        other_user_record = ClearRecord(
            id=1,
            user_id=2,  # 異なるユーザーID
            game_id=1,
            character_name="霊夢",
            difficulty="Easy"
        )
        self.mock_service.get_clear_record_by_id = AsyncMock(return_value=other_user_record)
        
        with pytest.raises(HTTPException) as exc_info:
            await get_clear_record_by_id(
                record_id=1,
                current_user=self.sample_user,
                clear_record_service=self.mock_service
            )
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert "Access denied" in str(exc_info.value.detail)
        
    @pytest.mark.asyncio
    async def test_create_clear_record(self):
        """クリア記録作成のテスト"""
        created_record = ClearRecord(
            id=2,
            user_id=1,
            game_id=1,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True
        )
        self.mock_service.create_clear_record = AsyncMock(return_value=created_record)
        
        result = await create_clear_record(
            record_data=self.sample_create_schema,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert result.id == 2
        assert result.character_name == "魔理沙"
        self.mock_service.create_clear_record.assert_called_once_with(1, self.sample_create_schema.model_dump())
        
    @pytest.mark.asyncio
    async def test_update_clear_record_success(self):
        """クリア記録更新成功のテスト"""
        updated_record = ClearRecord(
            id=1,
            user_id=1,
            game_id=1,
            character_name="霊夢",
            difficulty="Easy",
            mode="normal",
            is_cleared=True,
            is_no_continue_clear=True
        )
        self.mock_service.update_clear_record = AsyncMock(return_value=updated_record)
        
        result = await update_clear_record(
            record_id=1,
            update_data=self.sample_update_schema,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert result.id == 1
        assert result.is_no_continue_clear is True
        self.mock_service.update_clear_record.assert_called_once_with(1, 1, self.sample_update_schema.model_dump())
        
    @pytest.mark.asyncio
    async def test_update_clear_record_not_found(self):
        """クリア記録更新失敗のテスト"""
        self.mock_service.update_clear_record = AsyncMock(return_value=None)
        
        with pytest.raises(HTTPException) as exc_info:
            await update_clear_record(
                record_id=999,
                update_data=self.sample_update_schema,
                current_user=self.sample_user,
                clear_record_service=self.mock_service
            )
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Clear record not found" in str(exc_info.value.detail)
        
    @pytest.mark.asyncio
    async def test_delete_clear_record_success(self):
        """クリア記録削除成功のテスト"""
        self.mock_service.delete_clear_record = AsyncMock(return_value=True)
        
        # この関数はNoneを返すため、例外が発生しないことを確認
        result = await delete_clear_record(
            record_id=1,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert result is None  # 204 No Contentなので戻り値はNone
        self.mock_service.delete_clear_record.assert_called_once_with(1, 1)
        
    @pytest.mark.asyncio
    async def test_delete_clear_record_not_found(self):
        """クリア記録削除失敗のテスト"""
        self.mock_service.delete_clear_record = AsyncMock(return_value=False)
        
        with pytest.raises(HTTPException) as exc_info:
            await delete_clear_record(
                record_id=999,
                current_user=self.sample_user,
                clear_record_service=self.mock_service
            )
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Clear record not found" in str(exc_info.value.detail)
        
    @pytest.mark.asyncio
    async def test_upsert_clear_record(self):
        """クリア記録Upsertのテスト"""
        upserted_record = ClearRecord(
            id=2,
            user_id=1,
            game_id=1,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True
        )
        self.mock_service.upsert_clear_record = AsyncMock(return_value=upserted_record)
        
        result = await upsert_clear_record(
            record_data=self.sample_create_schema,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert result.id == 2
        assert result.character_name == "魔理沙"
        self.mock_service.upsert_clear_record.assert_called_once_with(1, self.sample_create_schema.model_dump())
        
    @pytest.mark.asyncio
    async def test_batch_create_or_update_records(self):
        """一括クリア記録作成/更新のテスト"""
        record1 = ClearRecord(id=1, user_id=1, game_id=1, character_name="霊夢", difficulty="Easy", is_cleared=True)
        record2 = ClearRecord(id=2, user_id=1, game_id=1, character_name="魔理沙", difficulty="Normal", is_cleared=True)
        
        self.mock_service.batch_upsert_clear_records = AsyncMock(return_value=[record1, record2])
        
        # バッチスキーマの作成
        batch_schema = ClearRecordBatch(
            records=[
                ClearRecordCreate(
                    game_id=1, character_name="霊夢", difficulty="Easy", 
                    mode="normal", is_cleared=True
                ),
                ClearRecordCreate(
                    game_id=1, character_name="魔理沙", difficulty="Normal", 
                    mode="normal", is_cleared=True
                )
            ]
        )
        
        result = await batch_create_or_update_records(
            batch_data=batch_schema,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert len(result) == 2
        assert result[0].character_name == "霊夢"
        assert result[1].character_name == "魔理沙"
        self.mock_service.batch_upsert_clear_records.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_batch_create_or_update_records_empty(self):
        """一括クリア記録作成/更新（空リスト）のテスト"""
        self.mock_service.batch_upsert_clear_records = AsyncMock(return_value=[])
        
        batch_schema = ClearRecordBatch(records=[])
        
        result = await batch_create_or_update_records(
            batch_data=batch_schema,
            current_user=self.sample_user,
            clear_record_service=self.mock_service
        )
        
        assert len(result) == 0
        self.mock_service.batch_upsert_clear_records.assert_called_once_with(1, [])