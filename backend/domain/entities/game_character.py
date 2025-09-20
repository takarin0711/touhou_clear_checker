"""
統合ゲーム機体エンティティ（作品固有の機体管理）
"""
from datetime import datetime
from typing import Optional


class GameCharacter:
    """統合ゲーム機体エンティティ"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        game_id: int = 0,
        character_name: str = "",
        description: Optional[str] = None,
        sort_order: int = 0,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.game_id = game_id
        self.character_name = character_name
        self.description = description
        self.sort_order = sort_order
        self.created_at = created_at
    
    def is_valid(self) -> bool:
        """エンティティの妥当性チェック"""
        return (
            self.game_id > 0 and
            len(self.character_name.strip()) > 0 and
            len(self.character_name) <= 100
        )
    
    def get_display_name(self) -> str:
        """表示用名前を取得"""
        return self.character_name.strip()
    
    def has_description(self) -> bool:
        """説明文が設定されているかチェック"""
        return self.description is not None and len(self.description.strip()) > 0
    
    def get_description(self) -> str:
        """説明文を取得（設定されていない場合は空文字）"""
        return self.description.strip() if self.has_description() else ""
    
    def to_dict(self) -> dict:
        """辞書形式で返す"""
        created_at_str = None
        if self.created_at:
            if isinstance(self.created_at, datetime):
                created_at_str = self.created_at.isoformat()
            else:
                created_at_str = str(self.created_at)
        
        return {
            "id": self.id,
            "game_id": self.game_id,
            "character_name": self.character_name,
            "description": self.description,
            "sort_order": self.sort_order,
            "created_at": created_at_str
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameCharacter':
        """辞書からエンティティを作成"""
        created_at = None
        if data.get("created_at"):
            if isinstance(data["created_at"], str):
                created_at = datetime.fromisoformat(data["created_at"])
            else:
                created_at = data["created_at"]
        
        return cls(
            id=data.get("id"),
            game_id=data.get("game_id", 0),
            character_name=data.get("character_name", ""),
            description=data.get("description"),
            sort_order=data.get("sort_order", 0),
            created_at=created_at
        )
    
    def __eq__(self, other) -> bool:
        """等価性の比較"""
        if not isinstance(other, GameCharacter):
            return False
        return (
            self.game_id == other.game_id and
            self.character_name == other.character_name
        )
    
    def __str__(self) -> str:
        """文字列表現"""
        return f"GameCharacter(id={self.id}, game_id={self.game_id}, name='{self.character_name}')"
    
    def __repr__(self) -> str:
        """デバッグ用文字列表現"""
        return self.__str__()