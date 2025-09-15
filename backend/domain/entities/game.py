from dataclasses import dataclass
from typing import Optional, List
from decimal import Decimal
from ..value_objects.game_type import GameType
from ..value_objects.difficulty import Difficulty

@dataclass
class Game:
    id: Optional[int]
    title: str
    series_number: Decimal
    release_year: int
    game_type: GameType = GameType.MAIN_SERIES
    
    def __post_init__(self):
        if not self.title:
            raise ValueError("Game title cannot be empty")
        if self.series_number <= 0:
            raise ValueError("Series number must be positive")
        if self.release_year <= 0:
            raise ValueError("Release year must be positive")
    
    def get_available_difficulties(self) -> List[Difficulty]:
        """このゲームで利用可能な難易度一覧を返す"""
        if self.game_type != GameType.MAIN_SERIES:
            # 番外編は難易度制限なし（将来的に個別制御）
            return list(Difficulty)
        
        # 本編STGの難易度制限
        base_difficulties = [
            Difficulty.EASY,
            Difficulty.NORMAL, 
            Difficulty.HARD,
            Difficulty.LUNATIC,
            Difficulty.EXTRA
        ]
        
        # Phantasm難易度は妖々夢（第7作）のみ
        if self.series_number == Decimal('7'):
            base_difficulties.append(Difficulty.PHANTASM)
            
        return base_difficulties