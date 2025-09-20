"""
ゲームメモエンティティ
"""
from datetime import datetime
from typing import Optional


class GameMemo:
    """作品ごとメモエンティティ"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        user_id: int = 0,
        game_id: int = 0,
        memo: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.game_id = game_id
        self.memo = memo
        self.created_at = created_at
        self.updated_at = updated_at
    
    def has_content(self) -> bool:
        """メモが空でないかチェック"""
        return self.memo is not None and self.memo.strip() != ""
    
    def get_character_count(self) -> int:
        """メモの文字数を取得"""
        return len(self.memo) if self.memo else 0
    
    def to_dict(self) -> dict:
        """辞書形式に変換"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_id': self.game_id,
            'memo': self.memo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameMemo':
        """辞書からエンティティを作成"""
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id', 0),
            game_id=data.get('game_id', 0),
            memo=data.get('memo'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def __str__(self) -> str:
        content_preview = self.memo[:50] + "..." if self.memo and len(self.memo) > 50 else self.memo or "(空)"
        return f"GameMemo(user={self.user_id}, game={self.game_id}, memo='{content_preview}')"
    
    def __repr__(self) -> str:
        return self.__str__()