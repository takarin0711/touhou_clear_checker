from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..connection import Base

class ClearStatusModel(Base):
    __tablename__ = "clear_status"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    difficulty = Column(String(50), nullable=False)
    is_cleared = Column(Boolean, default=False, nullable=False)
    cleared_at = Column(DateTime, nullable=True)
    
    game = relationship("GameModel", backref="clear_statuses")