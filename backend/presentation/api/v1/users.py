from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from infrastructure.database.connection import get_db
from infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl
from infrastructure.security.auth_middleware import get_current_active_user
from application.services.user_service import UserService
from application.dtos.user_dto import CreateUserDto, UpdateUserDto, LoginRequestDto
from presentation.schemas.user_schema import UserCreate, UserUpdate, UserResponse, LoginRequest, TokenResponse, EmailVerificationRequest, ResendVerificationRequest, MessageResponse
from domain.entities.user import User

router = APIRouter()


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    user_repository = UserRepositoryImpl(db)
    return UserService(user_repository)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """ユーザー登録（トークン付きレスポンス）"""
    try:
        create_dto = CreateUserDto(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password
        )
        user_response = user_service.create_user(create_dto)
        
        # JWT トークンを生成
        from infrastructure.security.jwt_handler import JWTHandler
        jwt_handler = JWTHandler()
        access_token = jwt_handler.create_access_token(data={"sub": user_response.username})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user_response.id,
                username=user_response.username,
                email=user_response.email,
                is_active=user_response.is_active,
                is_admin=user_response.is_admin,
                email_verified=user_response.email_verified,
                created_at=user_response.created_at,
                updated_at=user_response.updated_at
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    """ログイン（OAuth2 Form形式）"""
    try:
        login_dto = LoginRequestDto(
            username=form_data.username,
            password=form_data.password
        )
        token_dto = user_service.authenticate_user(login_dto)
        
        # ユーザー情報を取得
        user_response = user_service.get_user_by_username(form_data.username)
        if not user_response:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        return TokenResponse(
            access_token=token_dto.access_token,
            token_type=token_dto.token_type,
            user=UserResponse(
                id=user_response.id,
                username=user_response.username,
                email=user_response.email,
                is_active=user_response.is_active,
                is_admin=user_response.is_admin,
                email_verified=user_response.email_verified,
                created_at=user_response.created_at,
                updated_at=user_response.updated_at
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        email_verified=current_user.email_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


# 一般ユーザーは他のユーザー情報にアクセスできません
# 全ユーザー一覧や他のユーザー詳細は管理者専用エンドポイント(/api/v1/admin/)で提供


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """自分のユーザー情報を更新（管理者権限の変更は不可）"""
    try:
        # 一般ユーザーは自分のis_adminフラグを変更できない
        update_dto = UpdateUserDto(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            is_active=user_data.is_active,
            is_admin=None  # 一般ユーザーは管理者権限を変更できない
        )
        updated_user = user_service.update_user(current_user.id, update_dto)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """自分のアカウントを削除"""
    success = user_service.delete_user(current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(
    verification_data: EmailVerificationRequest,
    user_service: UserService = Depends(get_user_service)
):
    """メールアドレス認証"""
    try:
        user_service.verify_email(verification_data.token)
        return MessageResponse(message="Email address verified successfully")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification_email(
    resend_data: ResendVerificationRequest,
    user_service: UserService = Depends(get_user_service)
):
    """認証メール再送信"""
    try:
        success = user_service.resend_verification_email(resend_data.email)
        if success:
            return MessageResponse(message="Verification email sent successfully")
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send email")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))