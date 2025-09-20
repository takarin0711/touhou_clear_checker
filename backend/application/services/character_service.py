"""
キャラクターサービス
"""
from typing import List, Optional
from domain.entities.character import Character
from domain.repositories.character_repository import CharacterRepository


class CharacterService:
    """キャラクターサービス"""
    
    def __init__(self, character_repository: CharacterRepository):
        self.character_repository = character_repository
    
    async def get_all_characters(self) -> List[Character]:
        """全キャラクターを取得"""
        return await self.character_repository.find_all()
    
    async def get_character_by_id(self, id: int) -> Optional[Character]:
        """IDでキャラクターを取得"""
        return await self.character_repository.find_by_id(id)
    
    async def get_characters_by_game_id(self, game_id: int) -> List[Character]:
        """ゲームIDで利用可能なキャラクターを取得"""
        return await self.character_repository.find_by_game_id(game_id)
    
    async def create_character(self, character: Character) -> Character:
        """キャラクターを作成（管理者のみ）"""
        return await self.character_repository.create(character)
    
    async def update_character(self, character: Character) -> Character:
        """キャラクターを更新（管理者のみ）"""
        return await self.character_repository.update(character)
    
    async def delete_character(self, id: int) -> bool:
        """キャラクターを削除（管理者のみ）"""
        return await self.character_repository.delete(id)