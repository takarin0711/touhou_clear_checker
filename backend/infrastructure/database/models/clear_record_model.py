"""
クリア記録データベースモデル
"""
from datetime import datetime, date
from typing import Optional
from domain.entities.clear_record import ClearRecord


class ClearRecordModel:
    """クリア記録データベースモデル"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        user_id: int = 0,
        game_id: int = 0,
        character_id: int = 0,
        difficulty: str = "",
        is_cleared: bool = False,
        is_no_continue_clear: bool = False,
        is_no_bomb_clear: bool = False,
        is_no_miss_clear: bool = False,
        is_full_spell_card: bool = False,
        is_special_clear_1: bool = False,
        is_special_clear_2: bool = False,
        is_special_clear_3: bool = False,
        cleared_at: Optional[date] = None,
        last_updated_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.game_id = game_id
        self.character_id = character_id
        self.difficulty = difficulty
        self.is_cleared = is_cleared
        self.is_no_continue_clear = is_no_continue_clear
        self.is_no_bomb_clear = is_no_bomb_clear
        self.is_no_miss_clear = is_no_miss_clear
        self.is_full_spell_card = is_full_spell_card
        self.is_special_clear_1 = is_special_clear_1
        self.is_special_clear_2 = is_special_clear_2
        self.is_special_clear_3 = is_special_clear_3
        self.cleared_at = cleared_at
        self.last_updated_at = last_updated_at
        self.created_at = created_at
    
    @classmethod
    def from_entity(cls, clear_record: ClearRecord) -> 'ClearRecordModel':
        """エンティティからモデルを作成"""
        return cls(
            id=clear_record.id,
            user_id=clear_record.user_id,
            game_id=clear_record.game_id,
            character_id=clear_record.character_id,
            difficulty=clear_record.difficulty,
            is_cleared=clear_record.is_cleared,
            is_no_continue_clear=clear_record.is_no_continue_clear,
            is_no_bomb_clear=clear_record.is_no_bomb_clear,
            is_no_miss_clear=clear_record.is_no_miss_clear,
            is_full_spell_card=clear_record.is_full_spell_card,
            is_special_clear_1=clear_record.is_special_clear_1,
            is_special_clear_2=clear_record.is_special_clear_2,
            is_special_clear_3=clear_record.is_special_clear_3,
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
            character_id=self.character_id,
            difficulty=self.difficulty,
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
    
    @classmethod
    def from_db_row(cls, row: tuple) -> 'ClearRecordModel':
        """データベース行からモデルを作成"""
        return cls(
            id=row[0] if row[0] is not None else None,
            user_id=row[1] if row[1] is not None else 0,
            game_id=row[2] if row[2] is not None else 0,
            character_id=row[3] if row[3] is not None else 0,
            difficulty=row[4] if row[4] is not None else "",
            is_cleared=bool(row[5]) if row[5] is not None else False,
            is_no_continue_clear=bool(row[6]) if row[6] is not None else False,
            is_no_bomb_clear=bool(row[7]) if row[7] is not None else False,
            is_no_miss_clear=bool(row[8]) if row[8] is not None else False,
            cleared_at=datetime.fromisoformat(row[9]).date() if row[9] is not None else None,
            last_updated_at=datetime.fromisoformat(row[10]) if row[10] is not None else None,
            created_at=datetime.fromisoformat(row[11]) if row[11] is not None else None
        )
    
    def to_db_values(self) -> tuple:
        """データベース挿入用の値タプルを作成"""
        return (
            self.user_id,
            self.game_id,
            self.character_id,
            self.difficulty,
            self.is_cleared,
            self.is_no_continue_clear,
            self.is_no_bomb_clear,
            self.is_no_miss_clear,
            self.cleared_at.isoformat() if self.cleared_at else None,
            self.last_updated_at,
            self.created_at
        )