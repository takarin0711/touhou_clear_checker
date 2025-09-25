import pytest
from datetime import datetime
from unittest.mock import Mock
from application.services.game_character_service import GameCharacterService
from application.dtos.game_character_dto import CreateGameCharacterDto, UpdateGameCharacterDto
from domain.entities.game_character import GameCharacter


class TestGameCharacterService:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_repository = Mock()
        self.service = GameCharacterService(self.mock_repository)
        
        self.sample_character = GameCharacter(
            id=1,
            game_id=1,
            character_name="霊夢",
            description="博麗神社の巫女",
            sort_order=0,
            created_at=datetime(2023, 1, 1, 0, 0, 0)
        )
        
    def test_get_characters_by_game_id(self):
        """ゲームID指定で機体一覧取得のテスト"""
        self.mock_repository.find_by_game_id.return_value = [self.sample_character]
        
        result = self.service.get_characters_by_game_id(1)
        
        assert result.total_count == 1
        assert len(result.game_characters) == 1
        assert result.game_characters[0].character_name == "霊夢"
        assert result.game_characters[0].game_id == 1
        self.mock_repository.find_by_game_id.assert_called_once_with(1)
        
    def test_get_character_by_id_found(self):
        """ID指定で機体取得成功のテスト"""
        self.mock_repository.find_by_id.return_value = self.sample_character
        
        result = self.service.get_character_by_id(1)
        
        assert result is not None
        assert result.character_name == "霊夢"
        assert result.game_id == 1
        self.mock_repository.find_by_id.assert_called_once_with(1)
        
    def test_get_character_by_id_not_found(self):
        """ID指定で機体取得失敗のテスト"""
        self.mock_repository.find_by_id.return_value = None
        
        result = self.service.get_character_by_id(999)
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(999)
        
    def test_get_character_by_game_and_name_found(self):
        """ゲームIDと名前指定で機体取得成功のテスト"""
        self.mock_repository.find_by_game_and_name.return_value = self.sample_character
        
        result = self.service.get_character_by_game_and_name(1, "霊夢")
        
        assert result is not None
        assert result.character_name == "霊夢"
        assert result.game_id == 1
        self.mock_repository.find_by_game_and_name.assert_called_once_with(1, "霊夢")
        
    def test_get_character_by_game_and_name_not_found(self):
        """ゲームIDと名前指定で機体取得失敗のテスト"""
        self.mock_repository.find_by_game_and_name.return_value = None
        
        result = self.service.get_character_by_game_and_name(1, "存在しない機体")
        
        assert result is None
        self.mock_repository.find_by_game_and_name.assert_called_once_with(1, "存在しない機体")
        
    def test_create_character_success(self):
        """機体作成成功のテスト"""
        create_dto = CreateGameCharacterDto(
            game_id=1,
            character_name="魔理沙",
            description="普通の魔法使い",
            sort_order=1
        )
        
        # 重複チェック
        self.mock_repository.find_by_game_and_name.return_value = None
        
        created_character = GameCharacter(
            id=2,
            game_id=1,
            character_name="魔理沙",
            description="普通の魔法使い",
            sort_order=1,
            created_at=datetime.now()
        )
        self.mock_repository.save.return_value = created_character
        
        result = self.service.create_character(create_dto)
        
        assert result.id == 2
        assert result.character_name == "魔理沙"
        assert result.game_id == 1
        self.mock_repository.find_by_game_and_name.assert_called_once_with(1, "魔理沙")
        self.mock_repository.save.assert_called_once()
        
    def test_create_character_duplicate_error(self):
        """機体作成時の重複エラーテスト"""
        create_dto = CreateGameCharacterDto(
            game_id=1,
            character_name="霊夢",
            description="重複テスト",
            sort_order=0
        )
        
        # 既に存在する機体を返す
        self.mock_repository.find_by_game_and_name.return_value = self.sample_character
        
        with pytest.raises(ValueError) as exc_info:
            self.service.create_character(create_dto)
        
        assert "already exists" in str(exc_info.value)
        self.mock_repository.find_by_game_and_name.assert_called_once_with(1, "霊夢")
        self.mock_repository.save.assert_not_called()
        
    def test_create_character_invalid_data(self):
        """機体作成時の無効データエラーテスト"""
        create_dto = CreateGameCharacterDto(
            game_id=0,  # 無効なゲームID
            character_name="",  # 空の名前
            description="テスト",
            sort_order=0
        )
        
        self.mock_repository.find_by_game_and_name.return_value = None
        
        with pytest.raises(ValueError) as exc_info:
            self.service.create_character(create_dto)
        
        assert "Invalid game character data" in str(exc_info.value)
        self.mock_repository.save.assert_not_called()
        
    def test_update_character_success(self):
        """機体更新成功のテスト"""
        self.mock_repository.find_by_id.return_value = self.sample_character
        self.mock_repository.find_by_game_and_name.return_value = None  # 重複なし
        
        update_dto = UpdateGameCharacterDto(
            character_name="霊夢 (Updated)",
            description="更新されたキャラクター",
            sort_order=1
        )
        
        updated_character = GameCharacter(
            id=1,
            game_id=1,
            character_name="霊夢 (Updated)",
            description="更新されたキャラクター",
            sort_order=1,
            created_at=self.sample_character.created_at
        )
        self.mock_repository.save.return_value = updated_character
        
        result = self.service.update_character(1, update_dto)
        
        assert result is not None
        assert result.character_name == "霊夢 (Updated)"
        assert result.description == "更新されたキャラクター"
        self.mock_repository.find_by_id.assert_called_once_with(1)
        self.mock_repository.save.assert_called_once()
        
    def test_update_character_not_found(self):
        """存在しない機体更新のテスト"""
        self.mock_repository.find_by_id.return_value = None
        
        update_dto = UpdateGameCharacterDto(
            character_name="存在しない",
            description="テスト",
            sort_order=0
        )
        
        result = self.service.update_character(999, update_dto)
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(999)
        self.mock_repository.save.assert_not_called()
        
    def test_update_character_duplicate_name(self):
        """機体更新時の名前重複エラーテスト"""
        existing_character = GameCharacter(
            id=1,
            game_id=1,
            character_name="霊夢",
            description="テスト",
            sort_order=0
        )
        self.mock_repository.find_by_id.return_value = existing_character
        
        # 別の機体が同じ名前を使用中
        duplicate_character = GameCharacter(
            id=2,
            game_id=1,
            character_name="魔理沙",
            description="別の機体",
            sort_order=1
        )
        self.mock_repository.find_by_game_and_name.return_value = duplicate_character
        
        update_dto = UpdateGameCharacterDto(
            character_name="魔理沙",  # 重複する名前
            description="更新テスト",
            sort_order=0
        )
        
        with pytest.raises(ValueError) as exc_info:
            self.service.update_character(1, update_dto)
        
        assert "already exists" in str(exc_info.value)
        self.mock_repository.save.assert_not_called()
        
    def test_update_character_same_name_no_duplicate(self):
        """機体更新時の同じ名前維持（重複エラーなし）テスト"""
        self.mock_repository.find_by_id.return_value = self.sample_character
        # 同じ機体が見つかる（重複ではない）
        self.mock_repository.find_by_game_and_name.return_value = self.sample_character
        
        update_dto = UpdateGameCharacterDto(
            character_name="霊夢",  # 同じ名前
            description="更新された説明",
            sort_order=0
        )
        
        updated_character = GameCharacter(
            id=1,
            game_id=1,
            character_name="霊夢",
            description="更新された説明",
            sort_order=0,
            created_at=self.sample_character.created_at
        )
        self.mock_repository.save.return_value = updated_character
        
        result = self.service.update_character(1, update_dto)
        
        assert result is not None
        assert result.description == "更新された説明"
        self.mock_repository.save.assert_called_once()
        
    def test_delete_character_success(self):
        """機体削除成功のテスト"""
        self.mock_repository.delete.return_value = True
        
        result = self.service.delete_character(1)
        
        assert result is True
        self.mock_repository.delete.assert_called_once_with(1)
        
    def test_delete_character_failure(self):
        """機体削除失敗のテスト"""
        self.mock_repository.delete.return_value = False
        
        result = self.service.delete_character(999)
        
        assert result is False
        self.mock_repository.delete.assert_called_once_with(999)
        
    def test_get_character_count_by_game(self):
        """ゲーム別機体数取得のテスト"""
        self.mock_repository.get_character_count_by_game.return_value = 5
        
        result = self.service.get_character_count_by_game(1)
        
        assert result == 5
        self.mock_repository.get_character_count_by_game.assert_called_once_with(1)
        
    def test_to_dto_conversion(self):
        """エンティティからDTOへの変換テスト"""
        character = GameCharacter(
            id=10,
            game_id=2,
            character_name="咲夜",
            description="完璧で瀟洒なメイド",
            sort_order=3,
            created_at=datetime(2023, 5, 15, 10, 30, 0)
        )
        
        dto = self.service._to_dto(character)
        
        assert dto.id == 10
        assert dto.game_id == 2
        assert dto.character_name == "咲夜"
        assert dto.description == "完璧で瀟洒なメイド"
        assert dto.sort_order == 3
        assert dto.created_at == datetime(2023, 5, 15, 10, 30, 0)