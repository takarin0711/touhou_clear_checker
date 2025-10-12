/**
 * gameFeatureConstants.ts のテスト
 */
import { SPECIAL_CLEAR_SERIES_NUMBERS } from './gameFeatureConstants';

describe('gameFeatureConstants', () => {
  describe('SPECIAL_CLEAR_SERIES_NUMBERS', () => {
    describe('SPECIAL_CLEAR_1_GAMES', () => {
      it('特殊クリア条件1を持つゲームのシリーズ番号が正しく定義されている', () => {
        const expected = [7.0, 12.0, 12.8, 13.0, 16.0, 17.0, 18.0, 20.0];
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toEqual(expected);
      });

      it('妖々夢(7.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(7.0);
      });

      it('星蓮船(12.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(12.0);
      });

      it('妖精大戦争(12.8)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(12.8);
      });

      it('神霊廟(13.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(13.0);
      });

      it('天空璋(16.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(16.0);
      });

      it('鬼形獣(17.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(17.0);
      });

      it('虹龍洞(18.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(18.0);
      });

      it('錦上京(20.0)が含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toContain(20.0);
      });

      it('配列の長さが8である', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).toHaveLength(8);
      });

      it('紅魔郷(6.0)は含まれない', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).not.toContain(6.0);
      });

      it('永夜抄(8.0)は含まれない', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).not.toContain(8.0);
      });

      it('紺珠伝(15.0)は含まれない', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES).not.toContain(15.0);
      });
    });

    describe('SPECIAL_CLEAR_2_GAMES', () => {
      it('特殊クリア条件2を持つゲームのシリーズ番号が正しく定義されている', () => {
        const expected = [17.0];
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES).toEqual(expected);
      });

      it('鬼形獣(17.0)のみが含まれる', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES).toContain(17.0);
      });

      it('配列の長さが1である', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES).toHaveLength(1);
      });

      it('錦上京(20.0)は含まれない', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES).not.toContain(20.0);
      });

      it('虹龍洞(18.0)は含まれない', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES).not.toContain(18.0);
      });
    });

    describe('配列の型安全性', () => {
      it('SPECIAL_CLEAR_1_GAMESは配列型である', () => {
        expect(Array.isArray(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES)).toBe(true);
      });

      it('SPECIAL_CLEAR_2_GAMESは配列型である', () => {
        expect(Array.isArray(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES)).toBe(true);
      });

      it('SPECIAL_CLEAR_SERIES_NUMBERSオブジェクトのプロパティが存在する', () => {
        expect(SPECIAL_CLEAR_SERIES_NUMBERS).toHaveProperty('SPECIAL_CLEAR_1_GAMES');
        expect(SPECIAL_CLEAR_SERIES_NUMBERS).toHaveProperty('SPECIAL_CLEAR_2_GAMES');
      });
    });

    describe('データの整合性', () => {
      it('SPECIAL_CLEAR_1_GAMESとSPECIAL_CLEAR_2_GAMESに重複はない（鬼形獣は両方に含まれる）', () => {
        const clear1 = SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES;
        const clear2 = SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES;

        // 鬼形獣(17.0)は両方に含まれることを確認
        expect(clear1).toContain(17.0);
        expect(clear2).toContain(17.0);

        // clear2の全要素がclear1にも含まれることを確認
        clear2.forEach(seriesNum => {
          expect(clear1).toContain(seriesNum);
        });
      });

      it('SPECIAL_CLEAR_1_GAMESの値はすべてユニーク', () => {
        const uniqueValues = Array.from(new Set(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES));
        expect(uniqueValues.length).toBe(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES.length);
      });

      it('SPECIAL_CLEAR_2_GAMESの値はすべてユニーク', () => {
        const uniqueValues = Array.from(new Set(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES));
        expect(uniqueValues.length).toBe(SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES.length);
      });

      it('すべてのシリーズ番号は正の数値', () => {
        SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES.forEach(seriesNum => {
          expect(seriesNum).toBeGreaterThan(0);
        });
        SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES.forEach(seriesNum => {
          expect(seriesNum).toBeGreaterThan(0);
        });
      });

      it('すべてのシリーズ番号は妥当な範囲内（6.0-20.0）', () => {
        SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES.forEach(seriesNum => {
          expect(seriesNum).toBeGreaterThanOrEqual(6.0);
          expect(seriesNum).toBeLessThanOrEqual(20.0);
        });
        SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES.forEach(seriesNum => {
          expect(seriesNum).toBeGreaterThanOrEqual(6.0);
          expect(seriesNum).toBeLessThanOrEqual(20.0);
        });
      });
    });
  });
});
