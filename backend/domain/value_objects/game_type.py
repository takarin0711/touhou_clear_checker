from enum import Enum

class GameType(Enum):
    MAIN_SERIES = "main_series"  # 本編STG（第6作〜第20作）
    SPIN_OFF_STG = "spin_off_stg"  # 外伝STG（妖精大戦争など）
    FIGHTING = "fighting"        # 格闘ゲーム（.5作系）
    PHOTOGRAPHY = "photography"  # 撮影STG（文花帖系）
    MIXED = "mixed"             # 格闘+STG要素
    VERSUS = "versus"           # 対戦型STG（花映塚、獣王園）