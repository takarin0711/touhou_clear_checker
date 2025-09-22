export interface Game {
  id: number;
  title: string;
  series_number: number;
  release_year: number;
  game_type: string;
}

export interface GameListResponse {
  games: Game[];
}

export interface GameFilter {
  series_number?: number | null;
  game_type?: string | null;
  search?: string | null;
}

export const GAME_TYPES = {
  MAIN_SERIES: 'main_series',
  SPIN_OFF_STG: 'spin_off_stg',
  FIGHTING: 'fighting',
  PHOTOGRAPHY: 'photography',
  MIXED: 'mixed',
  VERSUS: 'versus',
};

export const GAME_TYPE_LABELS = {
  [GAME_TYPES.MAIN_SERIES]: '本編STG',
  [GAME_TYPES.SPIN_OFF_STG]: '外伝STG',
  [GAME_TYPES.FIGHTING]: '格闘ゲーム',
  [GAME_TYPES.PHOTOGRAPHY]: '撮影STG',
  [GAME_TYPES.MIXED]: '格闘+STG',
  [GAME_TYPES.VERSUS]: '対戦型STG',
};

