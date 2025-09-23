"""
クリア記録リポジトリの単体テスト
"""
import pytest
from datetime import datetime, date
from unittest.mock import Mock, MagicMock, AsyncMock
from infrastructure.database.repositories.clear_record_repository_impl import ClearRecordRepositoryImpl
from infrastructure.database.models.clear_record_model import ClearRecordModel
from domain.entities.clear_record import ClearRecord


class TestClearRecordRepository:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_session = Mock()
        self.repository = ClearRecordRepositoryImpl(self.mock_session)
        
        # サンプルモデル
        self.sample_model = ClearRecordModel(
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
        
        # サンプルエンティティ
        self.sample_entity = ClearRecord(
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
        
        # モデルのto_entityメソッドをモック化
        self.sample_model.to_entity = Mock(return_value=self.sample_entity)
        
    @pytest.mark.asyncio
    async def test_find_all(self):
        """全クリア記録取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.order_by.return_value.all.return_value = [self.sample_model]
        
        result = await self.repository.find_all()
        
        assert len(result) == 1
        assert result[0].character_name == "霊夢"
        assert result[0].is_cleared is True
        self.mock_session.query.assert_called_with(ClearRecordModel)
        
    @pytest.mark.asyncio
    async def test_find_by_id_found(self):
        """ID指定でクリア記録取得成功のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = await self.repository.find_by_id(1)
        
        assert result is not None
        assert result.character_name == "霊夢"
        self.mock_session.query.assert_called_with(ClearRecordModel)
        
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self):
        """ID指定でクリア記録取得失敗のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        result = await self.repository.find_by_id(999)
        
        assert result is None
        
    @pytest.mark.asyncio
    async def test_find_by_user_id(self):
        """ユーザーID指定でクリア記録取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.order_by.return_value.all.return_value = [self.sample_model]
        
        result = await self.repository.find_by_user_id(1)
        
        assert len(result) == 1
        assert result[0].user_id == 1
        mock_query.filter.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_find_by_game_id(self):
        """ゲームID指定でクリア記録取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.order_by.return_value.all.return_value = [self.sample_model]
        
        result = await self.repository.find_by_game_id(1)
        
        assert len(result) == 1
        assert result[0].game_id == 1
        mock_query.filter.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_find_by_user_and_game(self):
        """ユーザー・ゲーム指定でクリア記録取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.order_by.return_value.all.return_value = [self.sample_model]
        
        result = await self.repository.find_by_user_and_game(1, 1)
        
        assert len(result) == 1
        assert result[0].user_id == 1
        assert result[0].game_id == 1
        mock_query.filter.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_find_by_user_game_character_difficulty(self):
        """ユーザー・ゲーム・キャラ・難易度指定でクリア記録取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = await self.repository.find_by_user_game_character_difficulty(1, 1, "霊夢", "Easy")
        
        assert result is not None
        assert result.character_name == "霊夢"
        assert result.difficulty == "Easy"
        mock_query.filter.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_find_by_user_game_character_difficulty_mode(self):
        """ユーザー・ゲーム・キャラ・難易度・モード指定でクリア記録取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = await self.repository.find_by_user_game_character_difficulty_mode(1, 1, "霊夢", "Easy", "normal")
        
        assert result is not None
        assert result.character_name == "霊夢"
        assert result.mode == "normal"
        mock_query.filter.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_create_new_record(self):
        """新規クリア記録作成のテスト"""
        new_record = ClearRecord(
            id=None,
            user_id=2,
            game_id=2,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True
        )
        
        # モックの設定
        mock_model = Mock()
        mock_model.to_entity.return_value = ClearRecord(
            id=2,
            user_id=2,
            game_id=2,
            character_name="魔理沙",
            difficulty="Normal",
            mode="normal",
            is_cleared=True
        )
        
        # ClearRecordModel.from_entityをモック化
        with pytest.MonkeyPatch.context() as m:
            m.setattr(ClearRecordModel, 'from_entity', lambda entity: mock_model)
            
            self.mock_session.add = Mock()
            self.mock_session.commit = Mock()
            self.mock_session.refresh = Mock()
            
            result = await self.repository.create(new_record)
            
            assert result.id == 2
            assert result.character_name == "魔理沙"
            self.mock_session.add.assert_called_once()
            self.mock_session.commit.assert_called_once()
            
    @pytest.mark.asyncio
    async def test_update_existing_record(self):
        """既存クリア記録更新のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
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
        
        result = await self.repository.update(updated_record)
        
        assert result.character_name == "霊夢"
        self.mock_session.commit.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_update_nonexistent_record(self):
        """存在しないクリア記録更新のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        updated_record = ClearRecord(id=999)
        
        with pytest.raises(ValueError, match="Clear record with id 999 not found"):
            await self.repository.update(updated_record)
            
    @pytest.mark.asyncio
    async def test_delete_existing_record(self):
        """存在するクリア記録削除のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = await self.repository.delete(1)
        
        assert result is True
        self.mock_session.delete.assert_called_once_with(self.sample_model)
        self.mock_session.commit.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_delete_nonexistent_record(self):
        """存在しないクリア記録削除のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        result = await self.repository.delete(999)
        
        assert result is False
        self.mock_session.delete.assert_not_called()
        
    @pytest.mark.asyncio
    async def test_exists_true(self):
        """クリア記録存在チェック（存在する場合）のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = await self.repository.exists(1)
        
        assert result is True
        
    @pytest.mark.asyncio
    async def test_exists_false(self):
        """クリア記録存在チェック（存在しない場合）のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        result = await self.repository.exists(999)
        
        assert result is False
        
    @pytest.mark.asyncio
    async def test_create_or_update_existing_record(self):
        """既存記録のcreate_or_update（更新）のテスト"""
        # find_by_user_game_character_difficulty_modeが既存記録を返すようにモック
        self.repository.find_by_user_game_character_difficulty_mode = AsyncMock(return_value=self.sample_entity)
        self.repository.update = AsyncMock(return_value=self.sample_entity)
        
        record = ClearRecord(
            user_id=1,
            game_id=1,
            character_name="霊夢",
            difficulty="Easy",
            mode="normal",
            is_no_continue_clear=True
        )
        
        result = await self.repository.create_or_update(record)
        
        assert result.character_name == "霊夢"
        self.repository.update.assert_called_once()
        
    @pytest.mark.asyncio
    async def test_create_or_update_new_record(self):
        """新規記録のcreate_or_update（作成）のテスト"""
        # find_by_user_game_character_difficulty_modeが記録なしを返すようにモック
        self.repository.find_by_user_game_character_difficulty_mode = AsyncMock(return_value=None)
        self.repository.create = AsyncMock(return_value=self.sample_entity)
        
        record = ClearRecord(
            user_id=1,
            game_id=1,
            character_name="霊夢",
            difficulty="Easy",
            mode="normal",
            is_cleared=True
        )
        
        result = await self.repository.create_or_update(record)
        
        assert result.character_name == "霊夢"
        self.repository.create.assert_called_once()