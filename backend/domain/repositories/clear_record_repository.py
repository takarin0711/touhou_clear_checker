"""
クリア記録リポジトリインターフェース
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.clear_record import ClearRecord


class ClearRecordRepository(ABC):
    """クリア記録リポジトリの抽象クラス"""
    
    @abstractmethod
    async def find_all(self) -> List[ClearRecord]:
        """全クリア記録を取得"""
        pass
    
    @abstractmethod
    async def find_by_id(self, id: int) -> Optional[ClearRecord]:
        """IDでクリア記録を取得"""
        pass
    
    @abstractmethod
    async def find_by_user_id(self, user_id: int) -> List[ClearRecord]:
        """ユーザーIDでクリア記録を取得"""
        pass
    
    @abstractmethod
    async def find_by_game_id(self, game_id: int) -> List[ClearRecord]:
        """ゲームIDでクリア記録を取得"""
        pass
    
    @abstractmethod
    async def find_by_user_and_game(self, user_id: int, game_id: int) -> List[ClearRecord]:
        """ユーザー・ゲームでクリア記録を取得"""
        pass
    
    @abstractmethod
    async def find_by_user_game_character_difficulty(
        self, 
        user_id: int, 
        game_id: int, 
        character_id: int, 
        difficulty: str
    ) -> Optional[ClearRecord]:
        """ユーザー・ゲーム・キャラ・難易度でクリア記録を取得"""
        pass
    
    @abstractmethod
    async def find_by_user_game_character_difficulty_mode(
        self, 
        user_id: int, 
        game_id: int, 
        character_name: str, 
        difficulty: str,
        mode: str = "normal"
    ) -> Optional[ClearRecord]:
        """ユーザー・ゲーム・キャラ・難易度・モードでクリア記録を取得"""
        pass
    
    @abstractmethod
    async def create(self, clear_record: ClearRecord) -> ClearRecord:
        """クリア記録を作成"""
        pass
    
    @abstractmethod
    async def update(self, clear_record: ClearRecord) -> ClearRecord:
        """クリア記録を更新"""
        pass
    
    @abstractmethod
    async def delete(self, id: int) -> bool:
        """クリア記録を削除"""
        pass
    
    @abstractmethod
    async def exists(self, id: int) -> bool:
        """クリア記録が存在するかチェック"""
        pass
    
    @abstractmethod
    async def create_or_update(self, clear_record: ClearRecord) -> ClearRecord:
        """クリア記録を作成または更新（UPSERT）"""
        pass