"""
キャラクターデータベースモデル
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime
from infrastructure.database.connection import Base
from domain.entities.character import Character


class CharacterModel(Base):
    """キャラクターデータベースモデル"""
    __tablename__ = "characters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    def to_entity(self) -> Character:
        """エンティティに変換"""
        return Character(
            id=self.id,
            name=self.name,
            created_at=self.created_at,
            updated_at=self.updated_at
        )