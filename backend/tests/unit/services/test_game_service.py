import pytest
from decimal import Decimal
from unittest.mock import Mock
from application.services.game_service import GameService
from application.dtos.game_dto import CreateGameDto, UpdateGameDto
from domain.entities.game import Game
from domain.value_objects.game_type import GameType

class TestGameService:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_repository = Mock()
        self.service = GameService(self.mock_repository)
        
        self.sample_game = Game(
            id=1,
            title="東方紅魔郷",
            series_number=Decimal("6.0"),
            release_year=2002,
            game_type=GameType.MAIN_SERIES
        )
        
    def test_get_all_games(self):
        """全ゲーム取得のテスト"""
        self.mock_repository.find_all.return_value = [self.sample_game]
        
        result = self.service.get_all_games()
        
        assert len(result) == 1
        assert result[0].title == "東方紅魔郷"
        assert result[0].series_number == Decimal("6.0")
        assert result[0].game_type == "main_series"
        self.mock_repository.find_all.assert_called_once()
        
    def test_get_games_filtered(self):
        """フィルタリングされたゲーム取得のテスト"""
        self.mock_repository.find_filtered.return_value = [self.sample_game]
        
        result = self.service.get_games_filtered(
            series_number=Decimal("6.0"),
            game_type=GameType.MAIN_SERIES
        )
        
        assert len(result) == 1
        assert result[0].title == "東方紅魔郷"
        self.mock_repository.find_filtered.assert_called_once_with(
            series_number=Decimal("6.0"),
            game_type=GameType.MAIN_SERIES
        )
        
    def test_get_game_by_id_found(self):
        """ID指定でゲーム取得成功のテスト"""
        self.mock_repository.find_by_id.return_value = self.sample_game
        
        result = self.service.get_game_by_id(1)
        
        assert result is not None
        assert result.title == "東方紅魔郷"
        self.mock_repository.find_by_id.assert_called_once_with(1)
        
    def test_get_game_by_id_not_found(self):
        """ID指定でゲーム取得失敗のテスト"""
        self.mock_repository.find_by_id.return_value = None
        
        result = self.service.get_game_by_id(999)
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(999)
        
    def test_create_game(self):
        """ゲーム作成のテスト"""
        create_dto = CreateGameDto(
            title="東方妖々夢",
            series_number=Decimal("7.0"),
            release_year=2003,
            game_type="main_series"
        )
        
        created_game = Game(
            id=2,
            title="東方妖々夢",
            series_number=Decimal("7.0"),
            release_year=2003,
            game_type=GameType.MAIN_SERIES
        )
        self.mock_repository.save.return_value = created_game
        
        result = self.service.create_game(create_dto)
        
        assert result.id == 2
        assert result.title == "東方妖々夢"
        assert result.series_number == Decimal("7.0")
        self.mock_repository.save.assert_called_once()
        
    def test_update_game_success(self):
        """ゲーム更新成功のテスト"""
        self.mock_repository.find_by_id.return_value = self.sample_game
        
        update_dto = UpdateGameDto(
            title="東方紅魔郷 (Updated)",
            series_number=Decimal("6.0"),
            release_year=2002,
            game_type="main_series"
        )
        
        updated_game = Game(
            id=1,
            title="東方紅魔郷 (Updated)",
            series_number=Decimal("6.0"),
            release_year=2002,
            game_type=GameType.MAIN_SERIES
        )
        self.mock_repository.save.return_value = updated_game
        
        result = self.service.update_game(1, update_dto)
        
        assert result is not None
        assert result.title == "東方紅魔郷 (Updated)"
        self.mock_repository.find_by_id.assert_called_once_with(1)
        self.mock_repository.save.assert_called_once()
        
    def test_update_game_not_found(self):
        """存在しないゲーム更新のテスト"""
        self.mock_repository.find_by_id.return_value = None
        
        update_dto = UpdateGameDto(
            title="Test Game",
            series_number=Decimal("1.0"),
            release_year=2023,
            game_type="main_series"
        )
        
        result = self.service.update_game(999, update_dto)
        
        assert result is None
        self.mock_repository.find_by_id.assert_called_once_with(999)
        self.mock_repository.save.assert_not_called()
        
    def test_delete_game_success(self):
        """ゲーム削除成功のテスト"""
        self.mock_repository.delete.return_value = True
        
        result = self.service.delete_game(1)
        
        assert result is True
        self.mock_repository.delete.assert_called_once_with(1)
        
    def test_delete_game_failure(self):
        """ゲーム削除失敗のテスト"""
        self.mock_repository.delete.return_value = False
        
        result = self.service.delete_game(999)
        
        assert result is False
        self.mock_repository.delete.assert_called_once_with(999)
        
    def test_to_dto_conversion(self):
        """エンティティからDTOへの変換テスト"""
        game = Game(
            id=1,
            title="東方花映塚",
            series_number=Decimal("9.5"),
            release_year=2005,
            game_type=GameType.FIGHTING
        )
        
        dto = self.service._to_dto(game)
        
        assert dto.id == 1
        assert dto.title == "東方花映塚"
        assert dto.series_number == Decimal("9.5")
        assert dto.release_year == 2005
        assert dto.game_type == "fighting"