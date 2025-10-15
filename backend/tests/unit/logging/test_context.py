"""
リクエストコンテキストのテスト
"""
import pytest
from infrastructure.logging.context import RequestContext


class TestRequestContext:
    """RequestContextのテストクラス"""

    def setup_method(self):
        """各テスト前にコンテキストをクリア"""
        RequestContext.clear()

    def teardown_method(self):
        """各テスト後にコンテキストをクリア"""
        RequestContext.clear()

    def test_generate_request_id(self):
        """リクエストIDが生成されること"""
        request_id = RequestContext.generate_request_id()

        assert request_id is not None
        assert isinstance(request_id, str)
        assert len(request_id) > 0

    def test_generate_request_id_unique(self):
        """生成されるリクエストIDが一意であること"""
        request_id1 = RequestContext.generate_request_id()
        request_id2 = RequestContext.generate_request_id()

        assert request_id1 != request_id2

    def test_set_and_get_request_id(self):
        """リクエストIDの設定・取得が正しく動作すること"""
        test_request_id = "test-request-id-123"
        RequestContext.set_request_id(test_request_id)

        retrieved_id = RequestContext.get_request_id()
        assert retrieved_id == test_request_id

    def test_get_request_id_when_not_set(self):
        """リクエストIDが設定されていない場合はNoneが返ること"""
        request_id = RequestContext.get_request_id()
        assert request_id is None

    def test_set_and_get_user_info(self):
        """ユーザー情報の設定・取得が正しく動作すること"""
        test_user_id = 123
        test_username = "testuser"

        RequestContext.set_user_info(test_user_id, test_username)

        assert RequestContext.get_user_id() == test_user_id
        assert RequestContext.get_username() == test_username

    def test_set_user_info_with_none_values(self):
        """Noneを含むユーザー情報を設定してもエラーにならないこと"""
        RequestContext.set_user_info(None, None)

        # エラーが発生しないことを確認
        assert RequestContext.get_user_id() is None
        assert RequestContext.get_username() is None

    def test_set_user_info_partial(self):
        """ユーザーIDのみまたはユーザー名のみ設定できること"""
        # ユーザーIDのみ設定
        RequestContext.set_user_info(456, None)
        assert RequestContext.get_user_id() == 456
        assert RequestContext.get_username() is None

        # クリア
        RequestContext.clear()

        # ユーザー名のみ設定
        RequestContext.set_user_info(None, "anotheruser")
        assert RequestContext.get_user_id() is None
        assert RequestContext.get_username() == "anotheruser"

    def test_clear_context(self):
        """clearメソッドでコンテキストがクリアされること"""
        # コンテキストに情報を設定
        RequestContext.set_request_id("test-id")
        RequestContext.set_user_info(789, "cleartest")

        # クリア実行
        RequestContext.clear()

        # すべてNoneになっていることを確認
        assert RequestContext.get_request_id() is None
        assert RequestContext.get_user_id() is None
        assert RequestContext.get_username() is None

    def test_context_isolation_between_tests(self):
        """テスト間でコンテキストが分離されていること"""
        # このテストで設定した値が次のテストに影響しないことを確認
        RequestContext.set_request_id("isolation-test")
        RequestContext.set_user_info(999, "isolationuser")

        # 値が設定されていることを確認
        assert RequestContext.get_request_id() == "isolation-test"
        assert RequestContext.get_user_id() == 999
        assert RequestContext.get_username() == "isolationuser"

        # teardown_methodでクリアされるため、次のテストでは影響しない
