"""
ゲームメモデータベースモデル
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from infrastructure.database.connection import Base
from domain.entities.game_memo import GameMemo


class GameMemoModel(Base):
    """ゲームメモデータベースモデル"""
    __tablename__ = "game_memos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    memo = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
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
