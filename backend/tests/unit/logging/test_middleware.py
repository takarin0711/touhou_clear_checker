"""
リクエストトレーシングミドルウェアのテスト
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi import Request, Response
from infrastructure.logging.middleware import RequestTracingMiddleware
from infrastructure.logging.context import RequestContext


class TestRequestTracingMiddleware:
    """RequestTracingMiddlewareのテストクラス"""

    @pytest.mark.asyncio
    async def test_middleware_sets_request_id(self):
        """ミドルウェアがリクエストIDを設定すること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"

        mock_response = Response(status_code=200)
        call_next = AsyncMock(return_value=mock_response)

        # Act
        response = await middleware.dispatch(mock_request, call_next)

        # Assert
        # レスポンスヘッダーにリクエストIDが含まれている
        assert "X-Request-ID" in response.headers
        assert len(response.headers["X-Request-ID"]) > 0

    @pytest.mark.asyncio
    async def test_middleware_logs_request_start(self):
        """ミドルウェアがリクエスト開始をログに記録すること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "POST"
        mock_request.url.path = "/api/v1/users"
        mock_request.client = Mock()
        mock_request.client.host = "192.168.1.1"

        mock_response = Response(status_code=201)
        call_next = AsyncMock(return_value=mock_response)

        # Act
        with patch("infrastructure.logging.middleware.logger") as mock_logger:
            await middleware.dispatch(mock_request, call_next)

            # Assert
            # リクエスト開始ログが記録されている
            assert mock_logger.info.call_count >= 1
            first_call_args = mock_logger.info.call_args_list[0]
            assert "Request started" in first_call_args[0][0]

    @pytest.mark.asyncio
    async def test_middleware_logs_request_completion(self):
        """ミドルウェアがリクエスト完了をログに記録すること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/games"
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"

        mock_response = Response(status_code=200)
        call_next = AsyncMock(return_value=mock_response)

        # Act
        with patch("infrastructure.logging.middleware.logger") as mock_logger:
            await middleware.dispatch(mock_request, call_next)

            # Assert
            # リクエスト完了ログが記録されている
            assert mock_logger.info.call_count >= 2
            second_call_args = mock_logger.info.call_args_list[1]
            assert "Request completed" in second_call_args[0][0]
            assert "200" in second_call_args[0][0]

    @pytest.mark.asyncio
    async def test_middleware_measures_response_time(self):
        """ミドルウェアがレスポンスタイムを測定すること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"

        mock_response = Response(status_code=200)
        call_next = AsyncMock(return_value=mock_response)

        # Act
        with patch("infrastructure.logging.middleware.logger") as mock_logger:
            await middleware.dispatch(mock_request, call_next)

            # Assert
            # 完了ログにレスポンスタイムが含まれている
            completion_log_call = mock_logger.info.call_args_list[1]
            extra_data = completion_log_call[1]["extra"]["extra"]
            assert "response_time_ms" in extra_data
            assert isinstance(extra_data["response_time_ms"], (int, float))
            assert extra_data["response_time_ms"] >= 0

    @pytest.mark.asyncio
    async def test_middleware_logs_exception(self):
        """ミドルウェアが例外をログに記録すること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/error"
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"

        test_exception = ValueError("Test error")
        call_next = AsyncMock(side_effect=test_exception)

        # Act & Assert
        with patch("infrastructure.logging.middleware.logger") as mock_logger:
            with pytest.raises(ValueError):
                await middleware.dispatch(mock_request, call_next)

            # エラーログが記録されている
            mock_logger.error.assert_called_once()
            error_call_args = mock_logger.error.call_args
            assert "Request failed" in error_call_args[0][0]
            assert "ValueError" in error_call_args[0][0]

    @pytest.mark.asyncio
    async def test_middleware_clears_context_after_request(self):
        """ミドルウェアがリクエスト後にコンテキストをクリアすること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"

        mock_response = Response(status_code=200)
        call_next = AsyncMock(return_value=mock_response)

        # Act
        await middleware.dispatch(mock_request, call_next)

        # Assert
        # コンテキストがクリアされている
        assert RequestContext.get_request_id() is None
        assert RequestContext.get_user_id() is None
        assert RequestContext.get_username() is None

    @pytest.mark.asyncio
    async def test_middleware_clears_context_even_on_exception(self):
        """ミドルウェアが例外発生時でもコンテキストをクリアすること"""
        # Arrange
        middleware = RequestTracingMiddleware(app=Mock())
        mock_request = Mock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/error"
        mock_request.client = Mock()
        mock_request.client.host = "127.0.0.1"

        test_exception = RuntimeError("Test error")
        call_next = AsyncMock(side_effect=test_exception)

        # Act
        with pytest.raises(RuntimeError):
            await middleware.dispatch(mock_request, call_next)

        # Assert
        # 例外発生時でもコンテキストがクリアされている
        assert RequestContext.get_request_id() is None
        assert RequestContext.get_user_id() is None
        assert RequestContext.get_username() is None
