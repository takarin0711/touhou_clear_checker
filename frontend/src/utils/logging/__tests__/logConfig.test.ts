/**
 * ログ設定の単体テスト
 */

import { LogLevel, getLogConfig, getLogLevelName, isLogLevelEnabled } from '../logConfig';

describe('logConfig', () => {
  describe('getLogLevelName', () => {
    test('各ログレベルの名前が正しく返されること', () => {
      expect(getLogLevelName(LogLevel.DEBUG)).toBe('DEBUG');
      expect(getLogLevelName(LogLevel.INFO)).toBe('INFO');
      expect(getLogLevelName(LogLevel.WARN)).toBe('WARN');
      expect(getLogLevelName(LogLevel.ERROR)).toBe('ERROR');
      expect(getLogLevelName(LogLevel.OFF)).toBe('OFF');
    });

    test('未知のログレベルの場合UNKNOWNが返されること', () => {
      expect(getLogLevelName(999 as LogLevel)).toBe('UNKNOWN');
    });
  });

  describe('getLogConfig', () => {
    test('ログ設定が取得できること', () => {
      const config = getLogConfig();

      expect(config).toHaveProperty('level');
      expect(config).toHaveProperty('enableConsole');
      expect(config).toHaveProperty('enableTimestamp');
      expect(config).toHaveProperty('enableColor');
      expect(config).toHaveProperty('dateFormat');
    });

    test('コンソール出力が有効であること', () => {
      const config = getLogConfig();
      expect(config.enableConsole).toBe(true);
    });

    test('タイムスタンプが有効であること', () => {
      const config = getLogConfig();
      expect(config.enableTimestamp).toBe(true);
    });
  });

  describe('isLogLevelEnabled', () => {
    test('ログレベルが有効かどうか判定されること', () => {
      // 現在の設定レベルを取得
      const config = getLogConfig();
      const currentLevel = config.level;

      // 現在のレベル以上のログは有効
      expect(isLogLevelEnabled(currentLevel)).toBe(true);

      // ERRORレベルは常に有効（OFFでない限り）
      if (currentLevel !== LogLevel.OFF) {
        expect(isLogLevelEnabled(LogLevel.ERROR)).toBe(true);
      }
    });

    test('DEBUGレベルの判定が正しいこと', () => {
      const config = getLogConfig();

      if (config.level <= LogLevel.DEBUG) {
        expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(true);
      } else {
        expect(isLogLevelEnabled(LogLevel.DEBUG)).toBe(false);
      }
    });

    test('OFFレベルは常に有効であること', () => {
      // OFFレベル自体はログを出力しないが、判定としては有効
      expect(isLogLevelEnabled(LogLevel.OFF)).toBe(true);
    });
  });

  describe('LogLevel列挙型', () => {
    test('ログレベルが正しい優先順位を持つこと', () => {
      expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
      expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
      expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
      expect(LogLevel.ERROR).toBeLessThan(LogLevel.OFF);
    });
  });
});
