from typing import List, Optional
from domain.entities.user import User
from domain.repositories.user_repository import UserRepository
from application.dtos.user_dto import CreateUserDto, UpdateUserDto, UserResponseDto, LoginRequestDto, TokenResponseDto
from infrastructure.security.password_hasher import PasswordHasher
from infrastructure.security.jwt_handler import JWTHandler


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        self.password_hasher = PasswordHasher()
        self.jwt_handler = JWTHandler()

    def create_user(self, create_dto: CreateUserDto) -> UserResponseDto:
        existing_user = self.user_repository.get_by_username(create_dto.username)
        if existing_user:
            raise ValueError("Username already exists")
        
        existing_email = self.user_repository.get_by_email(create_dto.email)
        if existing_email:
            raise ValueError("Email already exists")

        hashed_password = self.password_hasher.hash_password(create_dto.password)
        
        user = User(
            id=None,
            username=create_dto.username,
            email=create_dto.email,
            hashed_password=hashed_password,
            is_active=True
        )
        
        created_user = self.user_repository.create(user)
        return self._to_response_dto(created_user)

    def authenticate_user(self, login_dto: LoginRequestDto) -> TokenResponseDto:
        user = self.user_repository.get_by_username(login_dto.username)
        if not user or not self.password_hasher.verify_password(login_dto.password, user.hashed_password):
            raise ValueError("Invalid username or password")
        
        if not user.is_active:
            raise ValueError("User account is disabled")
        
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

    def _to_response_dto(self, user: User) -> UserResponseDto:
        return UserResponseDto(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
            updated_at=user.updated_at
        )