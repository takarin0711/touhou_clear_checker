/**
 * ログ設定モジュール
 *
 * 環境変数からログレベルとフォーマット設定を読み込み、
 * アプリケーション全体のロギング動作を制御します。
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4
}

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableTimestamp: boolean;
  enableColor: boolean;
  dateFormat: string;
}

/**
 * 環境変数からログレベルを解析
 */
function parseLogLevel(level: string | undefined): LogLevel {
  if (!level) {
    return process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  const upperLevel = level.toUpperCase();
  switch (upperLevel) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    case 'OFF':
      return LogLevel.OFF;
    default:
      console.warn(`Invalid log level: ${level}, using default`);
      return process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }
}

/**
 * デフォルトログ設定
 */
const defaultConfig: LogConfig = {
  level: parseLogLevel(process.env.REACT_APP_LOG_LEVEL),
  enableConsole: true,
  enableTimestamp: true,
  enableColor: process.env.NODE_ENV !== 'production',
  dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};

/**
 * 現在のログ設定を取得
 */
export function getLogConfig(): LogConfig {
  return { ...defaultConfig };
}

/**
 * ログレベルの文字列表現を取得
 */
export function getLogLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.ERROR:
      return 'ERROR';
    case LogLevel.OFF:
      return 'OFF';
    default:
      return 'UNKNOWN';
  }
}

/**
 * 指定したログレベルが有効かどうかを判定
 */
export function isLogLevelEnabled(level: LogLevel): boolean {
  return level >= defaultConfig.level;
}
