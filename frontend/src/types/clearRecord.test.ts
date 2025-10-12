/**
 * clearRecord.ts のユーティリティ関数のテスト
 */
import {
  getSpecialClearLabel,
  getSpecialClearDescription,
  getClearConditionsForGameType,
  CLEAR_CONDITIONS
} from './clearRecord';

describe('clearRecord utility functions', () => {
  describe('getSpecialClearLabel', () => {
    it('妖々夢(ID:2)のspecial_clear_1は"ノー結界"を返す', () => {
      expect(getSpecialClearLabel(2, 'special_clear_1')).toBe('ノー結界');
    });

    it('星蓮船(ID:7)のspecial_clear_1は"ノーベントラー"を返す', () => {
      expect(getSpecialClearLabel(7, 'special_clear_1')).toBe('ノーベントラー');
    });

    it('妖精大戦争(ID:8)のspecial_clear_1は"ノーアイス"を返す', () => {
      expect(getSpecialClearLabel(8, 'special_clear_1')).toBe('ノーアイス');
    });

    it('神霊廟(ID:9)のspecial_clear_1は"ノートランス"を返す', () => {
      expect(getSpecialClearLabel(9, 'special_clear_1')).toBe('ノートランス');
    });

    it('天空璋(ID:12)のspecial_clear_1は"ノー季節解放"を返す', () => {
      expect(getSpecialClearLabel(12, 'special_clear_1')).toBe('ノー季節解放');
    });

    it('鬼形獣(ID:13)のspecial_clear_1は"ノー暴走"を返す', () => {
      expect(getSpecialClearLabel(13, 'special_clear_1')).toBe('ノー暴走');
    });

    it('鬼形獣(ID:13)のspecial_clear_2は"ノー霊撃"を返す', () => {
      expect(getSpecialClearLabel(13, 'special_clear_2')).toBe('ノー霊撃');
    });

    it('虹龍洞(ID:14)のspecial_clear_1は"ノーカード"を返す', () => {
      expect(getSpecialClearLabel(14, 'special_clear_1')).toBe('ノーカード');
    });

    it('錦上京(ID:16)のspecial_clear_1は"ノー霊撃"を返す', () => {
      expect(getSpecialClearLabel(16, 'special_clear_1')).toBe('ノー霊撃');
    });

    it('未定義のゲームIDはデフォルト値を返す', () => {
      expect(getSpecialClearLabel(999, 'special_clear_1')).toBe('特殊条件1');
    });

    it('未定義のspecialTypeはデフォルト値を返す', () => {
      expect(getSpecialClearLabel(13, 'special_clear_3')).toBe('特殊条件3');
    });
  });

  describe('getSpecialClearDescription', () => {
    it('妖々夢(ID:2)のspecial_clear_1は"結界を使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(2, 'special_clear_1')).toBe('結界を使用せずにクリア');
    });

    it('星蓮船(ID:7)のspecial_clear_1は"ベントラーを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(7, 'special_clear_1')).toBe('ベントラーを使用せずにクリア');
    });

    it('妖精大戦争(ID:8)のspecial_clear_1は"アイスバリアを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(8, 'special_clear_1')).toBe('アイスバリアを使用せずにクリア');
    });

    it('神霊廟(ID:9)のspecial_clear_1は"トランスを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(9, 'special_clear_1')).toBe('トランスを使用せずにクリア');
    });

    it('天空璋(ID:12)のspecial_clear_1は"シーズンリリースを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(12, 'special_clear_1')).toBe('シーズンリリースを使用せずにクリア');
    });

    it('鬼形獣(ID:13)のspecial_clear_1は"ロアリングモードを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(13, 'special_clear_1')).toBe('ロアリングモードを使用せずにクリア');
    });

    it('鬼形獣(ID:13)のspecial_clear_2は"ハイパーモードを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(13, 'special_clear_2')).toBe('ハイパーモードを使用せずにクリア');
    });

    it('虹龍洞(ID:14)のspecial_clear_1は"アビリティカードを使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(14, 'special_clear_1')).toBe('アビリティカードを使用せずにクリア');
    });

    it('錦上京(ID:16)のspecial_clear_1は"霊撃を使用せずにクリア"を返す', () => {
      expect(getSpecialClearDescription(16, 'special_clear_1')).toBe('霊撃を使用せずにクリア');
    });

    it('未定義のゲームIDはデフォルト値を返す', () => {
      expect(getSpecialClearDescription(999, 'special_clear_1')).toBe('特殊クリア条件1');
    });

    it('未定義のspecialTypeはデフォルト値を返す', () => {
      expect(getSpecialClearDescription(13, 'special_clear_3')).toBe('特殊クリア条件3');
    });
  });

  describe('getClearConditionsForGameType', () => {
    it('通常ゲーム（対戦型以外）は基本条件のみを返す', () => {
      const conditions = getClearConditionsForGameType('main_series', 1);
      expect(conditions).toEqual([
        CLEAR_CONDITIONS.CLEARED,
        CLEAR_CONDITIONS.NO_CONTINUE,
        CLEAR_CONDITIONS.NO_BOMB,
        CLEAR_CONDITIONS.NO_MISS,
        CLEAR_CONDITIONS.FULL_SPELL_CARD
      ]);
    });

    it('対戦型ゲームはフルスペカなしの条件を返す', () => {
      const conditions = getClearConditionsForGameType('versus', 4);
      expect(conditions).toEqual([
        CLEAR_CONDITIONS.CLEARED,
        CLEAR_CONDITIONS.NO_CONTINUE,
        CLEAR_CONDITIONS.NO_BOMB,
        CLEAR_CONDITIONS.NO_MISS
      ]);
    });

    it('妖々夢(ID:2)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 2);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('星蓮船(ID:7)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 7);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('妖精大戦争(ID:8)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 8);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('神霊廟(ID:9)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 9);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('天空璋(ID:12)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 12);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('鬼形獣(ID:13)はspecial_clear_1とspecial_clear_2を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 13);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_2);
      expect(conditions.length).toBe(7);
    });

    it('虹龍洞(ID:14)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 14);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('錦上京(ID:16)はspecial_clear_1を含む', () => {
      const conditions = getClearConditionsForGameType('main_series', 16);
      expect(conditions).toContain(CLEAR_CONDITIONS.SPECIAL_CLEAR_1);
      expect(conditions.length).toBe(6);
    });

    it('gameIdがnullの場合は基本条件のみを返す', () => {
      const conditions = getClearConditionsForGameType('main_series', null);
      expect(conditions).toEqual([
        CLEAR_CONDITIONS.CLEARED,
        CLEAR_CONDITIONS.NO_CONTINUE,
        CLEAR_CONDITIONS.NO_BOMB,
        CLEAR_CONDITIONS.NO_MISS,
        CLEAR_CONDITIONS.FULL_SPELL_CARD
      ]);
    });
  });
});
