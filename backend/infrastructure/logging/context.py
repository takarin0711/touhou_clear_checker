"""
リクエストコンテキスト管理

リクエストID、ユーザー情報等をコンテキスト変数として管理し、
ログに自動的に含めることができます。
"""
import uuid
from contextvars import ContextVar
from typing import Optional


# リクエストごとのコンテキスト変数
request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
user_id_var: ContextVar[Optional[int]] = ContextVar("user_id", default=None)
username_var: ContextVar[Optional[str]] = ContextVar("username", default=None)


class RequestContext:
    """リクエストコンテキスト管理クラス"""

    @staticmethod
    def generate_request_id() -> str:
        """
        一意のリクエストIDを生成

        Returns:
            UUID形式のリクエストID
        """
        return str(uuid.uuid4())

    @staticmethod
    def set_request_id(request_id: str) -> None:
        """
        リクエストIDをコンテキストに設定

        Args:
            request_id: リクエストID
        """
        request_id_var.set(request_id)

    @staticmethod
    def get_request_id() -> Optional[str]:
        """
        現在のリクエストIDを取得

        Returns:
            リクエストID（設定されていない場合はNone）
        """
        return request_id_var.get()

    @staticmethod
    def set_user_info(user_id: Optional[int], username: Optional[str]) -> None:
        """
        ユーザー情報をコンテキストに設定

        Args:
            user_id: ユーザーID
            username: ユーザー名
        """
        if user_id is not None:
            user_id_var.set(user_id)
        if username is not None:
            username_var.set(username)

    @staticmethod
    def get_user_id() -> Optional[int]:
        """
        現在のユーザーIDを取得

        Returns:
            ユーザーID（設定されていない場合はNone）
        """
        return user_id_var.get()

    @staticmethod
    def get_username() -> Optional[str]:
        """
        現在のユーザー名を取得

        Returns:
            ユーザー名（設定されていない場合はNone）
        """
        return username_var.get()

    @staticmethod
    def clear() -> None:
        """コンテキスト情報をクリア（リクエスト終了時に呼び出し）"""
        request_id_var.set(None)
        user_id_var.set(None)
        username_var.set(None)
