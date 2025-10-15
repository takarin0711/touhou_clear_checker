"""
ゲームメモサービス
"""
from typing import List, Optional
from domain.entities.game_memo import GameMemo
from domain.repositories.game_memo_repository import GameMemoRepository
from infrastructure.logging.logger import LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class GameMemoService:
    """ゲームメモサービス"""
    
    def __init__(self, game_memo_repository: GameMemoRepository):
        self.game_memo_repository = game_memo_repository
    
    async def get_user_game_memo(self, user_id: int, game_id: int) -> Optional[GameMemo]:
        """ユーザーの特定ゲームのメモを取得"""
        return await self.game_memo_repository.find_by_user_and_game(user_id, game_id)
    
    async def get_user_memos(self, user_id: int) -> List[GameMemo]:
        """ユーザーの全メモを取得"""
        logger.debug(f"Fetching all game memos for user_id={user_id}")
        memos = await self.game_memo_repository.find_by_user_id(user_id)
        logger.debug(f"Found {len(memos)} game memos for user_id={user_id}")
        return memos
    
    async def create_game_memo(self, user_id: int, game_id: int, memo_text: str) -> GameMemo:
        """ゲームメモを作成"""
        logger.info(f"Creating game memo: user_id={user_id}, game_id={game_id}")
        game_memo = GameMemo(
            user_id=user_id,
            game_id=game_id,
            memo=memo_text
        )
        created_memo = await self.game_memo_repository.create(game_memo)
        logger.info(f"Game memo created: memo_id={created_memo.id}")
        return created_memo
    
    async def update_game_memo(self, memo_id: int, user_id: int, memo_text: str) -> Optional[GameMemo]:
        """ゲームメモを更新"""
        logger.info(f"Updating game memo: memo_id={memo_id}, user_id={user_id}")
        # 既存メモを取得してユーザー権限をチェック
        existing_memo = await self.game_memo_repository.find_by_id(memo_id)
        if not existing_memo or existing_memo.user_id != user_id:
            logger.warning(f"Game memo not found or permission denied: memo_id={memo_id}, user_id={user_id}")
            return None

        existing_memo.memo = memo_text
        updated_memo = await self.game_memo_repository.update(existing_memo)
        logger.info(f"Game memo updated: memo_id={memo_id}")
        return updated_memo
    
    async def delete_game_memo(self, memo_id: int, user_id: int) -> bool:
        """ゲームメモを削除"""
        logger.info(f"Deleting game memo: memo_id={memo_id}, user_id={user_id}")
        # 既存メモを取得してユーザー権限をチェック
        existing_memo = await self.game_memo_repository.find_by_id(memo_id)
        if not existing_memo or existing_memo.user_id != user_id:
            logger.warning(f"Game memo not found or permission denied: memo_id={memo_id}, user_id={user_id}")
            return False

        result = await self.game_memo_repository.delete(memo_id)
        if result:
            logger.info(f"Game memo deleted: memo_id={memo_id}")
        else:
            logger.warning(f"Failed to delete game memo: memo_id={memo_id}")
        return result
    
    async def create_or_update_game_memo(self, user_id: int, game_id: int, memo_text: str) -> GameMemo:
        """ゲームメモを作成または更新（UPSERT）"""
        logger.info(f"Upserting game memo: user_id={user_id}, game_id={game_id}")
        game_memo = GameMemo(
            user_id=user_id,
            game_id=game_id,
            memo=memo_text
        )
        result = await self.game_memo_repository.create_or_update(game_memo)
        logger.info(f"Game memo upserted: memo_id={result.id}")
        return result