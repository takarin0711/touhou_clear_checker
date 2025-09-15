from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..connection import Base

class ClearStatusModel(Base):
    __tablename__ = "clear_status"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    difficulty = Column(String(50), nullable=False)
    is_cleared = Column(Boolean, default=False, nullable=False)
    cleared_at = Column(DateTime, nullable=True)
    no_continue_clear = Column(Boolean, default=False, nullable=False)
    no_bomb_clear = Column(Boolean, default=False, nullable=False)
    no_miss_clear = Column(Boolean, default=False, nullable=False)
    score = Column(Integer, nullable=True)
    clear_count = Column(Integer, default=0, nullable=False)
    
    game = relationship("GameModel", backref="clear_statuses")
    user = relationship("UserModel", backref="clear_statuses")