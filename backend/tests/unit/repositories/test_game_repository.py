import pytest
from decimal import Decimal
from unittest.mock import Mock, MagicMock
from infrastructure.database.repositories.game_repository_impl import GameRepositoryImpl
from infrastructure.database.models.game_model import GameModel
from domain.entities.game import Game
from domain.value_objects.game_type import GameType

class TestGameRepository:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_session = Mock()
        self.repository = GameRepositoryImpl(self.mock_session)
        
        self.sample_model = GameModel(
            id=1,
            title="東方紅魔郷",
            series_number=6.0,
            release_year=2002,
            game_type="main_series"
        )
        
        self.sample_entity = Game(
            id=1,
            title="東方紅魔郷",
            series_number=Decimal("6.0"),
            release_year=2002,
            game_type=GameType.MAIN_SERIES
        )
        
    def test_find_all(self):
        """全ゲーム取得のテスト"""
        self.mock_session.query.return_value.all.return_value = [self.sample_model]
        
        result = self.repository.find_all()
        
        assert len(result) == 1
        assert result[0].title == "東方紅魔郷"
        assert result[0].series_number == Decimal("6.0")
        self.mock_session.query.assert_called_with(GameModel)
        
    def test_find_filtered_by_series_number(self):
        """シリーズ番号でフィルタリングされたゲーム取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.all.return_value = [self.sample_model]
        
        result = self.repository.find_filtered(series_number=Decimal("6.0"))
        
        assert len(result) == 1
        assert result[0].title == "東方紅魔郷"
        mock_query.filter.assert_called_once()
        
    def test_find_filtered_by_game_type(self):
        """ゲームタイプでフィルタリングされたゲーム取得のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.all.return_value = [self.sample_model]
        
        result = self.repository.find_filtered(game_type=GameType.MAIN_SERIES)
        
        assert len(result) == 1
        assert result[0].title == "東方紅魔郷"
        mock_query.filter.assert_called_once()
        
    def test_find_by_id_found(self):
        """ID指定でゲーム取得成功のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = self.repository.find_by_id(1)
        
        assert result is not None
        assert result.title == "東方紅魔郷"
        self.mock_session.query.assert_called_with(GameModel)
        
    def test_find_by_id_not_found(self):
        """ID指定でゲーム取得失敗のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        result = self.repository.find_by_id(999)
        
        assert result is None
        
    def test_save_new_game(self):
        """新規ゲーム保存のテスト"""
        new_game = Game(
            id=None,
            title="東方妖々夢",
            series_number=Decimal("7.0"),
            release_year=2003,
            game_type=GameType.MAIN_SERIES
        )
        
        saved_model = GameModel(
            id=2,
            title="東方妖々夢",
            series_number=7.0,
            release_year=2003,
            game_type="main_series"
        )
        
        # モックの設定
        self.mock_session.add = Mock()
        self.mock_session.commit = Mock()
        self.mock_session.refresh = Mock(side_effect=lambda model: setattr(model, 'id', 2))
        
        # refreshの後にモデルのIDが設定されるようにする
        def mock_refresh(model):
            model.id = 2
            model.title = "東方妖々夢"
            model.series_number = 7.0
            model.release_year = 2003
            model.game_type = "main_series"
        
        self.mock_session.refresh.side_effect = mock_refresh
        
        result = self.repository.save(new_game)
        
        assert result.id == 2
        assert result.title == "東方妖々夢"
        self.mock_session.add.assert_called_once()
        self.mock_session.commit.assert_called_once()
        
    def test_save_existing_game(self):
        """既存ゲーム更新のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        updated_game = Game(
            id=1,
            title="東方紅魔郷 (Updated)",
            series_number=Decimal("6.0"),
            release_year=2002,
            game_type=GameType.MAIN_SERIES
        )
        
        result = self.repository.save(updated_game)
        
        assert result.title == "東方紅魔郷 (Updated)"
        self.mock_session.commit.assert_called_once()
        
    def test_delete_existing_game(self):
        """存在するゲーム削除のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = self.sample_model
        
        result = self.repository.delete(1)
        
        assert result is True
        self.mock_session.delete.assert_called_once_with(self.sample_model)
        self.mock_session.commit.assert_called_once()
        
    def test_delete_nonexistent_game(self):
        """存在しないゲーム削除のテスト"""
        mock_query = Mock()
        self.mock_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        result = self.repository.delete(999)
        
        assert result is False
        self.mock_session.delete.assert_not_called()
        
    def test_to_entity_conversion(self):
        """モデルからエンティティへの変換テスト"""
        model = GameModel(
            id=1,
            title="東方花映塚",
            series_number=9.5,
            release_year=2005,
            game_type="fighting"
        )
        
        entity = self.repository._to_entity(model)
        
        assert entity.id == 1
        assert entity.title == "東方花映塚"
        assert entity.series_number == Decimal("9.5")
        assert entity.release_year == 2005
        assert entity.game_type == GameType.FIGHTING
        
    def test_to_entity_without_game_type(self):
        """game_typeが未設定のモデルからエンティティへの変換テスト"""
        model = GameModel(
            id=1,
            title="東方紅魔郷",
            series_number=6.0,
            release_year=2002
        )
        # game_typeを意図的に未設定
        
        entity = self.repository._to_entity(model)
        
        assert entity.game_type == GameType.MAIN_SERIES  # デフォルト値