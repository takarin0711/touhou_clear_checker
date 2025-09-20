from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from jose import JWTError
from sqlalchemy.orm import Session
from infrastructure.security.jwt_handler import JWTHandler
from infrastructure.database.connection import get_db
from infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl
from domain.entities.user import User

security = HTTPBearer()
jwt_handler = JWTHandler()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token_data = jwt_handler.verify_token(credentials.credentials)
        username = token_data.username
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_repository = UserRepositoryImpl(db)
    user = user_repository.get_by_username(username)
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


optional_security = HTTPBearer(auto_error=False)

def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security), 
    db: Session = Depends(get_db)
) -> Optional[User]:
    """認証をオプションにしたユーザー取得（読み取り専用エンドポイント用）"""
    if credentials is None:
        return None
    
    try:
        token_data = jwt_handler.verify_token(credentials.credentials)
        username = token_data.username
        if username is None:
            return None
    except JWTError:
        return None
    
    user_repository = UserRepositoryImpl(db)
    user = user_repository.get_by_username(username)
    
    if user is None or not user.is_active:
        return None
    
    return user