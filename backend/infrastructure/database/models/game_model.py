from sqlalchemy import Column, Integer, String, Numeric
from ..connection import Base

class GameModel(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    series_number = Column(Numeric(4, 1), nullable=False)  # 19.5まで対応
    release_year = Column(Integer, nullable=False)
    game_type = Column(String(50), nullable=False, default="main_series")