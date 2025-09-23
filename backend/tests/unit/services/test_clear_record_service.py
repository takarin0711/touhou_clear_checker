"""
クリア記録サービスの単体テスト
"""
import pytest
from datetime import datetime, date
from unittest.mock import Mock, AsyncMock
from application.services.clear_record_service import ClearRecordService
from domain.entities.clear_record import ClearRecord


class TestClearRecordService:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_repository = Mock()
        self.service = ClearRecordService(self.mock_repository)
        
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
        
        # サンプル作成データ
        self.sample_create_data = {
            'game_id': 1,
            'character_name': '魔理沙',
            'difficulty': 'Normal',
            'mode': 'normal',
            'is_cleared': True,
            'is_no_continue_clear': False,
            'is_no_bomb_clear': False,
            'is_no_miss_clear': False,
            'is_full_spell_card': False,
            'is_special_clear_1': False,
            'is_special_clear_2': False,
            'is_special_clear_3': False,
            'cleared_at': date(2024, 1, 1)
        }
        
    @pytest.mark.asyncio
    async def test_get_user_clear_records(self):
        """ユーザーのクリア記録取得のテスト"""
        self.mock_repository.find_by_user_id = AsyncMock(return_value=[self.sample_record])
        
        result = await self.service.get_user_clear_records(1)
        
        assert len(result) == 1
        assert result[0].user_id == 1
        assert result[0].character_name == "霊夢"
        self.mock_repository.find_by_user_id.assert_called_once_with(1)
        
    @pytest.mark.asyncio
    async def test_get_user_game_clear_records(self):
        """ユーザーの特定ゲームクリア記録取得のテスト"""
        self.mock_repository.find_by_user_and_game = AsyncMock(return_value=[self.sample_record])
        
        result = await self.service.get_user_game_clear_records(1, 1)
        
        assert len(result) == 1
        assert result[0].user_id == 1
        assert result[0].game_id == 1
        self.mock_repository.find_by_user_and_game.assert_called_once_with(1, 1)
        
    @pytest.mark.asyncio
    async def test_get_clear_record_by_id_found(self):
        """IDでクリア記録取得成功のテスト"""
        self.mock_repository.find_by_id = AsyncMock(return_value=self.sample_record)
        
        result = await self.service.get_clear_record_by_id(1)
        
        assert result is not None
        assert result.id == 1
        assert result.character_name == "霊夢"
        self.mock_repository.find_by_id.assert_called_once_with(1)
        
    @pytest.mark.asyncio
    async def test_get_clear_record_by_id_not_found(self):
        """IDでクリア記録取得失敗のテスト"""
        self.mock_repository.find_by_id = AsyncMock(return_value=None)
        
        result = await self.service.get_clear_record_by_id(999)
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(999)
        
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
        self.mock_repository.create = AsyncMock(return_value=created_record)
        
        result = await self.service.create_clear_record(1, self.sample_create_data)
        
        assert result.id == 2
        assert result.character_name == "魔理沙"
        assert result.user_id == 1
        self.mock_repository.create.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_create_clear_record_with_defaults(self):
        """クリア記録作成（デフォルト値）のテスト"""
        minimal_data = {
            'game_id': 1,
            'character_name': 'さくや',
            'difficulty': 'Hard'
        }
        
        created_record = ClearRecord(
            id=3,
            user_id=1,
            game_id=1,
            character_name="さくや",
            difficulty="Hard",
            mode="normal",
            is_cleared=False
        )
        self.mock_repository.create = AsyncMock(return_value=created_record)
        
        result = await self.service.create_clear_record(1, minimal_data)
        
        assert result.id == 3
        assert result.character_name == "さくや"
        assert result.mode == "normal"  # デフォルト値
        assert result.is_cleared is False  # デフォルト値
        self.mock_repository.create.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_update_clear_record_success(self):
        """クリア記録更新成功のテスト"""
        self.mock_repository.find_by_id = AsyncMock(return_value=self.sample_record)
        
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
        self.mock_repository.update = AsyncMock(return_value=updated_record)
        
        update_data = {
            'is_no_continue_clear': True,
            'is_cleared': True
        }
        
        result = await self.service.update_clear_record(1, 1, update_data)
        
        assert result is not None
        assert result.is_no_continue_clear is True
        self.mock_repository.find_by_id.assert_called_once_with(1)
        self.mock_repository.update.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_update_clear_record_not_found(self):
        """クリア記録更新（記録なし）のテスト"""
        self.mock_repository.find_by_id = AsyncMock(return_value=None)
        
        update_data = {'is_cleared': True}
        
        result = await self.service.update_clear_record(999, 1, update_data)
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(999)
        self.mock_repository.update.assert_not_called()
        
    @pytest.mark.asyncio
    async def test_update_clear_record_unauthorized(self):
        """クリア記録更新（権限なし）のテスト"""
        # 他のユーザーの記録
        other_user_record = ClearRecord(
            id=1,
            user_id=2,  # 異なるユーザーID
            game_id=1,
            character_name="霊夢",
            difficulty="Easy"
        )
        self.mock_repository.find_by_id = AsyncMock(return_value=other_user_record)
        
        update_data = {'is_cleared': True}
        
        result = await self.service.update_clear_record(1, 1, update_data)  # user_id=1で更新試行
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(1)
        self.mock_repository.update.assert_not_called()
        
    @pytest.mark.asyncio
    async def test_delete_clear_record_success(self):
        """クリア記録削除成功のテスト"""
        self.mock_repository.find_by_id = AsyncMock(return_value=self.sample_record)
        self.mock_repository.delete = AsyncMock(return_value=True)
        
        result = await self.service.delete_clear_record(1, 1)
        
        assert result is True
        self.mock_repository.find_by_id.assert_called_once_with(1)
        self.mock_repository.delete.assert_called_once_with(1)
        
    @pytest.mark.asyncio
    async def test_delete_clear_record_not_found(self):
        """クリア記録削除（記録なし）のテスト"""
        self.mock_repository.find_by_id = AsyncMock(return_value=None)
        
        result = await self.service.delete_clear_record(999, 1)
        
        assert result is False
        self.mock_repository.find_by_id.assert_called_once_with(999)
        self.mock_repository.delete.assert_not_called()
        
    @pytest.mark.asyncio
    async def test_delete_clear_record_unauthorized(self):
        """クリア記録削除（権限なし）のテスト"""
        other_user_record = ClearRecord(
            id=1,
            user_id=2,  # 異なるユーザーID
            game_id=1,
            character_name="霊夢",
            difficulty="Easy"
        )
        self.mock_repository.find_by_id = AsyncMock(return_value=other_user_record)
        
        result = await self.service.delete_clear_record(1, 1)  # user_id=1で削除試行
        
        assert result is False
        self.mock_repository.find_by_id.assert_called_once_with(1)
        self.mock_repository.delete.assert_not_called()
        
    @pytest.mark.asyncio
    async def test_create_or_update_clear_record(self):
        """クリア記録作成または更新のテスト"""
        created_record = ClearRecord(
            id=2,
            user_id=1,
            game_id=1,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True
        )
        self.mock_repository.create_or_update = AsyncMock(return_value=created_record)
        
        result = await self.service.create_or_update_clear_record(1, self.sample_create_data)
        
        assert result.id == 2
        assert result.character_name == "魔理沙"
        self.mock_repository.create_or_update.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_create_or_update_clear_record_exception(self):
        """クリア記録作成または更新（例外）のテスト"""
        self.mock_repository.create_or_update = AsyncMock(side_effect=Exception("Database error"))
        
        with pytest.raises(Exception, match="Database error"):
            await self.service.create_or_update_clear_record(1, self.sample_create_data)
            
    @pytest.mark.asyncio
    async def test_upsert_clear_record(self):
        """クリア記録Upsertのテスト"""
        created_record = ClearRecord(
            id=2,
            user_id=1,
            game_id=1,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True
        )
        self.mock_repository.create_or_update = AsyncMock(return_value=created_record)
        
        result = await self.service.upsert_clear_record(1, self.sample_create_data)
        
        assert result.id == 2
        assert result.character_name == "魔理沙"
        self.mock_repository.create_or_update.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_batch_create_or_update_records(self):
        """一括クリア記録作成または更新のテスト"""
        record1 = ClearRecord(id=1, user_id=1, game_id=1, character_name="霊夢", difficulty="Easy", is_cleared=True)
        record2 = ClearRecord(id=2, user_id=1, game_id=1, character_name="魔理沙", difficulty="Normal", is_cleared=True)
        
        self.mock_repository.create_or_update = AsyncMock(side_effect=[record1, record2])
        
        records_data = [
            {'game_id': 1, 'character_name': '霊夢', 'difficulty': 'Easy', 'is_cleared': True},
            {'game_id': 1, 'character_name': '魔理沙', 'difficulty': 'Normal', 'is_cleared': True}
        ]
        
        result = await self.service.batch_create_or_update_records(1, records_data)
        
        assert len(result) == 2
        assert result[0].character_name == "霊夢"
        assert result[1].character_name == "魔理沙"
        assert self.mock_repository.create_or_update.call_count == 2
        
    @pytest.mark.asyncio
    async def test_batch_create_or_update_records_empty(self):
        """一括クリア記録作成または更新（空リスト）のテスト"""
        result = await self.service.batch_create_or_update_records(1, [])
        
        assert len(result) == 0
        self.mock_repository.create_or_update.assert_not_called()
        
    @pytest.mark.asyncio
    async def test_batch_create_or_update_records_exception(self):
        """一括クリア記録作成または更新（例外）のテスト"""
        self.mock_repository.create_or_update = AsyncMock(side_effect=Exception("Database error"))
        
        records_data = [
            {'game_id': 1, 'character_name': '霊夢', 'difficulty': 'Easy', 'is_cleared': True}
        ]
        
        with pytest.raises(Exception, match="Database error"):
            await self.service.batch_create_or_update_records(1, records_data)
            
    @pytest.mark.asyncio
    async def test_batch_upsert_clear_records(self):
        """一括クリア記録Upsertのテスト"""
        record1 = ClearRecord(id=1, user_id=1, game_id=1, character_name="霊夢", difficulty="Easy", is_cleared=True)
        record2 = ClearRecord(id=2, user_id=1, game_id=1, character_name="魔理沙", difficulty="Normal", is_cleared=True)
        
        self.mock_repository.create_or_update = AsyncMock(side_effect=[record1, record2])
        
        records_data = [
            {'game_id': 1, 'character_name': '霊夢', 'difficulty': 'Easy', 'is_cleared': True},
            {'game_id': 1, 'character_name': '魔理沙', 'difficulty': 'Normal', 'is_cleared': True}
        ]
        
        result = await self.service.batch_upsert_clear_records(1, records_data)
        
        assert len(result) == 2
        assert result[0].character_name == "霊夢"
        assert result[1].character_name == "魔理沙"
        assert self.mock_repository.create_or_update.call_count == 2