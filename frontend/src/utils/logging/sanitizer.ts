/**
 * セキュリティサニタイザーモジュール
 *
 * ログ出力時に機密情報（パスワード、トークン、APIキー等）を
 * 自動的にマスキングし、セキュリティリスクを低減します。
 */

/**
 * サニタイズ対象となる機密情報のキー名パターン
 */
const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'pwd',
  'token',
  'api_key',
  'apikey',
  'secret',
  'authorization',
  'auth',
  'access_token',
  'refresh_token',
  'session',
  'sessionid',
  'cookie',
  'csrf',
  'private_key',
  'privatekey',
  'email',
  'email_address',
  'mail',
  'credit_card',
  'card_number',
  'cvv',
  'ssn'
];

/**
 * 機密情報パターン（正規表現）
 * グローバルフラグ付きで複数マッチに対応
 */
const SENSITIVE_PATTERNS = [
  // JWT トークン形式
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  // Bearer トークン
  /Bearer\s+[A-Za-z0-9_\-.]{20,}/gi,
  // メールアドレス形式
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // API キー形式（sk_live_等のプレフィックス + 32文字以上の英数字）
  /\b(sk_|pk_|api_)?[A-Za-z0-9_-]{32,}\b/g
];

/**
 * マスキング文字列
 */
const MASK_STRING = '***MASKED***';

/**
 * オブジェクトが機密情報を含むかどうかを判定
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));
}

/**
 * 文字列が機密情報パターンにマッチするかチェック
 */
function matchesSensitivePattern(value: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * 文字列内の機密情報パターンをマスキング
 */
function sanitizeString(value: string): string {
  let sanitized = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, MASK_STRING);
  }
  return sanitized;
}

/**
 * 値をサニタイズ（機密情報をマスキング）
 */
function sanitizeValue(value: any): any {
  // プリミティブ型の処理
  if (value === null || value === undefined) {
    return value;
  }

  // 文字列の場合は機密情報パターンをチェック
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  // 配列の場合は再帰的に処理
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  // オブジェクトの場合は各プロパティを検査
  if (typeof value === 'object') {
    const sanitized: any = {};
    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = MASK_STRING;
      } else {
        sanitized[key] = sanitizeValue(val);
      }
    }
    return sanitized;
  }

  // その他の型（数値、真偽値等）はそのまま返す
  return value;
}

/**
 * ログデータをサニタイズ
 *
 * @param data ログに出力するデータ
 * @returns サニタイズされたデータ
 */
export function sanitizeLogData(data: any): any {
  return sanitizeValue(data);
}

/**
 * エラーオブジェクトをサニタイズ
 *
 * @param error エラーオブジェクト
 * @returns サニタイズされたエラー情報
 */
export function sanitizeError(error: any): any {
  if (!error) {
    return null;
  }

  const sanitized: any = {
    message: error.message || String(error),
    name: error.name,
    stack: error.stack
  };

  // エラーの追加プロパティもサニタイズ
  if (error.response) {
    sanitized.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: sanitizeValue(error.response.data)
    };
  }

  if (error.config) {
    sanitized.config = {
      url: error.config.url,
      method: error.config.method,
      // headersやdataは機密情報を含む可能性があるため完全にマスク
      headers: MASK_STRING,
      data: MASK_STRING
    };
  }

  return sanitized;
}

/**
 * HTTPリクエストデータをサニタイズ
 *
 * @param requestData リクエストデータ
 * @returns サニタイズされたリクエストデータ
 */
export function sanitizeRequestData(requestData: any): any {
  if (!requestData) {
    return null;
  }

  return {
    url: requestData.url,
    method: requestData.method,
    // headers内の認証情報をマスク
    headers: requestData.headers ? { ...requestData.headers, Authorization: MASK_STRING } : undefined,
    // bodyデータをサニタイズ
    data: sanitizeValue(requestData.data)
  };
}
