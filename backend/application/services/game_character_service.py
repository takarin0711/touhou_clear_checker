from typing import List, Optional
from domain.entities.game_character import GameCharacter
from domain.repositories.game_character_repository import GameCharacterRepository
from ..dtos.game_character_dto import (
    GameCharacterDto,
    CreateGameCharacterDto,
    UpdateGameCharacterDto,
    GameCharacterListDto
)
from infrastructure.logging.logger import LoggerFactory

logger = LoggerFactory.get_logger(__name__)


class GameCharacterService:
    """ゲーム機体サービス"""
    
    def __init__(self, game_character_repository: GameCharacterRepository):
        self.game_character_repository = game_character_repository
    
    def get_characters_by_game_id(self, game_id: int) -> GameCharacterListDto:
        """指定ゲームIDの機体一覧を取得"""
        logger.debug(f"Fetching characters for game_id={game_id}")
        characters = self.game_character_repository.find_by_game_id(game_id)
        character_dtos = [self._to_dto(character) for character in characters]
        logger.debug(f"Found {len(character_dtos)} characters for game_id={game_id}")
        return GameCharacterListDto(
            game_characters=character_dtos,
            total_count=len(character_dtos)
        )
    
    def get_character_by_id(self, character_id: int) -> Optional[GameCharacterDto]:
        """機体IDで機体を取得"""
        character = self.game_character_repository.find_by_id(character_id)
        return self._to_dto(character) if character else None
    
    def get_character_by_game_and_name(self, game_id: int, character_name: str) -> Optional[GameCharacterDto]:
        """ゲームIDと機体名で機体を取得"""
        character = self.game_character_repository.find_by_game_and_name(game_id, character_name)
        return self._to_dto(character) if character else None
    
    def create_character(self, create_dto: CreateGameCharacterDto) -> GameCharacterDto:
        """新しい機体を作成"""
        logger.info(f"Creating game character: game_id={create_dto.game_id}, name={create_dto.character_name}")
        # 重複チェック
        existing = self.game_character_repository.find_by_game_and_name(
            create_dto.game_id,
            create_dto.character_name
        )
        if existing:
            logger.warning(f"Game character already exists: game_id={create_dto.game_id}, name={create_dto.character_name}")
            raise ValueError(f"Game character already exists: game_id={create_dto.game_id}, name={create_dto.character_name}")

        character = GameCharacter(
            id=None,
            game_id=create_dto.game_id,
            character_name=create_dto.character_name,
            description=create_dto.description,
            sort_order=create_dto.sort_order
        )

        # エンティティの妥当性チェック
        if not character.is_valid():
            logger.warning(f"Invalid game character data: game_id={create_dto.game_id}, name={create_dto.character_name}")
            raise ValueError("Invalid game character data")

        saved_character = self.game_character_repository.save(character)
        logger.info(f"Game character created successfully: character_id={saved_character.id}, name={saved_character.character_name}")
        return self._to_dto(saved_character)
    
    def update_character(self, character_id: int, update_dto: UpdateGameCharacterDto) -> Optional[GameCharacterDto]:
        """機体情報を更新"""
        logger.info(f"Updating game character: character_id={character_id}, new_name={update_dto.character_name}")
        existing_character = self.game_character_repository.find_by_id(character_id)
        if not existing_character:
            logger.warning(f"Game character not found: character_id={character_id}")
            return None

        # 名前変更時の重複チェック
        if update_dto.character_name != existing_character.character_name:
            duplicate = self.game_character_repository.find_by_game_and_name(
                existing_character.game_id,
                update_dto.character_name
            )
            if duplicate:
                logger.warning(f"Duplicate character name: game_id={existing_character.game_id}, name={update_dto.character_name}")
                raise ValueError(f"Character name already exists in this game: {update_dto.character_name}")

        character = GameCharacter(
            id=character_id,
            game_id=existing_character.game_id,  # game_idは変更不可
            character_name=update_dto.character_name,
            description=update_dto.description,
            sort_order=update_dto.sort_order,
            created_at=existing_character.created_at
        )

        # エンティティの妥当性チェック
        if not character.is_valid():
            logger.warning(f"Invalid game character data: character_id={character_id}")
            raise ValueError("Invalid game character data")

        saved_character = self.game_character_repository.save(character)
        logger.info(f"Game character updated successfully: character_id={saved_character.id}, name={saved_character.character_name}")
        return self._to_dto(saved_character)
    
    def delete_character(self, character_id: int) -> bool:
        """機体を削除"""
        logger.info(f"Deleting game character: character_id={character_id}")
        result = self.game_character_repository.delete(character_id)
        if result:
            logger.info(f"Game character deleted successfully: character_id={character_id}")
        else:
            logger.warning(f"Failed to delete game character: character_id={character_id}")
        return result
    
    def get_character_count_by_game(self, game_id: int) -> int:
        """指定ゲームの機体数を取得"""
        return self.game_character_repository.get_character_count_by_game(game_id)
    
    def _to_dto(self, character: GameCharacter) -> GameCharacterDto:
        """エンティティをDTOに変換"""
        return GameCharacterDto(
            id=character.id,
            game_id=character.game_id,
            character_name=character.character_name,
            description=character.description,
            sort_order=character.sort_order,
            created_at=character.created_at
        )