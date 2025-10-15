"""
例外ハンドラーミドルウェア
"""
import traceback
from typing import Callable
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from infrastructure.logging.logger import LoggerFactory
from infrastructure.logging.exceptions import (
    ApplicationException,
    NotFoundException,
    ValidationException,
    DuplicateException,
    AuthenticationException,
    AuthorizationException,
    DatabaseException,
    ExternalServiceException
)

logger = LoggerFactory.get_logger(__name__)


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """グローバル例外ハンドラーミドルウェア"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        リクエスト処理中の例外をキャッチしてログに記録し、適切なレスポンスを返す
        """
        try:
            response = await call_next(request)
            return response

        except NotFoundException as e:
            return self._handle_not_found_exception(e)

        except ValidationException as e:
            return self._handle_validation_exception(e)

        except DuplicateException as e:
            return self._handle_duplicate_exception(e)

        except AuthenticationException as e:
            return self._handle_authentication_exception(e)

        except AuthorizationException as e:
            return self._handle_authorization_exception(e)

        except DatabaseException as e:
            return self._handle_database_exception(e)

        except ExternalServiceException as e:
            return self._handle_external_service_exception(e)

        except ApplicationException as e:
            return self._handle_application_exception(e)

        except ValueError as e:
            # ValueError は既存コードで多用されているため、個別にハンドリング
            logger.warning(f"ValueError occurred: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "Bad Request",
                    "message": str(e),
                    "error_code": "VALUE_ERROR"
                }
            )

        except Exception as e:
            # 予期しない例外の場合
            return self._handle_unexpected_exception(e, request)

    def _handle_not_found_exception(self, exc: NotFoundException) -> JSONResponse:
        """NotFoundExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": "Not Found",
                "message": exc.message,
                "error_code": exc.error_code,
                "details": exc.details
            }
        )

    def _handle_validation_exception(self, exc: ValidationException) -> JSONResponse:
        """ValidationExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "Validation Error",
                "message": exc.message,
                "error_code": exc.error_code,
                "details": exc.details
            }
        )

    def _handle_duplicate_exception(self, exc: DuplicateException) -> JSONResponse:
        """DuplicateExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": "Duplicate Error",
                "message": exc.message,
                "error_code": exc.error_code,
                "details": exc.details
            }
        )

    def _handle_authentication_exception(self, exc: AuthenticationException) -> JSONResponse:
        """AuthenticationExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "Authentication Error",
                "message": exc.message,
                "error_code": exc.error_code
            }
        )

    def _handle_authorization_exception(self, exc: AuthorizationException) -> JSONResponse:
        """AuthorizationExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "error": "Authorization Error",
                "message": exc.message,
                "error_code": exc.error_code
            }
        )

    def _handle_database_exception(self, exc: DatabaseException) -> JSONResponse:
        """DatabaseExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Database Error",
                "message": "An error occurred while accessing the database",
                "error_code": exc.error_code
            }
        )

    def _handle_external_service_exception(self, exc: ExternalServiceException) -> JSONResponse:
        """ExternalServiceExceptionのハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "error": "External Service Error",
                "message": "An error occurred while communicating with external service",
                "error_code": exc.error_code
            }
        )

    def _handle_application_exception(self, exc: ApplicationException) -> JSONResponse:
        """ApplicationException（基底クラス）のハンドリング"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Application Error",
                "message": exc.message,
                "error_code": exc.error_code or "APPLICATION_ERROR"
            }
        )

    def _handle_unexpected_exception(self, exc: Exception, request: Request) -> JSONResponse:
        """予期しない例外のハンドリング"""
        # スタックトレースをログに記録
        error_traceback = traceback.format_exc()
        logger.error(
            f"Unexpected exception occurred: {type(exc).__name__}: {str(exc)}",
            extra={
                "extra": {
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                    "traceback": error_traceback,
                    "request_path": request.url.path,
                    "request_method": request.method
                }
            }
        )

        # 本番環境では詳細なエラー情報を隠す
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred",
                "error_code": "INTERNAL_SERVER_ERROR"
            }
        )
