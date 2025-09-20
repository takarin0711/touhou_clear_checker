"""
ゲームメモリポジトリインターフェース
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.game_memo import GameMemo


class GameMemoRepository(ABC):
    """ゲームメモリポジトリの抽象クラス"""
    
    @abstractmethod
    async def find_all(self) -> List[GameMemo]:
        """全ゲームメモを取得"""
        pass
    
    @abstractmethod
    async def find_by_id(self, id: int) -> Optional[GameMemo]:
        """IDでゲームメモを取得"""
        pass
    
    @abstractmethod
    async def find_by_user_id(self, user_id: int) -> List[GameMemo]:
        """ユーザーIDでゲームメモを取得"""
        pass
    
    @abstractmethod
    async def find_by_user_and_game(self, user_id: int, game_id: int) -> Optional[GameMemo]:
        """ユーザー・ゲームでメモを取得"""
        pass
    
    @abstractmethod
    async def create(self, game_memo: GameMemo) -> GameMemo:
        """ゲームメモを作成"""
        pass
    
    @abstractmethod
    async def update(self, game_memo: GameMemo) -> GameMemo:
        """ゲームメモを更新"""
        pass
    
    @abstractmethod
    async def delete(self, id: int) -> bool:
        """ゲームメモを削除"""
        pass
    
    @abstractmethod
    async def exists(self, id: int) -> bool:
        """ゲームメモが存在するかチェック"""
        pass
    
    @abstractmethod
    async def create_or_update(self, game_memo: GameMemo) -> GameMemo:
        """ゲームメモを作成または更新（UPSERT）"""
        pass