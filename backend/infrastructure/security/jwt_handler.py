from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel

from .constants import SecurityConstants


class TokenData(BaseModel):
    username: Optional[str] = None


class JWTHandler:
    SECRET_KEY = SecurityConstants.JWT_SECRET_KEY
    ALGORITHM = SecurityConstants.JWT_ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES = SecurityConstants.JWT_ACCESS_TOKEN_EXPIRE_MINUTES

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str) -> TokenData:
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise JWTError("Invalid token")
            token_data = TokenData(username=username)
            return token_data
        except JWTError:
            raise JWTError("Invalid token")