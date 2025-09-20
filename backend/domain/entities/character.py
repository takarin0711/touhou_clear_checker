"""
キャラクターエンティティ
"""
from datetime import datetime
from typing import Optional


class Character:
    """キャラクター・機体エンティティ"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        name: str = "",
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.name = name
        self.created_at = created_at
        self.updated_at = updated_at
    
    def to_dict(self) -> dict:
        """辞書形式に変換"""
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Character':
        """辞書からエンティティを作成"""
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def __str__(self) -> str:
        return f"Character(id={self.id}, name='{self.name}')"
    
    def __repr__(self) -> str:
        return self.__str__()