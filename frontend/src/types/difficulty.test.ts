import { 
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  BASE_DIFFICULTY_ORDER,
  DIFFICULTY_ORDER,
  getDifficultyOrderForGameBySeries
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

  describe('getDifficultyOrderForGameBySeries', () => {
    describe('nullゲーム', () => {
      it('nullの場合は基本難易度を返す', () => {
        const result = getDifficultyOrderForGameBySeries(null);
        expect(result).toEqual(BASE_DIFFICULTY_ORDER);
      });
    });

    describe('紺珠伝（シリーズ番号: 15）', () => {
      const lolkGame = { series_number: 15 };

      it('レガシーモードではExtra難易度を含む', () => {
        const result = getDifficultyOrderForGameBySeries(lolkGame, 'legacy');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });

      it('完全無欠モードではExtra難易度を除外', () => {
        const result = getDifficultyOrderForGameBySeries(lolkGame, 'pointdevice');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC
        ];
        expect(result).toEqual(expected);
      });

      it('デフォルトモード（normal）では基本難易度にExtraを含む', () => {
        const result = getDifficultyOrderForGameBySeries(lolkGame);
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

    describe('妖々夢（シリーズ番号: 7）', () => {
      const pcbGame = { series_number: 7 };

      it('Phantasm難易度を含む', () => {
        const result = getDifficultyOrderForGameBySeries(pcbGame);
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

      it('文字列のシリーズ番号でも正しく動作する', () => {
        const pcbGameStr = { series_number: '7.0' };
        const result = getDifficultyOrderForGameBySeries(pcbGameStr);
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

    describe('獣王園（シリーズ番号: 19）', () => {
      const udoalgGame = { series_number: 19 };

      it('Extra難易度を除外する', () => {
        const result = getDifficultyOrderForGameBySeries(udoalgGame);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC
        ];
        expect(result).toEqual(expected);
      });

      it('文字列のシリーズ番号でも正しく動作する', () => {
        const udoalgGameStr = { series_number: '19.0' };
        const result = getDifficultyOrderForGameBySeries(udoalgGameStr);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC
        ];
        expect(result).toEqual(expected);
      });
    });

    describe('その他のゲーム', () => {
      const gameIds = [6, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 20];

      gameIds.forEach(seriesNumber => {
        it(`シリーズ番号 ${seriesNumber} では基本難易度にExtraを含む`, () => {
          const game = { series_number: seriesNumber };
          const result = getDifficultyOrderForGameBySeries(game);
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
      it('存在しないシリーズ番号では基本難易度にExtraを含む', () => {
        const game = { series_number: 999 };
        const result = getDifficultyOrderForGameBySeries(game);
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
        const game = { series_number: 15 };
        const result = getDifficultyOrderForGameBySeries(game, 'unknown');
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });

      it('小数点付きシリーズ番号でも正しく処理される', () => {
        const game = { series_number: 7.5 }; // 萃夢想
        const result = getDifficultyOrderForGameBySeries(game);
        const expected = [
          DIFFICULTIES.EASY,
          DIFFICULTIES.NORMAL,
          DIFFICULTIES.HARD,
          DIFFICULTIES.LUNATIC,
          DIFFICULTIES.EXTRA
        ];
        expect(result).toEqual(expected);
      });

      it('文字列の小数点シリーズ番号も正しく処理される', () => {
        const game = { series_number: '12.8' }; // 妖精大戦争
        const result = getDifficultyOrderForGameBySeries(game);
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

    describe('型安全性のテスト', () => {
      it('series_numberが数値型でも文字列型でも同じ結果を返す', () => {
        const gameNum = { series_number: 15 };
        const gameStr = { series_number: '15' };
        const gameFloat = { series_number: '15.0' };
        
        const resultNum = getDifficultyOrderForGameBySeries(gameNum);
        const resultStr = getDifficultyOrderForGameBySeries(gameStr);
        const resultFloat = getDifficultyOrderForGameBySeries(gameFloat);
        
        expect(resultNum).toEqual(resultStr);
        expect(resultStr).toEqual(resultFloat);
      });
    });
  });
});