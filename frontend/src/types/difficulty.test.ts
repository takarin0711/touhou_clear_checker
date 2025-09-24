import { 
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  BASE_DIFFICULTY_ORDER,
  DIFFICULTY_ORDER,
  getDifficultyOrderForGame
} from './difficulty';

describe('difficulty utilities', () => {
  describe('定数の検証', () => {
    it('DIFFICULTIES定数が正しい値を持つ', () => {
      expect(DIFFICULTIES.EASY).toBe('Easy');
      expect(DIFFICULTIES.NORMAL).toBe('Normal');
      expect(DIFFICULTIES.HARD).toBe('Hard');
      expect(DIFFICULTIES.LUNATIC).toBe('Lunatic');
      expect(DIFFICULTIES.EXTRA).toBe('Extra');
      expect(DIFFICULTIES.PHANTASM).toBe('Phantasm');
    });

    it('DIFFICULTY_LABELS定数がDIFFICULTIESと一致する', () => {
      expect(DIFFICULTY_LABELS[DIFFICULTIES.EASY]).toBe('Easy');
      expect(DIFFICULTY_LABELS[DIFFICULTIES.NORMAL]).toBe('Normal');
      expect(DIFFICULTY_LABELS[DIFFICULTIES.HARD]).toBe('Hard');
      expect(DIFFICULTY_LABELS[DIFFICULTIES.LUNATIC]).toBe('Lunatic');
      expect(DIFFICULTY_LABELS[DIFFICULTIES.EXTRA]).toBe('Extra');
      expect(DIFFICULTY_LABELS[DIFFICULTIES.PHANTASM]).toBe('Phantasm');
    });

    it('DIFFICULTY_COLORS定数が適切な色を持つ', () => {
      expect(DIFFICULTY_COLORS[DIFFICULTIES.EASY]).toBe('green');
      expect(DIFFICULTY_COLORS[DIFFICULTIES.NORMAL]).toBe('blue');
      expect(DIFFICULTY_COLORS[DIFFICULTIES.HARD]).toBe('red');
      expect(DIFFICULTY_COLORS[DIFFICULTIES.LUNATIC]).toBe('pink');
      expect(DIFFICULTY_COLORS[DIFFICULTIES.EXTRA]).toBe('purple');
      expect(DIFFICULTY_COLORS[DIFFICULTIES.PHANTASM]).toBe('purple');
    });

    it('BASE_DIFFICULTY_ORDER定数が正しい順序を持つ', () => {
      const expected = [
        DIFFICULTIES.EASY,
        DIFFICULTIES.NORMAL,
        DIFFICULTIES.HARD,
        DIFFICULTIES.LUNATIC,
        DIFFICULTIES.EXTRA
      ];
      expect(BASE_DIFFICULTY_ORDER).toEqual(expected);
    });

    it('DIFFICULTY_ORDER定数が全難易度を含む', () => {
      const expected = [
        DIFFICULTIES.EASY,
        DIFFICULTIES.NORMAL,
        DIFFICULTIES.HARD,
        DIFFICULTIES.LUNATIC,
        DIFFICULTIES.EXTRA,
        DIFFICULTIES.PHANTASM
      ];
      expect(DIFFICULTY_ORDER).toEqual(expected);
    });
  });

  describe('getDifficultyOrderForGame', () => {
    it('gameがnullの場合は基本難易度を返す', () => {
      const result = getDifficultyOrderForGame(null);
      expect(result).toEqual(BASE_DIFFICULTY_ORDER);
    });

    it('通常のゲームでは基本難易度にExtraを含む', () => {
      const game = { id: 1 }; // 東方紅魔郷
      const result = getDifficultyOrderForGame(game);
      const expected = [
        DIFFICULTIES.EASY,
        DIFFICULTIES.NORMAL,
        DIFFICULTIES.HARD,
        DIFFICULTIES.LUNATIC,
        DIFFICULTIES.EXTRA
      ];
      expect(result).toEqual(expected);
    });

    describe('妖々夢（ID: 2）の特殊ケース', () => {
      it('Phantasm難易度が追加される', () => {
        const game = { id: 2 }; // 東方妖々夢
        const result = getDifficultyOrderForGame(game);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA,
          DIFFICULTIES.PHANTASM
        ];
        expect(result).toEqual(expected);
      });
    });

    describe('紺珠伝（ID: 11）の特殊モード対応', () => {
      it('normalモードでは基本難易度にExtraを含む', () => {
        const game = { id: 11 }; // 東方紺珠伝
        const result = getDifficultyOrderForGame(game, 'normal');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });

      it('legacyモードでは基本難易度にExtraを含む', () => {
        const game = { id: 11 }; // 東方紺珠伝
        const result = getDifficultyOrderForGame(game, 'legacy');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });

      it('pointdeviceモードではExtraなしの基本難易度のみ', () => {
        const game = { id: 11 }; // 東方紺珠伝
        const result = getDifficultyOrderForGame(game, 'pointdevice');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC
        ];
        expect(result).toEqual(expected);
      });
    });

    describe('獣王園（ID: 15）の特殊ケース', () => {
      it('Extra難易度が除外される', () => {
        const game = { id: 15 }; // 東方獣王園
        const result = getDifficultyOrderForGame(game);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC
        ];
        expect(result).toEqual(expected);
      });
    });

    describe('妖精大戦争（ID: 8）', () => {
      it('通常の基本難易度にExtraが含まれる', () => {
        const game = { id: 8 }; // 妖精大戦争
        const result = getDifficultyOrderForGame(game);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });
    });

    describe('その他のゲーム', () => {
      const gameIds = [3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 16]; // 一般的なゲームID

      gameIds.forEach(gameId => {
        it(`ゲームID ${gameId} では基本難易度にExtraを含む`, () => {
          const game = { id: gameId };
          const result = getDifficultyOrderForGame(game);
          const expected = [
            DIFFICULTIES.EASY,
            DIFFICULTIES.NORMAL,
            DIFFICULTIES.HARD,
            DIFFICULTIES.LUNATIC,
            DIFFICULTIES.EXTRA
          ];
          expect(result).toEqual(expected);
        });
      });
    });

    describe('エッジケース', () => {
      it('存在しないゲームIDでは基本難易度にExtraを含む', () => {
        const game = { id: 999 };
        const result = getDifficultyOrderForGame(game);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });

      it('紺珠伝で不明なモードの場合は基本難易度にExtraを含む', () => {
        const game = { id: 11 };
        const result = getDifficultyOrderForGame(game, 'unknown');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });
    });
  });
});