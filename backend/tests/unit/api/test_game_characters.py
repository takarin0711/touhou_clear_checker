"""
ゲーム機体APIの単体テスト
"""
import pytest
from datetime import datetime
from unittest.mock import Mock
from fastapi import HTTPException, status
from presentation.api.v1.game_characters import (
    get_game_characters,
    get_game_character_by_id,
    create_game_character,
    update_game_character,
    delete_game_character,
    get_game_character_count
)
from domain.entities.user import User
from application.dtos.game_character_dto import (
    GameCharacterDto,
    GameCharacterListDto
)
from presentation.schemas.game_character_schema import (
    GameCharacterCreate,
    GameCharacterUpdate
)


class TestGameCharactersAPI:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_service = Mock()
        
        # サンプルユーザー
        self.sample_user = User(
            id=1,
            username="test_user",
            email="test@example.com",
            hashed_password="hashed_password",
            email_verified=True,
            is_admin=True
        )
        
        # サンプルゲーム機体DTO
        self.sample_character_dto = GameCharacterDto(
            id=1,
            game_id=1,
            character_name="霊夢",
            description="博麗の巫女",
            sort_order=1,
            created_at=datetime(2023, 1, 1)
        )
        
        self.sample_character_dto_2 = GameCharacterDto(
            id=2,
            game_id=1,
            character_name="魔理沙",
            description="普通の魔法使い",
            sort_order=2,
            created_at=datetime(2023, 1, 2)
        )

    @pytest.mark.asyncio
    async def test_get_game_characters_success(self):
        """ゲーム機体一覧取得成功のテスト"""
        # Arrange
        list_dto = GameCharacterListDto(
            game_characters=[self.sample_character_dto, self.sample_character_dto_2],
            total_count=2
        )
        self.mock_service.get_characters_by_game_id.return_value = list_dto
        
        # Act
        result = await get_game_characters(
            game_id=1,
            service=self.mock_service
        )
        
        # Assert
        assert result.total_count == 2
        assert len(result.game_characters) == 2
        assert result.game_characters[0].id == 1
        assert result.game_characters[0].character_name == "霊夢"
        assert result.game_characters[1].id == 2
        assert result.game_characters[1].character_name == "魔理沙"
        self.mock_service.get_characters_by_game_id.assert_called_once_with(1)
    
    @pytest.mark.asyncio
    async def test_get_game_characters_exception(self):
        """ゲーム機体一覧取得での例外テスト"""
        # Arrange
        self.mock_service.get_characters_by_game_id.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_game_characters(
                game_id=1,
                service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "機体取得に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_get_game_character_by_id_success(self):
        """ID指定機体取得成功のテスト"""
        # Arrange
        self.mock_service.get_character_by_id.return_value = self.sample_character_dto
        
        # Act
        result = await get_game_character_by_id(
            character_id=1,
            service=self.mock_service
        )
        
        # Assert
        assert result.id == 1
        assert result.character_name == "霊夢"
        assert result.description == "博麗の巫女"
        assert result.game_id == 1
        assert result.sort_order == 1
        self.mock_service.get_character_by_id.assert_called_once_with(1)
    
    @pytest.mark.asyncio
    async def test_get_game_character_by_id_not_found(self):
        """ID指定機体取得での404エラーテスト"""
        # Arrange
        self.mock_service.get_character_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_game_character_by_id(
                character_id=999,
                service=self.mock_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "機体が見つかりません"
    
    @pytest.mark.asyncio
    async def test_get_game_character_by_id_exception(self):
        """ID指定機体取得での例外テスト"""
        # Arrange
        self.mock_service.get_character_by_id.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_game_character_by_id(
                character_id=1,
                service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "機体取得に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_create_game_character_success(self):
        """ゲーム機体作成成功のテスト"""
        # Arrange
        character_data = GameCharacterCreate(
            game_id=1,
            character_name="咲夜",
            description="十六夜咲夜",
            sort_order=3
        )
        new_character_dto = GameCharacterDto(
            id=3,
            game_id=1,
            character_name="咲夜",
            description="十六夜咲夜",
            sort_order=3,
            created_at=datetime(2023, 1, 3)
        )
        self.mock_service.create_character.return_value = new_character_dto
        
        # Act
        result = await create_game_character(
            game_id=1,
            character_data=character_data,
            service=self.mock_service,
            current_user=self.sample_user
        )
        
        # Assert
        assert result.id == 3
        assert result.character_name == "咲夜"
        assert result.description == "十六夜咲夜"
        assert result.game_id == 1
        assert result.sort_order == 3
        self.mock_service.create_character.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_game_character_duplicate_error(self):
        """ゲーム機体作成での重複エラーテスト"""
        # Arrange
        character_data = GameCharacterCreate(
            game_id=1,
            character_name="霊夢",
            description="重複機体",
            sort_order=1
        )
        self.mock_service.create_character.side_effect = ValueError("Character already exists")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_game_character(
                game_id=1,
                character_data=character_data,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "同じ名前の機体が既に存在します"
    
    @pytest.mark.asyncio
    async def test_create_game_character_value_error(self):
        """ゲーム機体作成での一般的なValueErrorテスト"""
        # Arrange
        character_data = GameCharacterCreate(
            game_id=1,
            character_name="無効機体",
            description="無効データ",
            sort_order=-1
        )
        self.mock_service.create_character.side_effect = ValueError("Invalid data")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_game_character(
                game_id=1,
                character_data=character_data,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Invalid data"
    
    @pytest.mark.asyncio
    async def test_create_game_character_exception(self):
        """ゲーム機体作成での例外テスト"""
        # Arrange
        character_data = GameCharacterCreate(
            game_id=1,
            character_name="エラー機体",
            description="システムエラー",
            sort_order=1
        )
        self.mock_service.create_character.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_game_character(
                game_id=1,
                character_data=character_data,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 500
        assert "機体作成に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_update_game_character_success(self):
        """ゲーム機体更新成功のテスト"""
        # Arrange
        character_data = GameCharacterUpdate(
            character_name="霊夢（更新）",
            description="博麗の巫女（更新）",
            sort_order=1
        )
        updated_character_dto = GameCharacterDto(
            id=1,
            game_id=1,
            character_name="霊夢（更新）",
            description="博麗の巫女（更新）",
            sort_order=1,
            created_at=datetime(2023, 1, 1)
        )
        self.mock_service.update_character.return_value = updated_character_dto
        
        # Act
        result = await update_game_character(
            character_id=1,
            character_data=character_data,
            service=self.mock_service,
            current_user=self.sample_user
        )
        
        # Assert
        assert result.id == 1
        assert result.character_name == "霊夢（更新）"
        assert result.description == "博麗の巫女（更新）"
        self.mock_service.update_character.assert_called_once()
        # 呼び出し引数を確認
        call_args = self.mock_service.update_character.call_args
        assert call_args[0][0] == 1  # character_id
    
    @pytest.mark.asyncio
    async def test_update_game_character_not_found(self):
        """ゲーム機体更新での404エラーテスト"""
        # Arrange
        character_data = GameCharacterUpdate(
            character_name="存在しない機体",
            description="更新失敗",
            sort_order=1
        )
        self.mock_service.update_character.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_game_character(
                character_id=999,
                character_data=character_data,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "機体が見つかりません"
    
    @pytest.mark.asyncio
    async def test_update_game_character_duplicate_error(self):
        """ゲーム機体更新での重複エラーテスト"""
        # Arrange
        character_data = GameCharacterUpdate(
            character_name="重複機体名",
            description="重複エラー",
            sort_order=1
        )
        self.mock_service.update_character.side_effect = ValueError("Character already exists")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_game_character(
                character_id=1,
                character_data=character_data,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "同じ名前の機体が既に存在します"
    
    @pytest.mark.asyncio
    async def test_delete_game_character_success(self):
        """ゲーム機体削除成功のテスト"""
        # Arrange
        self.mock_service.delete_character.return_value = True
        
        # Act
        result = await delete_game_character(
            character_id=1,
            service=self.mock_service,
            current_user=self.sample_user
        )
        
        # Assert
        assert result["message"] == "機体が削除されました"
        self.mock_service.delete_character.assert_called_once_with(1)
    
    @pytest.mark.asyncio
    async def test_delete_game_character_not_found(self):
        """ゲーム機体削除での404エラーテスト"""
        # Arrange
        self.mock_service.delete_character.return_value = False
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_game_character(
                character_id=999,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "機体が見つかりません"
    
    @pytest.mark.asyncio
    async def test_delete_game_character_exception(self):
        """ゲーム機体削除での例外テスト"""
        # Arrange
        self.mock_service.delete_character.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_game_character(
                character_id=1,
                service=self.mock_service,
                current_user=self.sample_user
            )
        
        assert exc_info.value.status_code == 500
        assert "機体削除に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_get_game_character_count_success(self):
        """ゲーム機体数取得成功のテスト"""
        # Arrange
        self.mock_service.get_character_count_by_game.return_value = 5
        
        # Act
        result = await get_game_character_count(
            game_id=1,
            service=self.mock_service
        )
        
        # Assert
        assert result["game_id"] == 1
        assert result["character_count"] == 5
        self.mock_service.get_character_count_by_game.assert_called_once_with(1)
    
    @pytest.mark.asyncio
    async def test_get_game_character_count_exception(self):
        """ゲーム機体数取得での例外テスト"""
        # Arrange
        self.mock_service.get_character_count_by_game.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_game_character_count(
                game_id=1,
                service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "機体数取得に失敗しました" in str(exc_info.value.detail)