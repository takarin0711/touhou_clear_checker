from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..connection import Base


class GameCharacterModel(Base):
    __tablename__ = "game_characters"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False, index=True)
    character_name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # リレーションシップ
    game = relationship("GameModel", back_populates="characters")