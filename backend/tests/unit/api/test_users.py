"""
ユーザーAPIの単体テスト
"""
import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from presentation.api.v1.users import (
    register_user,
    login,
    get_current_user_info,
    update_current_user,
    delete_current_user,
    verify_email,
    resend_verification_email
)
from domain.entities.user import User
from application.dtos.user_dto import UserResponseDto, TokenResponseDto
from presentation.schemas.user_schema import UserCreate, UserUpdate, EmailVerificationRequest, ResendVerificationRequest


class TestUsersAPI:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_user_service = Mock()
        
        # サンプルユーザー
        self.sample_user = User(
            id=1,
            username="test_user",
            email="test@example.com",
            hashed_password="hashed_password",
            email_verified=True,
            is_active=True,
            is_admin=False,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1)
        )
        
        # サンプルユーザーDTO
        self.sample_user_dto = UserResponseDto(
            id=1,
            username="test_user",
            email="test@example.com",
            is_active=True,
            is_admin=False,
            email_verified=True,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 1)
        )
        
        # サンプルトークンDTO
        self.sample_token_dto = TokenResponseDto(
            access_token="sample_token",
            token_type="bearer"
        )

    def test_register_user_success(self):
        """ユーザー登録成功のテスト"""
        # Arrange
        user_data = UserCreate(
            username="new_user",
            email="new@example.com",
            password="password123"
        )
        self.mock_user_service.create_user.return_value = self.sample_user_dto
        
        with patch('infrastructure.security.jwt_handler.JWTHandler') as mock_jwt_class:
            mock_jwt = Mock()
            mock_jwt_class.return_value = mock_jwt
            mock_jwt.create_access_token.return_value = "new_access_token"
            
            # Act
            result = register_user(
                user_data=user_data,
                user_service=self.mock_user_service
            )
            
            # Assert
            assert result.access_token == "new_access_token"
            assert result.token_type == "bearer"
            assert result.user.username == "test_user"
            assert result.user.email == "test@example.com"
            self.mock_user_service.create_user.assert_called_once()
            mock_jwt.create_access_token.assert_called_once_with(data={"sub": "test_user"})
    
    def test_register_user_value_error(self):
        """ユーザー登録でのValueErrorテスト"""
        # Arrange
        user_data = UserCreate(
            username="duplicate_user",
            email="duplicate@example.com",
            password="password123"
        )
        self.mock_user_service.create_user.side_effect = ValueError("Username already exists")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            register_user(
                user_data=user_data,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Username already exists"
    
    def test_login_success(self):
        """ログイン成功のテスト"""
        # Arrange
        form_data = OAuth2PasswordRequestForm(username="test_user", password="password123")
        self.mock_user_service.authenticate_user.return_value = self.sample_token_dto
        self.mock_user_service.get_user_by_username.return_value = self.sample_user_dto
        
        # Act
        result = login(
            form_data=form_data,
            user_service=self.mock_user_service
        )
        
        # Assert
        assert result.access_token == "sample_token"
        assert result.token_type == "bearer"
        assert result.user.username == "test_user"
        self.mock_user_service.authenticate_user.assert_called_once()
        self.mock_user_service.get_user_by_username.assert_called_once_with("test_user")
    
    def test_login_authentication_failed(self):
        """認証失敗のテスト"""
        # Arrange
        form_data = OAuth2PasswordRequestForm(username="test_user", password="wrong_password")
        self.mock_user_service.authenticate_user.side_effect = ValueError("Invalid credentials")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            login(
                form_data=form_data,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid credentials"
    
    def test_login_user_not_found_after_auth(self):
        """認証後ユーザー取得失敗のテスト"""
        # Arrange
        form_data = OAuth2PasswordRequestForm(username="test_user", password="password123")
        self.mock_user_service.authenticate_user.return_value = self.sample_token_dto
        self.mock_user_service.get_user_by_username.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            login(
                form_data=form_data,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "User not found"
    
    def test_get_current_user_info(self):
        """現在のユーザー情報取得のテスト"""
        # Act
        result = get_current_user_info(current_user=self.sample_user)
        
        # Assert
        assert result.id == 1
        assert result.username == "test_user"
        assert result.email == "test@example.com"
        assert result.is_active == True
        assert result.is_admin == False
        assert result.email_verified == True
    
    def test_update_current_user_success(self):
        """現在のユーザー更新成功のテスト"""
        # Arrange
        user_data = UserUpdate(
            username="updated_user",
            email="updated@example.com",
            is_active=True
        )
        updated_user_dto = UserResponseDto(
            id=1,
            username="updated_user",
            email="updated@example.com",
            is_active=True,
            is_admin=False,
            email_verified=True,
            created_at=datetime(2023, 1, 1),
            updated_at=datetime(2023, 1, 2)
        )
        self.mock_user_service.update_user.return_value = updated_user_dto
        
        # Act
        result = update_current_user(
            user_data=user_data,
            current_user=self.sample_user,
            user_service=self.mock_user_service
        )
        
        # Assert
        assert result.username == "updated_user"
        assert result.email == "updated@example.com"
        self.mock_user_service.update_user.assert_called_once()
        # 呼び出し引数を確認
        call_args = self.mock_user_service.update_user.call_args
        assert call_args[0][0] == 1  # user_id
        update_dto_arg = call_args[0][1]
        assert update_dto_arg.username == "updated_user"
        assert update_dto_arg.email == "updated@example.com"
        assert update_dto_arg.is_active == True
        assert update_dto_arg.is_admin is None  # 管理者権限がNoneで呼ばれることを確認
    
    def test_update_current_user_value_error(self):
        """ユーザー更新でのValueErrorテスト"""
        # Arrange
        user_data = UserUpdate(username="duplicate_user")
        self.mock_user_service.update_user.side_effect = ValueError("Username already exists")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            update_current_user(
                user_data=user_data,
                current_user=self.sample_user,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Username already exists"
    
    def test_delete_current_user_success(self):
        """現在のユーザー削除成功のテスト"""
        # Arrange
        self.mock_user_service.delete_user.return_value = True
        
        # Act
        result = delete_current_user(
            current_user=self.sample_user,
            user_service=self.mock_user_service
        )
        
        # Assert
        assert result is None  # 204ステータスの場合はNoneが返される
        self.mock_user_service.delete_user.assert_called_once_with(1)
    
    def test_delete_current_user_not_found(self):
        """ユーザー削除でのNotFoundテスト"""
        # Arrange
        self.mock_user_service.delete_user.return_value = False
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            delete_current_user(
                current_user=self.sample_user,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "User not found"
    
    def test_verify_email_success(self):
        """メール認証成功のテスト"""
        # Arrange
        verification_data = EmailVerificationRequest(token="valid_token")
        self.mock_user_service.verify_email.return_value = None  # 成功時はNone
        
        # Act
        result = verify_email(
            verification_data=verification_data,
            user_service=self.mock_user_service
        )
        
        # Assert
        assert result.message == "Email address verified successfully"
        self.mock_user_service.verify_email.assert_called_once_with("valid_token")
    
    def test_verify_email_value_error(self):
        """メール認証でのValueErrorテスト"""
        # Arrange
        verification_data = EmailVerificationRequest(token="invalid_token")
        self.mock_user_service.verify_email.side_effect = ValueError("Invalid token")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            verify_email(
                verification_data=verification_data,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Invalid token"
    
    def test_resend_verification_email_success(self):
        """認証メール再送信成功のテスト"""
        # Arrange
        resend_data = ResendVerificationRequest(email="test@example.com")
        self.mock_user_service.resend_verification_email.return_value = True
        
        # Act
        result = resend_verification_email(
            resend_data=resend_data,
            user_service=self.mock_user_service
        )
        
        # Assert
        assert result.message == "Verification email sent successfully"
        self.mock_user_service.resend_verification_email.assert_called_once_with("test@example.com")
    
    def test_resend_verification_email_failed(self):
        """認証メール再送信失敗のテスト"""
        # Arrange
        resend_data = ResendVerificationRequest(email="test@example.com")
        self.mock_user_service.resend_verification_email.return_value = False
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            resend_verification_email(
                resend_data=resend_data,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Failed to send email"
    
    def test_resend_verification_email_value_error(self):
        """認証メール再送信でのValueErrorテスト"""
        # Arrange
        resend_data = ResendVerificationRequest(email="invalid@example.com")
        self.mock_user_service.resend_verification_email.side_effect = ValueError("User not found")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            resend_verification_email(
                resend_data=resend_data,
                user_service=self.mock_user_service
            )
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "User not found"