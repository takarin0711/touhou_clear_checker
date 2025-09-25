import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from application.services.user_service import UserService
from application.dtos.user_dto import CreateUserDto, UpdateUserDto, LoginRequestDto
from domain.entities.user import User

class TestUserService:
    
    def setup_method(self):
        """各テストメソッドの前に実行される共通セットアップ"""
        self.mock_repository = Mock()
        
        with patch('application.services.user_service.PasswordHasher') as mock_hasher_class, \
             patch('application.services.user_service.JWTHandler') as mock_jwt_class, \
             patch('application.services.user_service.MockEmailSender') as mock_email_sender_class, \
             patch('application.services.user_service.TokenGenerator') as mock_token_gen_class:
            
            self.mock_password_hasher = Mock()
            self.mock_jwt_handler = Mock()
            self.mock_email_sender = Mock()
            self.mock_email_service = Mock()
            self.mock_token_generator = Mock()
            mock_hasher_class.return_value = self.mock_password_hasher
            mock_jwt_class.return_value = self.mock_jwt_handler
            mock_email_sender_class.return_value = self.mock_email_sender
            mock_token_gen_class.return_value = self.mock_token_generator
            # TokenGeneratorは静的メソッドなのでクラス自体をモック
            mock_token_gen_class.generate_token_with_expiry.return_value = ("test_token", datetime.now())
            
            self.service = UserService(self.mock_repository, self.mock_email_service)
        
        self.sample_user = User(
            id=1,
            username="test_user",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=True,
            is_admin=False,
            email_verified=True,  # テスト用は認証済みに設定
            verification_token=None,
            verification_token_expires_at=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
    def test_create_user_success(self):
        """ユーザー作成成功のテスト"""
        create_dto = CreateUserDto(
            username="new_user",
            email="new@example.com",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = None
        self.mock_repository.get_by_email.return_value = None
        self.mock_password_hasher.hash_password.return_value = "hashed_password"
        self.mock_repository.create.return_value = self.sample_user
        self.mock_email_service.send_verification_email.return_value = True
        
        result = self.service.create_user(create_dto)
        
        assert result.username == "test_user"
        assert result.email == "test@example.com"
        self.mock_repository.get_by_username.assert_called_once_with("new_user")
        self.mock_repository.get_by_email.assert_called_once_with("new@example.com")
        self.mock_password_hasher.hash_password.assert_called_once_with("password123")
        self.mock_repository.create.assert_called_once()
        
    def test_create_user_username_exists(self):
        """既存ユーザー名でのユーザー作成エラーテスト"""
        create_dto = CreateUserDto(
            username="existing_user",
            email="new@example.com",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = self.sample_user
        
        with pytest.raises(ValueError, match="Username already exists"):
            self.service.create_user(create_dto)
            
    def test_create_user_email_exists(self):
        """既存メールアドレスでのユーザー作成エラーテスト"""
        create_dto = CreateUserDto(
            username="new_user",
            email="existing@example.com",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = None
        self.mock_repository.get_by_email.return_value = self.sample_user
        
        with pytest.raises(ValueError, match="Email already exists"):
            self.service.create_user(create_dto)
            
    def test_authenticate_user_success(self):
        """ユーザー認証成功のテスト"""
        login_dto = LoginRequestDto(
            username="test_user",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = self.sample_user
        self.mock_password_hasher.verify_password.return_value = True
        self.mock_jwt_handler.create_access_token.return_value = "access_token"
        
        result = self.service.authenticate_user(login_dto)
        
        assert result.access_token == "access_token"
        assert result.token_type == "bearer"
        self.mock_password_hasher.verify_password.assert_called_once_with("password123", "hashed_password")
        
    def test_authenticate_user_invalid_credentials(self):
        """無効な認証情報でのユーザー認証エラーテスト"""
        login_dto = LoginRequestDto(
            username="test_user",
            password="wrong_password"
        )
        
        self.mock_repository.get_by_username.return_value = self.sample_user
        self.mock_password_hasher.verify_password.return_value = False
        
        with pytest.raises(ValueError, match="Invalid username or password"):
            self.service.authenticate_user(login_dto)
            
    def test_authenticate_user_not_found(self):
        """存在しないユーザーでの認証エラーテスト"""
        login_dto = LoginRequestDto(
            username="nonexistent_user",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = None
        
        with pytest.raises(ValueError, match="Invalid username or password"):
            self.service.authenticate_user(login_dto)
            
    def test_authenticate_user_inactive(self):
        """非アクティブユーザーでの認証エラーテスト"""
        inactive_user = User(
            id=1,
            username="test_user",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=False,
            is_admin=False,
            email_verified=True,
            verification_token=None,
            verification_token_expires_at=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        login_dto = LoginRequestDto(
            username="test_user",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = inactive_user
        self.mock_password_hasher.verify_password.return_value = True
        
        with pytest.raises(ValueError, match="User account is disabled"):
            self.service.authenticate_user(login_dto)
            
    def test_authenticate_user_email_not_verified(self):
        """メール未認証ユーザーでの認証エラーテスト"""
        unverified_user = User(
            id=1,
            username="test_user",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=True,
            is_admin=False,
            email_verified=False,  # メール未認証
            verification_token="some_token",
            verification_token_expires_at=datetime.now(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        login_dto = LoginRequestDto(
            username="test_user",
            password="password123"
        )
        
        self.mock_repository.get_by_username.return_value = unverified_user
        self.mock_password_hasher.verify_password.return_value = True
        
        with pytest.raises(ValueError, match="Email address not verified"):
            self.service.authenticate_user(login_dto)
            
    def test_get_user_by_id_found(self):
        """ID指定でユーザー取得成功のテスト"""
        self.mock_repository.get_by_id.return_value = self.sample_user
        
        result = self.service.get_user_by_id(1)
        
        assert result is not None
        assert result.username == "test_user"
        self.mock_repository.get_by_id.assert_called_once_with(1)
        
    def test_get_user_by_id_not_found(self):
        """ID指定でユーザー取得失敗のテスト"""
        self.mock_repository.get_by_id.return_value = None
        
        result = self.service.get_user_by_id(999)
        
        assert result is None
        
    def test_get_user_by_username_found(self):
        """ユーザー名指定でユーザー取得成功のテスト"""
        self.mock_repository.get_by_username.return_value = self.sample_user
        
        result = self.service.get_user_by_username("test_user")
        
        assert result is not None
        assert result.username == "test_user"
        
    def test_get_all_users(self):
        """全ユーザー取得のテスト"""
        self.mock_repository.get_all.return_value = [self.sample_user]
        
        result = self.service.get_all_users()
        
        assert len(result) == 1
        assert result[0].username == "test_user"
        
    def test_update_user_success(self):
        """ユーザー更新成功のテスト"""
        update_dto = UpdateUserDto(
            username="updated_user",
            email="updated@example.com"
        )
        
        self.mock_repository.get_by_id.return_value = self.sample_user
        self.mock_repository.get_by_username.return_value = None
        self.mock_repository.get_by_email.return_value = None
        self.mock_repository.update.return_value = self.sample_user
        
        result = self.service.update_user(1, update_dto)
        
        assert result is not None
        self.mock_repository.update.assert_called_once()
        
    def test_update_user_not_found(self):
        """存在しないユーザー更新のテスト"""
        update_dto = UpdateUserDto(username="updated_user")
        
        self.mock_repository.get_by_id.return_value = None
        
        with pytest.raises(ValueError, match="User not found"):
            self.service.update_user(999, update_dto)
            
    def test_update_user_username_conflict(self):
        """ユーザー名重複でのユーザー更新エラーテスト"""
        update_dto = UpdateUserDto(username="existing_user")
        
        existing_user = User(id=2, username="existing_user", email="existing@example.com", hashed_password="some_hash")
        
        self.mock_repository.get_by_id.return_value = self.sample_user
        self.mock_repository.get_by_username.return_value = existing_user
        
        with pytest.raises(ValueError, match="Username already exists"):
            self.service.update_user(1, update_dto)
            
    def test_delete_user_success(self):
        """ユーザー削除成功のテスト"""
        self.mock_repository.delete.return_value = True
        
        result = self.service.delete_user(1)
        
        assert result is True
        self.mock_repository.delete.assert_called_once_with(1)
        
    def test_delete_user_failure(self):
        """ユーザー削除失敗のテスト"""
        self.mock_repository.delete.return_value = False
        
        result = self.service.delete_user(999)
        
        assert result is False