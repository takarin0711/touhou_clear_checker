from typing import List, Optional
from domain.entities.user import User
from domain.repositories.user_repository import UserRepository
from application.dtos.user_dto import CreateUserDto, UpdateUserDto, UserResponseDto, LoginRequestDto, TokenResponseDto
from infrastructure.security.password_hasher import PasswordHasher
from infrastructure.security.jwt_handler import JWTHandler
from infrastructure.security.token_generator import TokenGenerator
from infrastructure.email.email_service import EmailService, MockEmailService
import os


class UserService:
    def __init__(self, user_repository: UserRepository, email_service: Optional[EmailService] = None):
        self.user_repository = user_repository
        self.password_hasher = PasswordHasher()
        self.jwt_handler = JWTHandler()
        
        # メールサービスの設定（開発環境では Mock を使用）
        if email_service:
            self.email_service = email_service
        elif os.getenv("ENVIRONMENT") == "production":
            from infrastructure.email.email_service import SMTPEmailService
            self.email_service = SMTPEmailService()
        else:
            self.email_service = MockEmailService()

    def create_user(self, create_dto: CreateUserDto) -> UserResponseDto:
        existing_user = self.user_repository.get_by_username(create_dto.username)
        if existing_user:
            raise ValueError("Username already exists")
        
        existing_email = self.user_repository.get_by_email(create_dto.email)
        if existing_email:
            raise ValueError("Email already exists")

        hashed_password = self.password_hasher.hash_password(create_dto.password)
        
        # メール認証用トークン生成
        verification_token, expires_at = TokenGenerator.generate_token_with_expiry(24)
        
        user = User(
            id=None,
            username=create_dto.username,
            email=create_dto.email,
            hashed_password=hashed_password,
            is_active=True,
            email_verified=False,  # 初期状態は未認証
            verification_token=verification_token,
            verification_token_expires_at=expires_at
        )
        
        created_user = self.user_repository.create(user)
        
        # 認証メール送信
        self.email_service.send_verification_email(
            to_email=created_user.email,
            username=created_user.username,
            verification_token=verification_token
        )
        
        return self._to_response_dto(created_user)

    def authenticate_user(self, login_dto: LoginRequestDto) -> TokenResponseDto:
        user = self.user_repository.get_by_username(login_dto.username)
        if not user or not self.password_hasher.verify_password(login_dto.password, user.hashed_password):
            raise ValueError("Invalid username or password")
        
        if not user.is_active:
            raise ValueError("User account is disabled")
        
        # メール認証チェック
        if not user.email_verified:
            raise ValueError("Email address not verified. Please check your email and verify your account.")
        
        access_token = self.jwt_handler.create_access_token(data={"sub": user.username})
        return TokenResponseDto(access_token=access_token, token_type="bearer")

    def get_user_by_id(self, user_id: int) -> Optional[UserResponseDto]:
        user = self.user_repository.get_by_id(user_id)
        return self._to_response_dto(user) if user else None

    def get_user_by_username(self, username: str) -> Optional[UserResponseDto]:
        user = self.user_repository.get_by_username(username)
        return self._to_response_dto(user) if user else None

    def get_all_users(self) -> List[UserResponseDto]:
        users = self.user_repository.get_all()
        return [self._to_response_dto(user) for user in users]

    def update_user(self, user_id: int, update_dto: UpdateUserDto) -> UserResponseDto:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if update_dto.username:
            existing_user = self.user_repository.get_by_username(update_dto.username)
            if existing_user and existing_user.id != user_id:
                raise ValueError("Username already exists")
            user.username = update_dto.username

        if update_dto.email:
            existing_email = self.user_repository.get_by_email(update_dto.email)
            if existing_email and existing_email.id != user_id:
                raise ValueError("Email already exists")
            user.email = update_dto.email

        if update_dto.password:
            user.hashed_password = self.password_hasher.hash_password(update_dto.password)

        if update_dto.is_active is not None:
            user.is_active = update_dto.is_active

        if update_dto.is_admin is not None:
            user.is_admin = update_dto.is_admin

        updated_user = self.user_repository.update(user)
        return self._to_response_dto(updated_user)

    def delete_user(self, user_id: int) -> bool:
        return self.user_repository.delete(user_id)

    def verify_email(self, verification_token: str) -> bool:
        """メールアドレス認証を実行"""
        user = self.user_repository.get_by_verification_token(verification_token)
        if not user:
            raise ValueError("Invalid verification token")
        
        if not user.verification_token_expires_at:
            raise ValueError("Verification token has no expiry date")
        
        if TokenGenerator.is_token_expired(user.verification_token_expires_at):
            raise ValueError("Verification token has expired")
        
        if user.email_verified:
            raise ValueError("Email address is already verified")
        
        # メール認証完了
        user.email_verified = True
        user.verification_token = None
        user.verification_token_expires_at = None
        
        self.user_repository.update(user)
        return True

    def resend_verification_email(self, email: str) -> bool:
        """認証メール再送信"""
        user = self.user_repository.get_by_email(email)
        if not user:
            raise ValueError("User not found")
        
        if user.email_verified:
            raise ValueError("Email address is already verified")
        
        # 新しい認証トークンを生成
        verification_token, expires_at = TokenGenerator.generate_token_with_expiry(24)
        user.verification_token = verification_token
        user.verification_token_expires_at = expires_at
        
        self.user_repository.update(user)
        
        # 認証メール送信
        return self.email_service.send_verification_email(
            to_email=user.email,
            username=user.username,
            verification_token=verification_token
        )

    def _to_response_dto(self, user: User) -> UserResponseDto:
        return UserResponseDto(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
            email_verified=user.email_verified,
            created_at=user.created_at,
            updated_at=user.updated_at
        )