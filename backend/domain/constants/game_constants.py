"""
ゲーム関連の定数定義
"""

# ゲームID定数
class GameIds:
    """ゲームIDの定数クラス"""
    TOUHOU_06_EOSD = 1      # 東方紅魔郷 (Embodiment of Scarlet Devil)
    TOUHOU_07_PCB = 2       # 東方妖々夢 (Perfect Cherry Blossom)
    TOUHOU_08_IN = 3        # 東方永夜抄 (Imperishable Night)
    TOUHOU_09_POV = 4       # 東方花映塚 (Phantasmagoria of Flower View)
    TOUHOU_10_MOF = 5       # 東方風神録 (Mountain of Faith)
    TOUHOU_11_SA = 6        # 東方地霊殿 (Subterranean Animism)
    TOUHOU_12_UFO = 7       # 東方星蓮船 (Undefined Fantastic Object)
    TOUHOU_128_FW = 8       # 東方妖精大戦争 (Fairy Wars)
    TOUHOU_13_TD = 9        # 東方神霊廟 (Ten Desires)
    TOUHOU_14_DDC = 10      # 東方輝針城 (Double Dealing Character)
    TOUHOU_15_LoLK = 11     # 東方紺珠伝 (Legacy of Lunatic Kingdom)
    TOUHOU_16_HSiFS = 12    # 東方天空璋 (Hidden Star in Four Seasons)
    TOUHOU_17_WBaWC = 13    # 東方鬼形獣 (Wily Beast and Weakest Creature)
    TOUHOU_18_UM = 14       # 東方虹龍洞 (Unconnected Marketeers)
    TOUHOU_19_UDoALG = 15   # 東方獣王園 (Unfinished Dream of All Living Ghost)
    TOUHOU_20_UDoKJ = 16    # 東方錦上京 (Unfinished Dream of Kyougoku's Journey)

# キャラクターID範囲定数
class CharacterRanges:
    """ゲーム別キャラクターID範囲の定数クラス"""
    
    # 東方紅魔郷 (4キャラクター: 霊夢A/B, 魔理沙A/B)
    TOUHOU_06_EOSD = (19, 22)
    
    # 東方妖々夢 (6キャラクター: 霊夢A/B, 魔理沙A/B, 咲夜A/B)
    TOUHOU_07_PCB = (23, 28)
    
    # 東方永夜抄 (12キャラクター: タッグシステム + 個別キャラクター)
    TOUHOU_08_IN = (29, 40)
    
    # 東方花映塚 (16キャラクター: 対戦型STG)
    TOUHOU_09_POV = (41, 56)
    
    # 東方風神録 (6キャラクター: 霊夢A/B/C, 魔理沙A/B/C)
    TOUHOU_10_MOF = (57, 62)
    
    # 東方地霊殿 (6キャラクター: パートナーシステム)
    TOUHOU_11_SA = (63, 68)
    
    # 東方星蓮船 (6キャラクター: 3キャラ×2ショット)
    TOUHOU_12_UFO = (69, 74)
    
    # 東方妖精大戦争 (1キャラクター: チルノのみ)
    TOUHOU_128_FW = (75, 75)
    
    # 東方神霊廟 (4キャラクター: 固定ショット)
    TOUHOU_13_TD = (76, 79)
    
    # 東方輝針城 (6キャラクター: 霊夢A/B, 魔理沙A/B, 咲夜A/B)
    TOUHOU_14_DDC = (80, 85)
    
    # 東方紺珠伝 (4キャラクター: Legacy特化)
    TOUHOU_15_LoLK = (86, 89)
    
    # 東方天空璋 (16キャラクター: 4キャラ×4サブシーズン)
    TOUHOU_16_HSiFS = (90, 105)
    
    # 東方鬼形獣 (9キャラクター: 3キャラ×3アニマルスピリット)
    TOUHOU_17_WBaWC = (106, 114)
    
    # 東方虹龍洞 (12キャラクター: アビリティカード主要組み合わせ)
    TOUHOU_18_UM = (115, 126)
    
    # 東方獣王園 (4キャラクター: カード戦略型)
    TOUHOU_19_UDoALG = (127, 130)
    
    # 東方錦上京 (2キャラクター: 霊夢・魔理沙×異変石システム)
    TOUHOU_20_UDoKJ = (131, 132)
    
    # デフォルト範囲（基本4キャラクター）
    DEFAULT = (19, 22)

# キャラクター数定数
class CharacterCounts:
    """ゲーム別キャラクター数の定数クラス"""
    TOUHOU_06_EOSD = 4      # 霊夢A/B, 魔理沙A/B
    TOUHOU_07_PCB = 6       # + 咲夜A/B
    TOUHOU_08_IN = 12       # タッグシステム対応
    TOUHOU_09_POV = 16      # 対戦型STG
    TOUHOU_10_MOF = 6       # 霊夢×3, 魔理沙×3
    TOUHOU_11_SA = 6        # パートナーシステム
    TOUHOU_12_UFO = 6       # 3キャラ×2ショット
    TOUHOU_128_FW = 1       # チルノのみ
    TOUHOU_13_TD = 4        # 固定ショット
    TOUHOU_14_DDC = 6       # 3キャラ×2ショット
    TOUHOU_15_LoLK = 4      # Legacy特化
    TOUHOU_16_HSiFS = 16    # 4キャラ×4サブシーズン
    TOUHOU_17_WBaWC = 9     # 3キャラ×3アニマルスピリット
    TOUHOU_18_UM = 12       # アビリティカード組み合わせ
    TOUHOU_19_UDoALG = 4    # カード戦略型
    TOUHOU_20_UDoKJ = 2     # 異変石システム（霊夢・魔理沙）
    DEFAULT = 4             # 基本構成

# ゲーム固有設定
class GameSpecificSettings:
    """ゲーム固有の設定定数"""
    
    # 妖々夢のシリーズ番号（Phantasm難易度が利用可能）
    PCB_SERIES_NUMBER = 7
    
    # 難易度設定
    PHANTASM_AVAILABLE_GAMES = [GameIds.TOUHOU_07_PCB]

# キャラクターマッピング
GAME_CHARACTER_MAPPING = {
    GameIds.TOUHOU_06_EOSD: CharacterRanges.TOUHOU_06_EOSD,
    GameIds.TOUHOU_07_PCB: CharacterRanges.TOUHOU_07_PCB,
    GameIds.TOUHOU_08_IN: CharacterRanges.TOUHOU_08_IN,
    GameIds.TOUHOU_09_POV: CharacterRanges.TOUHOU_09_POV,
    GameIds.TOUHOU_10_MOF: CharacterRanges.TOUHOU_10_MOF,
    GameIds.TOUHOU_11_SA: CharacterRanges.TOUHOU_11_SA,
    GameIds.TOUHOU_12_UFO: CharacterRanges.TOUHOU_12_UFO,
    GameIds.TOUHOU_128_FW: CharacterRanges.TOUHOU_128_FW,
    GameIds.TOUHOU_13_TD: CharacterRanges.TOUHOU_13_TD,
    GameIds.TOUHOU_14_DDC: CharacterRanges.TOUHOU_14_DDC,
    GameIds.TOUHOU_15_LoLK: CharacterRanges.TOUHOU_15_LoLK,
    GameIds.TOUHOU_16_HSiFS: CharacterRanges.TOUHOU_16_HSiFS,
    GameIds.TOUHOU_17_WBaWC: CharacterRanges.TOUHOU_17_WBaWC,
    GameIds.TOUHOU_18_UM: CharacterRanges.TOUHOU_18_UM,
    GameIds.TOUHOU_19_UDoALG: CharacterRanges.TOUHOU_19_UDoALG,
    GameIds.TOUHOU_20_UDoKJ: CharacterRanges.TOUHOU_20_UDoKJ,
}

def get_character_range_for_game(game_id: int) -> tuple[int, int]:
    """
    ゲームIDに対応するキャラクター範囲を取得
    
    Args:
        game_id: ゲームID
    
    Returns:
        tuple: (開始ID, 終了ID)のタプル
    """
    return GAME_CHARACTER_MAPPING.get(game_id, CharacterRanges.DEFAULT)

def get_character_count_for_game(game_id: int) -> int:
    """
    ゲームIDに対応するキャラクター数を取得
    
    Args:
        game_id: ゲームID
    
    Returns:
        int: キャラクター数
    """
    start_id, end_id = get_character_range_for_game(game_id)
    return end_id - start_id + 1


# ゲームモード関連定数
class GameModes:
    """ゲームモードの定数クラス"""
    NORMAL = "normal"                   # 通常モード（全ゲーム共通）
    LEGACY = "legacy"                   # レガシーモード（紺珠伝）
    POINTDEVICE = "pointdevice"         # 完全無欠モード（紺珠伝）


class GameSpecificSettings:
    """ゲーム固有設定の定数クラス"""
    
    # モード対応ゲーム
    MODE_AVAILABLE_GAMES = [GameIds.TOUHOU_15_LoLK]  # 紺珠伝のみ
    
    # 紺珠伝のモード設定
    LOLK_MODES = [GameModes.LEGACY, GameModes.POINTDEVICE]
    
    # 紺珠伝のモード別難易度設定
    LOLK_DIFFICULTY_SETTINGS = {
        GameModes.LEGACY: ["Easy", "Normal", "Hard", "Lunatic", "Extra"],
        GameModes.POINTDEVICE: ["Easy", "Normal", "Hard", "Lunatic"]  # Extraなし
    }


def is_mode_available_for_game(game_id: int) -> bool:
    """
    指定ゲームでモード選択が利用可能かチェック
    
    Args:
        game_id: ゲームID
    
    Returns:
        bool: モード選択が利用可能な場合True
    """
    return game_id in GameSpecificSettings.MODE_AVAILABLE_GAMES


def get_available_modes_for_game(game_id: int) -> list[str]:
    """
    指定ゲームで利用可能なモード一覧を取得
    
    Args:
        game_id: ゲームID
    
    Returns:
        list[str]: 利用可能なモード一覧
    """
    if game_id == GameIds.TOUHOU_15_LoLK:
        return GameSpecificSettings.LOLK_MODES
    return [GameModes.NORMAL]


def get_available_difficulties_for_game_and_mode(game_id: int, mode: str) -> list[str]:
    """
    指定ゲーム・モードで利用可能な難易度一覧を取得
    
    Args:
        game_id: ゲームID
        mode: ゲームモード
    
    Returns:
        list[str]: 利用可能な難易度一覧
    """
    if game_id == GameIds.TOUHOU_15_LoLK and mode in GameSpecificSettings.LOLK_MODES:
        return GameSpecificSettings.LOLK_DIFFICULTY_SETTINGS[mode]
    
    # 通常ゲームのデフォルト難易度
    # 獣王園（19番）はExtraなし、妖々夢（7番）はPhantasmあり
    base_difficulties = ["Easy", "Normal", "Hard", "Lunatic"]
    
    # 獣王園以外はExtra追加
    if game_id != GameIds.TOUHOU_19_UDoALG:
        base_difficulties.append("Extra")
    
    # 妖々夢はPhantasm追加
    if game_id == GameIds.TOUHOU_07_PCB:
        base_difficulties.append("Phantasm")
    
    return base_difficulties