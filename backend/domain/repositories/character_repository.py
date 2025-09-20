"""
キャラクターリポジトリインターフェース
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.character import Character


class CharacterRepository(ABC):
    """キャラクターリポジトリの抽象クラス"""
    
    @abstractmethod
    async def find_all(self) -> List[Character]:
        """全キャラクターを取得"""
        pass
    
    @abstractmethod
    async def find_by_id(self, id: int) -> Optional[Character]:
        """IDでキャラクターを取得"""
        pass
    
    @abstractmethod
    async def find_by_name(self, name: str) -> Optional[Character]:
        """名前でキャラクターを取得"""
        pass
    
    @abstractmethod
    async def find_by_game_id(self, game_id: int) -> List[Character]:
        """ゲームIDで利用可能なキャラクターを取得"""
        pass
    
    @abstractmethod
    async def create(self, character: Character) -> Character:
        """キャラクターを作成"""
        pass
    
    @abstractmethod
    async def update(self, character: Character) -> Character:
        """キャラクターを更新"""
        pass
    
    @abstractmethod
    async def delete(self, id: int) -> bool:
        """キャラクターを削除"""
        pass
    
    @abstractmethod
    async def exists(self, id: int) -> bool:
        """キャラクターが存在するかチェック"""
        pass