/**
 * ゲーム関連の定数定義
 */

/**
 * ゲームIDの定数
 */
export const GAME_IDS = {
  TOUHOU_06_EOSD: 1,    // 東方紅魔郷 (Embodiment of Scarlet Devil)
  TOUHOU_07_PCB: 2,     // 東方妖々夢 (Perfect Cherry Blossom)
  TOUHOU_08_IN: 3,      // 東方永夜抄 (Imperishable Night)
  TOUHOU_09_PoFV: 4,    // 東方花映塚 (Phantasmagoria of Flower View)
  TOUHOU_15_LoLK: 11,   // 東方紺珠伝 (Legacy of Lunatic Kingdom)
  TOUHOU_19_UDoALG: 15, // 東方獣王園 (Unfinished Dream of All Living Ghost)
};

/**
 * シリーズ番号の定数
 */
export const SERIES_NUMBERS = {
  TOUHOU_06_EOSD: 6,    // 東方紅魔郷
  TOUHOU_07_PCB: 7,     // 東方妖々夢
  TOUHOU_08_IN: 8,      // 東方永夜抄
};

/**
 * ゲーム固有設定の定数
 */
export const GAME_SPECIFIC_SETTINGS = {
  // Phantasm難易度が利用可能なシリーズ番号
  PHANTASM_AVAILABLE_SERIES: [SERIES_NUMBERS.TOUHOU_07_PCB],
  
  // 各ゲームの期待キャラクター数
  EXPECTED_CHARACTER_COUNTS: {
    [GAME_IDS.TOUHOU_06_EOSD]: 4,     // 霊夢A/B, 魔理沙A/B
    [GAME_IDS.TOUHOU_07_PCB]: 6,      // + 咲夜A/B
    [GAME_IDS.TOUHOU_08_IN]: 12,      // タッグシステム対応
  }
};

/**
 * ゲームメタデータ
 */
export const GAME_METADATA = {
  [GAME_IDS.TOUHOU_06_EOSD]: {
    id: GAME_IDS.TOUHOU_06_EOSD,
    series_number: SERIES_NUMBERS.TOUHOU_06_EOSD,
    title: '東方紅魔郷',
    subtitle: 'Embodiment of Scarlet Devil',
    expected_characters: 4,
    has_phantasm: false
  },
  [GAME_IDS.TOUHOU_07_PCB]: {
    id: GAME_IDS.TOUHOU_07_PCB,
    series_number: SERIES_NUMBERS.TOUHOU_07_PCB,
    title: '東方妖々夢',
    subtitle: 'Perfect Cherry Blossom',
    expected_characters: 6,
    has_phantasm: true
  },
  [GAME_IDS.TOUHOU_08_IN]: {
    id: GAME_IDS.TOUHOU_08_IN,
    series_number: SERIES_NUMBERS.TOUHOU_08_IN,
    title: '東方永夜抄',
    subtitle: 'Imperishable Night',
    expected_characters: 12,
    has_phantasm: false
  }
};

/**
 * シリーズ番号がPhantasm難易度に対応しているかチェック
 * @param {number} seriesNumber - シリーズ番号
 * @returns {boolean} Phantasm難易度が利用可能な場合true
 */
export const isPhantasmAvailable = (seriesNumber) => {
  return GAME_SPECIFIC_SETTINGS.PHANTASM_AVAILABLE_SERIES.includes(seriesNumber);
};

/**
 * ゲームIDから期待キャラクター数を取得
 * @param {number} gameId - ゲームID
 * @returns {number} 期待キャラクター数
 */
export const getExpectedCharacterCount = (gameId) => {
  return GAME_SPECIFIC_SETTINGS.EXPECTED_CHARACTER_COUNTS[gameId] || 4;
};

/**
 * ゲームメタデータを取得
 * @param {number} gameId - ゲームID
 * @returns {Object|null} ゲームメタデータ、存在しない場合はnull
 */
export const getGameMetadata = (gameId) => {
  return GAME_METADATA[gameId] || null;
};

/**
 * ゲームモード関連定数
 */
export const GAME_MODES = {
  NORMAL: 'normal',           // 通常モード（全ゲーム共通）
  LEGACY: 'legacy',           // レガシーモード（紺珠伝）
  POINTDEVICE: 'pointdevice'  // 完全無欠モード（紺珠伝）
};

/**
 * ゲームモードラベル
 */
export const GAME_MODE_LABELS = {
  [GAME_MODES.NORMAL]: '通常',
  [GAME_MODES.LEGACY]: 'レガシーモード',
  [GAME_MODES.POINTDEVICE]: '完全無欠モード'
};

/**
 * 紺珠伝固有設定
 */
export const LOLK_SETTINGS = {
  GAME_ID: 11,  // TOUHOU_15_LoLK
  SERIES_NUMBER: 15,
  MODES: [GAME_MODES.LEGACY, GAME_MODES.POINTDEVICE],
  DIFFICULTY_SETTINGS: {
    [GAME_MODES.LEGACY]: ['Easy', 'Normal', 'Hard', 'Lunatic', 'Extra'],
    [GAME_MODES.POINTDEVICE]: ['Easy', 'Normal', 'Hard', 'Lunatic']  // Extraなし
  }
};

/**
 * 指定ゲームでモード選択が利用可能かチェック
 * @param {number} gameId - ゲームID
 * @returns {boolean} モード選択が利用可能な場合true
 */
export const isModeAvailableForGame = (gameId) => {
  return gameId === LOLK_SETTINGS.GAME_ID;
};

/**
 * 指定ゲームで利用可能なモード一覧を取得
 * @param {number} gameId - ゲームID
 * @returns {Array} 利用可能なモード一覧
 */
export const getAvailableModesForGame = (gameId) => {
  if (gameId === LOLK_SETTINGS.GAME_ID) {
    return LOLK_SETTINGS.MODES;
  }
  return [GAME_MODES.NORMAL];
};

/**
 * 指定ゲーム・モードで利用可能な難易度一覧を取得
 * @param {number} gameId - ゲームID
 * @param {string} mode - ゲームモード
 * @returns {Array} 利用可能な難易度一覧
 */
export const getAvailableDifficultiesForGameAndMode = (gameId, mode) => {
  if (gameId === LOLK_SETTINGS.GAME_ID && LOLK_SETTINGS.MODES.includes(mode)) {
    return LOLK_SETTINGS.DIFFICULTY_SETTINGS[mode];
  }
  
  // 通常ゲームのデフォルト難易度
  const baseDifficulties = ['Easy', 'Normal', 'Hard', 'Lunatic'];
  
  // 獣王園以外はExtra追加
  if (gameId !== GAME_IDS.TOUHOU_19_UDoALG) {
    baseDifficulties.push('Extra');
  }
  
  // 妖々夢はPhantasm追加  
  if (gameId === GAME_IDS.TOUHOU_07_PCB) {
    baseDifficulties.push('Phantasm');
  }
  
  return baseDifficulties;
};

/**
 * 対戦型STGかどうかを判定
 * @param {number} gameId - ゲームID
 * @returns {boolean} 対戦型STGの場合true
 */
export const isVersusGame = (gameId) => {
  const versusGameIds = [
    GAME_IDS.TOUHOU_09_PoFV,   // 東方花映塚
    GAME_IDS.TOUHOU_19_UDoALG  // 東方獣王園
  ];
  return versusGameIds.includes(gameId);
};

/**
 * フルスペカが利用可能かどうかを判定
 * @param {number} gameId - ゲームID
 * @returns {boolean} フルスペカが利用可能な場合true
 */
export const isFullSpellCardAvailable = (gameId) => {
  // 対戦型STGはフルスペカなし
  return !isVersusGame(gameId);
};

/**
 * ノーコンティニューが利用可能かどうかを判定
 * @param {number} gameId - ゲームID
 * @param {string} mode - ゲームモード
 * @param {string} difficulty - 難易度（オプション）
 * @returns {boolean} ノーコンティニューが利用可能な場合true
 */
export const isNoContinueAvailable = (gameId, mode, difficulty = null) => {
  // 紺珠伝の完全無欠モードはチェックポイント制なのでノーコン概念なし
  if (gameId === GAME_IDS.TOUHOU_15_LoLK && mode === GAME_MODES.POINTDEVICE) {
    return false;
  }
  
  // Extra/Phantasmステージはコンティニューできない仕様なのでノーコン概念なし
  if (difficulty === 'Extra' || difficulty === 'Phantasm') {
    return false;
  }
  
  return true;
};