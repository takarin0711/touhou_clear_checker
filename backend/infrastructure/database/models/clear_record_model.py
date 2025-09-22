"""
クリア記録SQLAlchemyモデル
"""
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from infrastructure.database.connection import Base
from domain.entities.clear_record import ClearRecord
from datetime import datetime, date


class ClearRecordModel(Base):
    __tablename__ = "clear_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    character_name = Column(String(100), nullable=False)
    difficulty = Column(String(20), nullable=False)
    mode = Column(String(20), default="normal")
    is_cleared = Column(Boolean, default=False)
    is_no_continue_clear = Column(Boolean, default=False)
    is_no_bomb_clear = Column(Boolean, default=False)
    is_no_miss_clear = Column(Boolean, default=False)
    is_full_spell_card = Column(Boolean, default=False)
    is_special_clear_1 = Column(Boolean, default=False)
    is_special_clear_2 = Column(Boolean, default=False)
    is_special_clear_3 = Column(Boolean, default=False)
    cleared_at = Column(Date, nullable=True)
    last_updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, default=func.now())

    @classmethod
    def from_entity(cls, clear_record: ClearRecord) -> 'ClearRecordModel':
        """エンティティからモデルを作成"""
        return cls(
            id=clear_record.id,
            user_id=clear_record.user_id,
            game_id=clear_record.game_id,
            character_name=clear_record.character_name,
            difficulty=clear_record.difficulty,
            mode=getattr(clear_record, 'mode', 'normal'),
            is_cleared=clear_record.is_cleared,
            is_no_continue_clear=clear_record.is_no_continue_clear,
            is_no_bomb_clear=clear_record.is_no_bomb_clear,
            is_no_miss_clear=clear_record.is_no_miss_clear,
            is_full_spell_card=clear_record.is_full_spell_card,
            is_special_clear_1=getattr(clear_record, 'is_special_clear_1', False),
            is_special_clear_2=getattr(clear_record, 'is_special_clear_2', False),
            is_special_clear_3=getattr(clear_record, 'is_special_clear_3', False),
            cleared_at=clear_record.cleared_at,
            last_updated_at=clear_record.last_updated_at,
            created_at=clear_record.created_at
        )
    
    def to_entity(self) -> ClearRecord:
        """エンティティに変換"""
        return ClearRecord(
            id=self.id,
            user_id=self.user_id,
            game_id=self.game_id,
            character_name=self.character_name,
            difficulty=self.difficulty,
            mode=self.mode,
            is_cleared=self.is_cleared,
            is_no_continue_clear=self.is_no_continue_clear,
            is_no_bomb_clear=self.is_no_bomb_clear,
            is_no_miss_clear=self.is_no_miss_clear,
            is_full_spell_card=self.is_full_spell_card,
            is_special_clear_1=self.is_special_clear_1,
            is_special_clear_2=self.is_special_clear_2,
            is_special_clear_3=self.is_special_clear_3,
            cleared_at=self.cleared_at,
            last_updated_at=self.last_updated_at,
            created_at=self.created_at
        )