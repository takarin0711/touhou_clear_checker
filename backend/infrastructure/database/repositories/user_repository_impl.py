from typing import Optional, List
from sqlalchemy.orm import Session
from domain.entities.user import User
from domain.repositories.user_repository import UserRepository
from infrastructure.database.models.user_model import UserModel


class UserRepositoryImpl(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        user_model = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if user_model:
            return self._model_to_entity(user_model)
        return None

    def get_by_username(self, username: str) -> Optional[User]:
        user_model = self.db.query(UserModel).filter(UserModel.username == username).first()
        if user_model:
            return self._model_to_entity(user_model)
        return None

    def get_by_email(self, email: str) -> Optional[User]:
        user_model = self.db.query(UserModel).filter(UserModel.email == email).first()
        if user_model:
            return self._model_to_entity(user_model)
        return None

    def get_all(self) -> List[User]:
        user_models = self.db.query(UserModel).all()
        return [self._model_to_entity(model) for model in user_models]

    def create(self, user: User) -> User:
        user_model = UserModel(
            username=user.username,
            email=user.email,
            hashed_password=user.hashed_password,
            is_active=user.is_active,
            is_admin=user.is_admin
        )
        self.db.add(user_model)
        self.db.commit()
        self.db.refresh(user_model)
        return self._model_to_entity(user_model)

    def update(self, user: User) -> User:
        user_model = self.db.query(UserModel).filter(UserModel.id == user.id).first()
        if user_model:
            user_model.username = user.username
            user_model.email = user.email
            user_model.hashed_password = user.hashed_password
            user_model.is_active = user.is_active
            user_model.is_admin = user.is_admin
            self.db.commit()
            self.db.refresh(user_model)
            return self._model_to_entity(user_model)
        raise ValueError(f"User with id {user.id} not found")

    def delete(self, user_id: int) -> bool:
        user_model = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if user_model:
            self.db.delete(user_model)
            self.db.commit()
            return True
        return False

    def _model_to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            username=model.username,
            email=model.email,
            hashed_password=model.hashed_password,
            is_active=model.is_active,
            is_admin=model.is_admin,
            created_at=model.created_at,
            updated_at=model.updated_at
        )