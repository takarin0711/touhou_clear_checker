"""
ゲームAPIの単体テスト
"""
import pytest
from decimal import Decimal
from unittest.mock import Mock, AsyncMock
from fastapi import HTTPException, status
from presentation.api.v1.games import get_games
from domain.entities.game import Game
from domain.value_objects.game_type import GameType
from application.dtos.game_dto import GameDto


class TestGamesAPI:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_game_service = Mock()
        
        # サンプルゲームDTO
        self.sample_game_dto = GameDto(
            id=1,
            title="東方紅魔郷",
            series_number=Decimal("6"),
            release_year=2002,
            game_type=GameType.MAIN_SERIES
        )
        
        self.sample_game_dto_2 = GameDto(
            id=2,
            title="東方妖々夢",
            series_number=Decimal("7"),
            release_year=2003,
            game_type=GameType.MAIN_SERIES
        )

    @pytest.mark.asyncio
    async def test_get_games_all(self):
        """全ゲーム一覧取得のテスト"""
        # Arrange
        self.mock_game_service.get_all_games.return_value = [
            self.sample_game_dto,
            self.sample_game_dto_2
        ]
        
        # Act
        result = await get_games(
            series_number=None,
            game_type=None,
            game_service=self.mock_game_service
        )
        
        # Assert
        assert len(result) == 2
        assert result[0].id == 1
        assert result[0].title == "東方紅魔郷"
        assert result[0].series_number == Decimal("6")
        assert result[0].release_year == 2002
        assert result[0].game_type == GameType.MAIN_SERIES.value
        assert result[1].id == 2
        assert result[1].title == "東方妖々夢"
        self.mock_game_service.get_all_games.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_games_filtered_by_series_number(self):
        """シリーズ番号フィルタでのゲーム一覧取得テスト"""
        # Arrange
        self.mock_game_service.get_games_filtered.return_value = [self.sample_game_dto]
        
        # Act
        result = await get_games(
            series_number=Decimal("6"),
            game_type=None,
            game_service=self.mock_game_service
        )
        
        # Assert
        assert len(result) == 1
        assert result[0].title == "東方紅魔郷"
        assert result[0].series_number == Decimal("6")
        self.mock_game_service.get_games_filtered.assert_called_once_with(
            series_number=Decimal("6"),
            game_type=None
        )
    
    @pytest.mark.asyncio
    async def test_get_games_filtered_by_game_type(self):
        """ゲームタイプフィルタでのゲーム一覧取得テスト"""
        # Arrange
        self.mock_game_service.get_games_filtered.return_value = [self.sample_game_dto]
        
        # Act
        result = await get_games(
            series_number=None,
            game_type="main_series",
            game_service=self.mock_game_service
        )
        
        # Assert
        assert len(result) == 1
        assert result[0].game_type == GameType.MAIN_SERIES.value
        self.mock_game_service.get_games_filtered.assert_called_once_with(
            series_number=None,
            game_type=GameType.MAIN_SERIES
        )
    
    @pytest.mark.asyncio
    async def test_get_games_filtered_by_both(self):
        """シリーズ番号とゲームタイプ両方のフィルタテスト"""
        # Arrange
        self.mock_game_service.get_games_filtered.return_value = [self.sample_game_dto]
        
        # Act
        result = await get_games(
            series_number=Decimal("6"),
            game_type="main_series",
            game_service=self.mock_game_service
        )
        
        # Assert
        assert len(result) == 1
        self.mock_game_service.get_games_filtered.assert_called_once_with(
            series_number=Decimal("6"),
            game_type=GameType.MAIN_SERIES
        )
    
    @pytest.mark.asyncio
    async def test_get_games_invalid_game_type(self):
        """無効なゲームタイプでの400エラーテスト"""
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_games(
                series_number=None,
                game_type="invalid_type",
                game_service=self.mock_game_service
            )
        
        assert exc_info.value.status_code == 400
        assert "Invalid game_type" in str(exc_info.value.detail)
        assert "Valid values:" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_get_games_empty_result(self):
        """空の結果での正常動作テスト"""
        # Arrange
        self.mock_game_service.get_all_games.return_value = []
        
        # Act
        result = await get_games(
            series_number=None,
            game_type=None,
            game_service=self.mock_game_service
        )
        
        # Assert
        assert len(result) == 0
        assert result == []
        self.mock_game_service.get_all_games.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_games_dto_without_game_type(self):
        """game_type属性のないDTOのフォールバックテスト"""
        # Arrange
        dto_without_game_type = Mock()
        dto_without_game_type.id = 1
        dto_without_game_type.title = "テストゲーム"
        dto_without_game_type.series_number = Decimal("1")
        dto_without_game_type.release_year = 2000
        # game_type属性を持たないDTO
        del dto_without_game_type.game_type
        
        self.mock_game_service.get_all_games.return_value = [dto_without_game_type]
        
        # Act
        result = await get_games(
            series_number=None,
            game_type=None,
            game_service=self.mock_game_service
        )
        
        # Assert
        assert len(result) == 1
        assert result[0].game_type == 'main_series'  # デフォルト値