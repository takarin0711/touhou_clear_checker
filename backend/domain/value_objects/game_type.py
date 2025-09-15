from enum import Enum

class GameType(Enum):
    MAIN_SERIES = "main_series"  # 通常シリーズ（第6作〜第19作）
    FIGHTING = "fighting"        # 格闘ゲーム（.5作系）
    PHOTOGRAPHY = "photography"  # 撮影STG（文花帖系）
    MIXED = "mixed"             # 格闘+STG要素