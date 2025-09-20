"""
キャラクターリポジトリ実装
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from domain.repositories.character_repository import CharacterRepository
from domain.entities.character import Character
from domain.constants.game_constants import get_character_range_for_game
from infrastructure.database.models.character_model import CharacterModel


class CharacterRepositoryImpl(CharacterRepository):
    """キャラクターリポジトリの実装クラス"""
    
    def __init__(self, session: Session):
        self.session = session
    
    async def find_all(self) -> List[Character]:
        """全キャラクターを取得"""
        models = self.session.query(CharacterModel).order_by(CharacterModel.id).all()
        return [model.to_entity() for model in models]
    
    async def find_by_id(self, id: int) -> Optional[Character]:
        """IDでキャラクターを取得"""
        model = self.session.query(CharacterModel).filter(CharacterModel.id == id).first()
        return model.to_entity() if model else None
    
    async def find_by_name(self, name: str) -> Optional[Character]:
        """名前でキャラクターを取得"""
        model = self.session.query(CharacterModel).filter(CharacterModel.name == name).first()
        return model.to_entity() if model else None
    
    async def find_by_game_id(self, game_id: int) -> List[Character]:
        """ゲームIDで利用可能なキャラクターを取得"""
        char_range = get_character_range_for_game(game_id)
        
        models = self.session.query(CharacterModel).filter(
            CharacterModel.id >= char_range[0],
            CharacterModel.id <= char_range[1]
        ).order_by(CharacterModel.id).all()
        return [model.to_entity() for model in models]
    
    async def create(self, character: Character) -> Character:
        """キャラクターを作成"""
        now = datetime.now()
        model = CharacterModel(
            name=character.name,
            created_at=now,
            updated_at=now
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model.to_entity()
    
    async def update(self, character: Character) -> Character:
        """キャラクターを更新"""
        model = self.session.query(CharacterModel).filter(CharacterModel.id == character.id).first()
        if model:
            model.name = character.name
            model.updated_at = datetime.now()
            self.session.commit()
            return model.to_entity()
        return character
    
    async def delete(self, id: int) -> bool:
        """キャラクターを削除"""
        model = self.session.query(CharacterModel).filter(CharacterModel.id == id).first()
        if model:
            self.session.delete(model)
            self.session.commit()
            return True
        return False
    
    async def exists(self, id: int) -> bool:
        """キャラクターが存在するかチェック"""
        return self.session.query(CharacterModel).filter(CharacterModel.id == id).first() is not None