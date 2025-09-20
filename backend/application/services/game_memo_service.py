"""
ゲームメモサービス
"""
from typing import List, Optional
from domain.entities.game_memo import GameMemo
from domain.repositories.game_memo_repository import GameMemoRepository


class GameMemoService:
    """ゲームメモサービス"""
    
    def __init__(self, game_memo_repository: GameMemoRepository):
        self.game_memo_repository = game_memo_repository
    
    async def get_user_game_memo(self, user_id: int, game_id: int) -> Optional[GameMemo]:
        """ユーザーの特定ゲームのメモを取得"""
        return await self.game_memo_repository.find_by_user_and_game(user_id, game_id)
    
    async def get_user_memos(self, user_id: int) -> List[GameMemo]:
        """ユーザーの全メモを取得"""
        return await self.game_memo_repository.find_by_user_id(user_id)
    
    async def create_game_memo(self, user_id: int, game_id: int, memo_text: str) -> GameMemo:
        """ゲームメモを作成"""
        game_memo = GameMemo(
            user_id=user_id,
            game_id=game_id,
            memo=memo_text
        )
        return await self.game_memo_repository.create(game_memo)
    
    async def update_game_memo(self, memo_id: int, user_id: int, memo_text: str) -> Optional[GameMemo]:
        """ゲームメモを更新"""
        # 既存メモを取得してユーザー権限をチェック
        existing_memo = await self.game_memo_repository.find_by_id(memo_id)
        if not existing_memo or existing_memo.user_id != user_id:
            return None
        
        existing_memo.memo = memo_text
        return await self.game_memo_repository.update(existing_memo)
    
    async def delete_game_memo(self, memo_id: int, user_id: int) -> bool:
        """ゲームメモを削除"""
        # 既存メモを取得してユーザー権限をチェック
        existing_memo = await self.game_memo_repository.find_by_id(memo_id)
        if not existing_memo or existing_memo.user_id != user_id:
            return False
        
        return await self.game_memo_repository.delete(memo_id)
    
    async def create_or_update_game_memo(self, user_id: int, game_id: int, memo_text: str) -> GameMemo:
        """ゲームメモを作成または更新（UPSERT）"""
        game_memo = GameMemo(
            user_id=user_id,
            game_id=game_id,
            memo=memo_text
        )
        return await self.game_memo_repository.create_or_update(game_memo)