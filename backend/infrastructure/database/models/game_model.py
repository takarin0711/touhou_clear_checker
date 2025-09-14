from sqlalchemy import Column, Integer, String
from ..connection import Base

class GameModel(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    series_number = Column(Integer, nullable=False)
    release_year = Column(Integer, nullable=False)