from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from infrastructure.database.connection import Base
from domain.constants.validation_constants import ValidationConstants


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(ValidationConstants.USERNAME_MAX_LENGTH), unique=True, index=True, nullable=False)
    email = Column(String(ValidationConstants.EMAIL_MAX_LENGTH), unique=True, index=True, nullable=False)
    hashed_password = Column(String(ValidationConstants.HASHED_PASSWORD_MAX_LENGTH), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(ValidationConstants.VERIFICATION_TOKEN_MAX_LENGTH), nullable=True, index=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())