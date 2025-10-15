"""
リクエストトレーシングミドルウェア

すべてのHTTPリクエストにリクエストIDを割り当て、
パフォーマンス測定とログ記録を行います。
"""
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from infrastructure.logging.context import RequestContext
from infrastructure.logging.logger import LoggerFactory
from infrastructure.logging.constants import LoggingConstants


logger = LoggerFactory.get_logger(__name__)


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """
    リクエストトレーシングミドルウェア

    各HTTPリクエストに対して以下の処理を行います:
    1. リクエストIDの生成・設定
    2. リクエスト開始ログの記録
    3. パフォーマンス測定（レスポンスタイム）
    4. リクエスト完了ログの記録
    5. コンテキストのクリーンアップ
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        リクエストごとの処理

        Args:
            request: HTTPリクエスト
            call_next: 次のミドルウェア/ハンドラー

        Returns:
            HTTPレスポンス
        """
        # リクエストID生成・設定
        request_id = RequestContext.generate_request_id()
        RequestContext.set_request_id(request_id)

        # リクエスト情報
        method = request.method
        path = request.url.path
        client_host = request.client.host if request.client else "unknown"

        # リクエスト開始ログ
        logger.info(
            f"Request started: {method} {path}",
            extra={
                LoggingConstants.JSON_KEY_EXTRA: {
                    LoggingConstants.JSON_KEY_REQUEST_ID: request_id,
                    LoggingConstants.JSON_KEY_REQUEST_METHOD: method,
                    LoggingConstants.JSON_KEY_REQUEST_PATH: path,
                    LoggingConstants.JSON_KEY_IP_ADDRESS: client_host,
                }
            }
        )

        # パフォーマンス測定開始
        start_time = time.time()

        try:
            # 次のミドルウェア/ハンドラーを実行
            response = await call_next(request)

            # レスポンスタイム計算（ミリ秒）
            response_time_ms = round((time.time() - start_time) * 1000, 2)

            # レスポンスヘッダーにリクエストIDを追加
            response.headers["X-Request-ID"] = request_id

            # リクエスト完了ログ
            logger.info(
                f"Request completed: {method} {path} - {response.status_code}",
                extra={
                    LoggingConstants.JSON_KEY_EXTRA: {
                        LoggingConstants.JSON_KEY_REQUEST_ID: request_id,
                        LoggingConstants.JSON_KEY_REQUEST_METHOD: method,
                        LoggingConstants.JSON_KEY_REQUEST_PATH: path,
                        LoggingConstants.JSON_KEY_STATUS_CODE: response.status_code,
                        LoggingConstants.JSON_KEY_RESPONSE_TIME: response_time_ms,
                        LoggingConstants.JSON_KEY_IP_ADDRESS: client_host,
                    }
                }
            )

            return response

        except Exception as e:
            # エラー時もレスポンスタイム計算
            response_time_ms = round((time.time() - start_time) * 1000, 2)

            # エラーログ記録
            logger.error(
                f"Request failed: {method} {path} - {type(e).__name__}: {str(e)}",
                extra={
                    LoggingConstants.JSON_KEY_EXTRA: {
                        LoggingConstants.JSON_KEY_REQUEST_ID: request_id,
                        LoggingConstants.JSON_KEY_REQUEST_METHOD: method,
                        LoggingConstants.JSON_KEY_REQUEST_PATH: path,
                        LoggingConstants.JSON_KEY_RESPONSE_TIME: response_time_ms,
                        LoggingConstants.JSON_KEY_IP_ADDRESS: client_host,
                        "exception_type": type(e).__name__,
                        "exception_message": str(e),
                    }
                },
                exc_info=True
            )

            # 例外を再スロー
            raise

        finally:
            # コンテキストクリーンアップ
            RequestContext.clear()
