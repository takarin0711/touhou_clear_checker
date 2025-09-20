"""
クリア条件関連の定数定義
"""
from domain.constants.game_constants import GameIds


# 基本クリア条件
class BasicClearConditions:
    """基本的なクリア条件（全作品共通）"""
    CLEARED = "cleared"                 # 基本クリア
    NO_CONTINUE = "no_continue"         # ノーコンティニュー
    NO_BOMB = "no_bomb"                 # ノーボム
    NO_MISS = "no_miss"                 # ノーミス
    FULL_SPELL_CARD = "full_spell_card" # フルスペルカード取得


# 特殊クリア条件定義
class SpecialClearConditions:
    """作品固有の特殊クリア条件"""
    
    # 天空璋特有条件
    NO_SEASON_RELEASE = "no_season_release"    # ノー季節解放
    NO_SUB_SEASON = "no_sub_season"            # ノーサブシーズン使用
    
    # 輝針城特有条件
    NO_REVERSE_USE = "no_reverse_use"          # ノーリバース使用
    
    # 鬼形獣特有条件
    NO_ROARING_MODE = "no_roaring_mode"        # ノーロアリング
    SINGLE_ANIMAL_SPIRIT = "single_animal"     # 単一アニマルスピリット
    
    # 虹龍洞特有条件
    NO_ABILITY_CARD = "no_ability_card"        # ノーアビリティカード
    BASIC_SETUP_ONLY = "basic_setup_only"      # 基本装備のみ
    
    # 獣王園特有条件
    NO_CARD_UPGRADE = "no_card_upgrade"        # ノーカードアップグレード
    STARTER_DECK_ONLY = "starter_deck_only"    # スターターデッキのみ
    
    # 錦上京特有条件
    NO_HENKA_STONE = "no_henka_stone"          # ノー異変石
    BASIC_STONE_ONLY = "basic_stone_only"      # 基本異変石のみ


# 作品別特殊条件マッピング
GAME_SPECIAL_CONDITIONS = {
    GameIds.TOUHOU_14_DDC: {
        "special_1": {
            "key": SpecialClearConditions.NO_REVERSE_USE,
            "display_name": "ノーリバース",
            "description": "ひっくり返り弾幕を使用せずにクリア"
        }
    },
    
    GameIds.TOUHOU_16_HSiFS: {
        "special_1": {
            "key": SpecialClearConditions.NO_SEASON_RELEASE,
            "display_name": "ノー季節解放",
            "description": "シーズンリリースを使用せずにクリア"
        },
        "special_2": {
            "key": SpecialClearConditions.NO_SUB_SEASON,
            "display_name": "ノーサブシーズン",
            "description": "サブシーズンを変更せずにクリア"
        }
    },
    
    GameIds.TOUHOU_17_WBaWC: {
        "special_1": {
            "key": SpecialClearConditions.NO_ROARING_MODE,
            "display_name": "ノーロアリング",
            "description": "ローリングモードを発動せずにクリア"
        },
        "special_2": {
            "key": SpecialClearConditions.SINGLE_ANIMAL_SPIRIT,
            "display_name": "単一アニマル",
            "description": "1種類のアニマルスピリットのみでクリア"
        }
    },
    
    GameIds.TOUHOU_18_UM: {
        "special_1": {
            "key": SpecialClearConditions.NO_ABILITY_CARD,
            "display_name": "ノーアビリティカード",
            "description": "アビリティカードを使用せずにクリア"
        },
        "special_2": {
            "key": SpecialClearConditions.BASIC_SETUP_ONLY,
            "display_name": "基本装備のみ",
            "description": "初期装備のみでクリア"
        }
    },
    
    GameIds.TOUHOU_19_UDoALG: {
        "special_1": {
            "key": SpecialClearConditions.NO_CARD_UPGRADE,
            "display_name": "ノーカード強化",
            "description": "カードアップグレードを使用せずにクリア"
        },
        "special_2": {
            "key": SpecialClearConditions.STARTER_DECK_ONLY,
            "display_name": "初期デッキのみ",
            "description": "スターターデッキのみでクリア"
        }
    },
    
    GameIds.TOUHOU_20_UDoKJ: {
        "special_1": {
            "key": SpecialClearConditions.NO_HENKA_STONE,
            "display_name": "ノー異変石",
            "description": "異変石を装備せずにクリア"
        },
        "special_2": {
            "key": SpecialClearConditions.BASIC_STONE_ONLY,
            "display_name": "基本異変石のみ",
            "description": "基本異変石のみでクリア"
        }
    }
}


def get_special_conditions_for_game(game_id: int) -> dict:
    """
    ゲームIDに対応する特殊条件を取得
    
    Args:
        game_id: ゲームID
    
    Returns:
        dict: 特殊条件の辞書（special_1, special_2, special_3キーを含む）
    """
    return GAME_SPECIAL_CONDITIONS.get(game_id, {})


def get_all_clear_conditions_for_game(game_id: int) -> list:
    """
    ゲーム用の全クリア条件を取得（基本＋特殊）
    
    Args:
        game_id: ゲームID
    
    Returns:
        list: クリア条件のリスト
    """
    conditions = [
        {
            "key": BasicClearConditions.CLEARED,
            "display_name": "クリア",
            "description": "通常クリア"
        },
        {
            "key": BasicClearConditions.NO_CONTINUE,
            "display_name": "ノーコン",
            "description": "コンティニュー未使用でクリア"
        },
        {
            "key": BasicClearConditions.NO_BOMB,
            "display_name": "ノーボム",
            "description": "ボム未使用でクリア"
        },
        {
            "key": BasicClearConditions.NO_MISS,
            "display_name": "ノーミス",
            "description": "ミス0でクリア"
        },
        {
            "key": BasicClearConditions.FULL_SPELL_CARD,
            "display_name": "フルスペカ",
            "description": "全スペルカード取得"
        }
    ]
    
    # 特殊条件を追加
    special_conditions = get_special_conditions_for_game(game_id)
    for i in range(1, 4):  # special_1, special_2, special_3
        key = f"special_{i}"
        if key in special_conditions:
            conditions.append(special_conditions[key])
    
    return conditions


def is_special_condition_available(game_id: int, special_key: str) -> bool:
    """
    特定のゲームで特殊条件が利用可能かチェック
    
    Args:
        game_id: ゲームID
        special_key: 特殊条件キー（special_1, special_2, special_3）
    
    Returns:
        bool: 利用可能かどうか
    """
    special_conditions = get_special_conditions_for_game(game_id)
    return special_key in special_conditions