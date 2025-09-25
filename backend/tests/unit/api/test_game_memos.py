"""
ゲームメモAPIの単体テスト
"""
import pytest
from datetime import datetime
from unittest.mock import Mock, AsyncMock
from fastapi import HTTPException, status
from presentation.api.v1.game_memos import (
    get_my_game_memos,
    get_game_memo,
    create_game_memo,
    update_game_memo,
    delete_game_memo,
    create_or_update_game_memo,
    GameMemoRequest
)
from domain.entities.user import User
from domain.entities.game_memo import GameMemo


class TestGameMemosAPI:
    
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
            is_active=True
        )
        
        # サンプルゲームメモ
        self.sample_memo = GameMemo(
            id=1,
            user_id=1,
            game_id=1,
            memo="テストメモ",
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1)
        )
        
        self.sample_memo_2 = GameMemo(
            id=2,
            user_id=1,
            game_id=2,
            memo="テストメモ2",
            created_at=datetime(2023, 1, 2),
            updated_at=datetime(2023, 1, 2)
        )
        
        # Asyncメソッドをモック化
        self.mock_service.get_user_memos = AsyncMock()
        self.mock_service.get_user_game_memo = AsyncMock()
        self.mock_service.create_game_memo = AsyncMock()
        self.mock_service.update_game_memo = AsyncMock()
        self.mock_service.delete_game_memo = AsyncMock()
        self.mock_service.create_or_update_game_memo = AsyncMock()

    @pytest.mark.asyncio
    async def test_get_my_game_memos_success(self):
        """ユーザーゲームメモ一覧取得成功のテスト"""
        # Arrange
        self.mock_service.get_user_memos.return_value = [
            self.sample_memo,
            self.sample_memo_2
        ]
        
        # Act
        result = await get_my_game_memos(
            current_user=self.sample_user,
            game_memo_service=self.mock_service
        )
        
        # Assert
        assert len(result) == 2
        assert result[0].id == 1
        assert result[0].memo == "テストメモ"
        assert result[0].game_id == 1
        assert result[1].id == 2
        assert result[1].memo == "テストメモ2"
        assert result[1].game_id == 2
        self.mock_service.get_user_memos.assert_called_once_with(1)
    
    @pytest.mark.asyncio
    async def test_get_my_game_memos_exception(self):
        """ユーザーゲームメモ一覧取得での例外テスト"""
        # Arrange
        self.mock_service.get_user_memos.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_my_game_memos(
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "ゲームメモ取得に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_get_game_memo_success(self):
        """特定ゲームメモ取得成功のテスト"""
        # Arrange
        self.mock_service.get_user_game_memo.return_value = self.sample_memo
        
        # Act
        result = await get_game_memo(
            game_id=1,
            current_user=self.sample_user,
            game_memo_service=self.mock_service
        )
        
        # Assert
        assert result.id == 1
        assert result.memo == "テストメモ"
        assert result.user_id == 1
        assert result.game_id == 1
        assert result.created_at == "2023-01-01T00:00:00"
        self.mock_service.get_user_game_memo.assert_called_once_with(1, 1)
    
    @pytest.mark.asyncio
    async def test_get_game_memo_not_found(self):
        """特定ゲームメモ取得での404エラーテスト"""
        # Arrange
        self.mock_service.get_user_game_memo.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_game_memo(
                game_id=999,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "ゲームメモが見つかりません"
    
    @pytest.mark.asyncio
    async def test_get_game_memo_exception(self):
        """特定ゲームメモ取得での例外テスト"""
        # Arrange
        self.mock_service.get_user_game_memo.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_game_memo(
                game_id=1,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "ゲームメモ取得に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_create_game_memo_success(self):
        """ゲームメモ作成成功のテスト"""
        # Arrange
        request = GameMemoRequest(memo="新しいメモ")
        new_memo = GameMemo(
            id=3,
            user_id=1,
            game_id=1,
            memo="新しいメモ",
            created_at=datetime(2023, 1, 3),
            updated_at=datetime(2023, 1, 3)
        )
        self.mock_service.create_game_memo.return_value = new_memo
        
        # Act
        result = await create_game_memo(
            game_id=1,
            request=request,
            current_user=self.sample_user,
            game_memo_service=self.mock_service
        )
        
        # Assert
        assert result.id == 3
        assert result.memo == "新しいメモ"
        assert result.user_id == 1
        assert result.game_id == 1
        self.mock_service.create_game_memo.assert_called_once_with(1, 1, "新しいメモ")
    
    @pytest.mark.asyncio
    async def test_create_game_memo_exception(self):
        """ゲームメモ作成での例外テスト"""
        # Arrange
        request = GameMemoRequest(memo="エラーメモ")
        self.mock_service.create_game_memo.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_game_memo(
                game_id=1,
                request=request,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "ゲームメモ作成に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_update_game_memo_success(self):
        """ゲームメモ更新成功のテスト"""
        # Arrange
        request = GameMemoRequest(memo="更新されたメモ")
        updated_memo = GameMemo(
            id=1,
            user_id=1,
            game_id=1,
            memo="更新されたメモ",
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 4)
        )
        self.mock_service.get_user_game_memo.return_value = self.sample_memo
        self.mock_service.update_game_memo.return_value = updated_memo
        
        # Act
        result = await update_game_memo(
            game_id=1,
            request=request,
            current_user=self.sample_user,
            game_memo_service=self.mock_service
        )
        
        # Assert
        assert result.id == 1
        assert result.memo == "更新されたメモ"
        self.mock_service.get_user_game_memo.assert_called_once_with(1, 1)
        self.mock_service.update_game_memo.assert_called_once_with(1, 1, "更新されたメモ")
    
    @pytest.mark.asyncio
    async def test_update_game_memo_not_found_existing(self):
        """ゲームメモ更新での既存メモ未発見テスト"""
        # Arrange
        request = GameMemoRequest(memo="更新メモ")
        self.mock_service.get_user_game_memo.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_game_memo(
                game_id=999,
                request=request,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "ゲームメモが見つかりません"
    
    @pytest.mark.asyncio
    async def test_update_game_memo_not_found_update(self):
        """ゲームメモ更新での更新失敗テスト"""
        # Arrange
        request = GameMemoRequest(memo="更新メモ")
        self.mock_service.get_user_game_memo.return_value = self.sample_memo
        self.mock_service.update_game_memo.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_game_memo(
                game_id=1,
                request=request,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "ゲームメモが見つかりません"
    
    @pytest.mark.asyncio
    async def test_update_game_memo_exception(self):
        """ゲームメモ更新での例外テスト"""
        # Arrange
        request = GameMemoRequest(memo="エラー更新")
        self.mock_service.get_user_game_memo.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_game_memo(
                game_id=1,
                request=request,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "ゲームメモ更新に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_delete_game_memo_success(self):
        """ゲームメモ削除成功のテスト"""
        # Arrange
        self.mock_service.get_user_game_memo.return_value = self.sample_memo
        self.mock_service.delete_game_memo.return_value = True
        
        # Act
        result = await delete_game_memo(
            game_id=1,
            current_user=self.sample_user,
            game_memo_service=self.mock_service
        )
        
        # Assert
        assert result["message"] == "ゲームメモを削除しました"
        self.mock_service.get_user_game_memo.assert_called_once_with(1, 1)
        self.mock_service.delete_game_memo.assert_called_once_with(1, 1)
    
    @pytest.mark.asyncio
    async def test_delete_game_memo_not_found_existing(self):
        """ゲームメモ削除での既存メモ未発見テスト"""
        # Arrange
        self.mock_service.get_user_game_memo.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_game_memo(
                game_id=999,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "ゲームメモが見つかりません"
    
    @pytest.mark.asyncio
    async def test_delete_game_memo_not_found_delete(self):
        """ゲームメモ削除での削除失敗テスト"""
        # Arrange
        self.mock_service.get_user_game_memo.return_value = self.sample_memo
        self.mock_service.delete_game_memo.return_value = False
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_game_memo(
                game_id=1,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "ゲームメモが見つかりません"
    
    @pytest.mark.asyncio
    async def test_delete_game_memo_exception(self):
        """ゲームメモ削除での例外テスト"""
        # Arrange
        self.mock_service.get_user_game_memo.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_game_memo(
                game_id=1,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "ゲームメモ削除に失敗しました" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_create_or_update_game_memo_success(self):
        """ゲームメモUPSERT成功のテスト"""
        # Arrange
        request = GameMemoRequest(memo="UPSERT メモ")
        upserted_memo = GameMemo(
            id=4,
            user_id=1,
            game_id=3,
            memo="UPSERT メモ",
            created_at=datetime(2023, 1, 5),
            updated_at=datetime(2023, 1, 5)
        )
        self.mock_service.create_or_update_game_memo.return_value = upserted_memo
        
        # Act
        result = await create_or_update_game_memo(
            game_id=3,
            request=request,
            current_user=self.sample_user,
            game_memo_service=self.mock_service
        )
        
        # Assert
        assert result.id == 4
        assert result.memo == "UPSERT メモ"
        assert result.game_id == 3
        self.mock_service.create_or_update_game_memo.assert_called_once_with(1, 3, "UPSERT メモ")
    
    @pytest.mark.asyncio
    async def test_create_or_update_game_memo_exception(self):
        """ゲームメモUPSERTでの例外テスト"""
        # Arrange
        request = GameMemoRequest(memo="エラー UPSERT")
        self.mock_service.create_or_update_game_memo.side_effect = Exception("Database error")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_or_update_game_memo(
                game_id=1,
                request=request,
                current_user=self.sample_user,
                game_memo_service=self.mock_service
            )
        
        assert exc_info.value.status_code == 500
        assert "ゲームメモ保存に失敗しました" in str(exc_info.value.detail)