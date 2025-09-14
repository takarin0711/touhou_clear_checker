from typing import List, Optional
from domain.entities.game import Game
from domain.repositories.game_repository import GameRepository
from ..dtos.game_dto import GameDto, CreateGameDto, UpdateGameDto

class GameService:
    def __init__(self, game_repository: GameRepository):
        self.game_repository = game_repository
    
    def get_all_games(self) -> List[GameDto]:
        games = self.game_repository.find_all()
        return [self._to_dto(game) for game in games]
    
    def get_game_by_id(self, game_id: int) -> Optional[GameDto]:
        game = self.game_repository.find_by_id(game_id)
        return self._to_dto(game) if game else None
    
    def create_game(self, create_dto: CreateGameDto) -> GameDto:
        game = Game(
            id=None,
            title=create_dto.title,
            series_number=create_dto.series_number,
            release_year=create_dto.release_year
        )
        saved_game = self.game_repository.save(game)
        return self._to_dto(saved_game)
    
    def update_game(self, game_id: int, update_dto: UpdateGameDto) -> Optional[GameDto]:
        existing_game = self.game_repository.find_by_id(game_id)
        if not existing_game:
            return None
        
        game = Game(
            id=game_id,
            title=update_dto.title,
            series_number=update_dto.series_number,
            release_year=update_dto.release_year
        )
        saved_game = self.game_repository.save(game)
        return self._to_dto(saved_game)
    
    def delete_game(self, game_id: int) -> bool:
        return self.game_repository.delete(game_id)
    
    def _to_dto(self, game: Game) -> GameDto:
        return GameDto(
            id=game.id,
            title=game.title,
            series_number=game.series_number,
            release_year=game.release_year
        )