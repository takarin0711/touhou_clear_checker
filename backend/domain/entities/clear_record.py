"""
クリア記録エンティティ（機体別個別条件対応）
"""
from datetime import datetime, date
from typing import Optional


class ClearRecord:
    """機体別個別条件記録エンティティ"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        user_id: int = 0,
        game_id: int = 0,
        character_name: str = "",           # 機体名
        difficulty: str = "",
        mode: str = "normal",               # ゲームモード（通常: normal、紺珠伝: legacy/pointdevice）
        is_cleared: bool = False,
        is_no_continue_clear: bool = False,
        is_no_bomb_clear: bool = False,
        is_no_miss_clear: bool = False,
        is_full_spell_card: bool = False,   # フルスペルカード取得（全作品共通）
        is_special_clear_1: bool = False,  # 作品特有条件1 (例: ノーロアリング)
        is_special_clear_2: bool = False,  # 作品特有条件2 (例: ノー季節解放)
        is_special_clear_3: bool = False,  # 作品特有条件3 (例: その他特殊条件)
        cleared_at: Optional[date] = None,
        last_updated_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.game_id = game_id
        self.character_name = character_name
        self.difficulty = difficulty
        self.mode = mode
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
    
    def has_any_clear_condition(self) -> bool:
        """いずれかのクリア条件が達成されているか"""
        return (self.is_cleared or 
                self.is_no_continue_clear or 
                self.is_no_bomb_clear or 
                self.is_no_miss_clear or
                self.is_full_spell_card or
                self.is_special_clear_1 or
                self.is_special_clear_2 or
                self.is_special_clear_3)
    
    def get_achieved_conditions(self) -> list[str]:
        """達成済み条件のリストを取得"""
        conditions = []
        if self.is_cleared:
            conditions.append("cleared")
        if self.is_no_continue_clear:
            conditions.append("no_continue")
        if self.is_no_bomb_clear:
            conditions.append("no_bomb")
        if self.is_no_miss_clear:
            conditions.append("no_miss")
        if self.is_full_spell_card:
            conditions.append("full_spell_card")
        if self.is_special_clear_1:
            conditions.append("special_1")
        if self.is_special_clear_2:
            conditions.append("special_2")
        if self.is_special_clear_3:
            conditions.append("special_3")
        return conditions
    
    def get_achievement_count(self) -> int:
        """達成済み条件の数を取得"""
        return len(self.get_achieved_conditions())
    
    def to_dict(self) -> dict:
        """辞書形式に変換"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_id': self.game_id,
            'character_name': self.character_name,
            'difficulty': self.difficulty,
            'mode': self.mode,
            'is_cleared': self.is_cleared,
            'is_no_continue_clear': self.is_no_continue_clear,
            'is_no_bomb_clear': self.is_no_bomb_clear,
            'is_no_miss_clear': self.is_no_miss_clear,
            'is_full_spell_card': self.is_full_spell_card,
            'is_special_clear_1': self.is_special_clear_1,
            'is_special_clear_2': self.is_special_clear_2,
            'is_special_clear_3': self.is_special_clear_3,
            'cleared_at': self.cleared_at.isoformat() if self.cleared_at else None,
            'last_updated_at': self.last_updated_at.isoformat() if self.last_updated_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ClearRecord':
        """辞書からエンティティを作成"""
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id', 0),
            game_id=data.get('game_id', 0),
            character_name=data.get('character_name', ''),
            difficulty=data.get('difficulty', ''),
            mode=data.get('mode', 'normal'),
            is_cleared=data.get('is_cleared', False),
            is_no_continue_clear=data.get('is_no_continue_clear', False),
            is_no_bomb_clear=data.get('is_no_bomb_clear', False),
            is_no_miss_clear=data.get('is_no_miss_clear', False),
            is_full_spell_card=data.get('is_full_spell_card', False),
            is_special_clear_1=data.get('is_special_clear_1', False),
            is_special_clear_2=data.get('is_special_clear_2', False),
            is_special_clear_3=data.get('is_special_clear_3', False),
            cleared_at=data.get('cleared_at'),
            last_updated_at=data.get('last_updated_at'),
            created_at=data.get('created_at')
        )
    
    def __str__(self) -> str:
        conditions = self.get_achieved_conditions()
        condition_str = ", ".join(conditions) if conditions else "未クリア"
        return f"ClearRecord(user={self.user_id}, game={self.game_id}, char={self.character_name}, diff={self.difficulty}, mode={self.mode}, conditions={condition_str})"
    
    def __repr__(self) -> str:
        return self.__str__()