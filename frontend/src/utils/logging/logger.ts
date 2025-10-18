/**
 * 構造化ロガーモジュール
 *
 * タイムスタンプ、ログレベル、メッセージ、コンテキスト情報を含む
 * 構造化されたログを出力します。機密情報は自動的にマスキングされます。
 */

import { LogLevel, getLogConfig, getLogLevelName, isLogLevelEnabled } from './logConfig';
import { sanitizeLogData, sanitizeError } from './sanitizer';

/**
 * ログエントリーの構造
 */
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  error?: any;
}

/**
 * ログレベルごとの色設定（開発環境のみ）
 */
const LOG_COLORS = {
  DEBUG: '\x1b[36m',    // Cyan
  INFO: '\x1b[32m',     // Green
  WARN: '\x1b[33m',     // Yellow
  ERROR: '\x1b[31m',    // Red
  RESET: '\x1b[0m'
};

/**
 * 現在のタイムスタンプをISO 8601形式で取得
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * ログエントリーをフォーマット
 */
function formatLogEntry(entry: LogEntry): string {
  const config = getLogConfig();
  const levelName = entry.level.toUpperCase().padEnd(5);

  let formattedLog = '';

  // カラーコードの適用（開発環境のみ）
  if (config.enableColor) {
    const color = LOG_COLORS[entry.level as keyof typeof LOG_COLORS] || LOG_COLORS.RESET;
    formattedLog += color;
  }

  // タイムスタンプ
  if (config.enableTimestamp) {
    formattedLog += `[${entry.timestamp}] `;
  }

  // ログレベル
  formattedLog += `[${levelName}] `;

  // メッセージ
  formattedLog += entry.message;

  // カラーリセット（開発環境のみ）
  if (config.enableColor) {
    formattedLog += LOG_COLORS.RESET;
  }

  return formattedLog;
}

/**
 * ログを出力
 */
function writeLog(level: LogLevel, message: string, context?: Record<string, any>, error?: any): void {
  if (!isLogLevelEnabled(level)) {
    return;
  }

  const config = getLogConfig();
  if (!config.enableConsole) {
    return;
  }

  const levelName = getLogLevelName(level);
  const entry: LogEntry = {
    timestamp: getCurrentTimestamp(),
    level: levelName,
    message,
    context: context ? sanitizeLogData(context) : undefined,
    error: error ? sanitizeError(error) : undefined
  };

  const formattedMessage = formatLogEntry(entry);

  // コンソール出力（ログレベルに応じた適切なメソッドを使用）
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, entry.context || '', entry.error || '');
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, entry.context || '', entry.error || '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, entry.context || '', entry.error || '');
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, entry.context || '', entry.error || '');
      break;
    default:
      console.log(formattedMessage, entry.context || '', entry.error || '');
  }
}

/**
 * ロガークラス
 */
export class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * DEBUGレベルのログを出力
   */
  debug(message: string, context?: Record<string, any>): void {
    writeLog(LogLevel.DEBUG, `[${this.name}] ${message}`, context);
  }

  /**
   * INFOレベルのログを出力
   */
  info(message: string, context?: Record<string, any>): void {
    writeLog(LogLevel.INFO, `[${this.name}] ${message}`, context);
  }

  /**
   * WARNレベルのログを出力
   */
  warn(message: string, context?: Record<string, any>): void {
    writeLog(LogLevel.WARN, `[${this.name}] ${message}`, context);
  }

  /**
   * ERRORレベルのログを出力
   */
  error(message: string, error?: any, context?: Record<string, any>): void {
    writeLog(LogLevel.ERROR, `[${this.name}] ${message}`, context, error);
  }

  /**
   * API呼び出しのログを出力
   */
  logApiCall(method: string, url: string, params?: any): void {
    this.debug(`API Call: ${method.toUpperCase()} ${url}`, {
      method,
      url,
      params: params ? sanitizeLogData(params) : undefined
    });
  }

  /**
   * API成功レスポンスのログを出力
   */
  logApiSuccess(method: string, url: string, status: number, data?: any): void {
    this.info(`API Success: ${method.toUpperCase()} ${url}`, {
      method,
      url,
      status,
      data: data ? sanitizeLogData(data) : undefined
    });
  }

  /**
   * APIエラーレスポンスのログを出力
   */
  logApiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error, {
      method,
      url
    });
  }
}

/**
 * ロガーインスタンスを作成
 */
export function createLogger(name: string): Logger {
  return new Logger(name);
}

/**
 * デフォルトロガー（名前なし）
 */
export const logger = new Logger('App');
