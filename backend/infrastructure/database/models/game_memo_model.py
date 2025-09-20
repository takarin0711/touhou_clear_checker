"""
ゲームメモデータベースモデル
"""
from datetime import datetime
from typing import Optional
from domain.entities.game_memo import GameMemo


class GameMemoModel:
    """ゲームメモデータベースモデル"""
    
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
    
    @classmethod
    def from_entity(cls, game_memo: GameMemo) -> 'GameMemoModel':
        """エンティティからモデルを作成"""
        return cls(
            id=game_memo.id,
            user_id=game_memo.user_id,
            game_id=game_memo.game_id,
            memo=game_memo.memo,
            created_at=game_memo.created_at,
            updated_at=game_memo.updated_at
        )
    
    def to_entity(self) -> GameMemo:
        """エンティティに変換"""
        return GameMemo(
            id=self.id,
            user_id=self.user_id,
            game_id=self.game_id,
            memo=self.memo,
            created_at=self.created_at,
            updated_at=self.updated_at
        )
    
    @classmethod
    def from_db_row(cls, row: tuple) -> 'GameMemoModel':
        """データベース行からモデルを作成"""
        return cls(
            id=row[0] if row[0] is not None else None,
            user_id=row[1] if row[1] is not None else 0,
            game_id=row[2] if row[2] is not None else 0,
            memo=row[3] if row[3] is not None else None,
            created_at=datetime.fromisoformat(row[4]) if row[4] is not None else None,
            updated_at=datetime.fromisoformat(row[5]) if row[5] is not None else None
        )
    
    def to_db_values(self) -> tuple:
        """データベース挿入用の値タプルを作成"""
        return (
            self.user_id,
            self.game_id,
            self.memo,
            self.created_at,
            self.updated_at
        )