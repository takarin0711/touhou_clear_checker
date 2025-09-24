"""
ゲーム機体リポジトリ実装
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from domain.entities.game_character import GameCharacter
from domain.repositories.game_character_repository import GameCharacterRepository


class GameCharacterRepositoryImpl(GameCharacterRepository):
    """ゲーム機体リポジトリ実装"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def find_by_game_id(self, game_id: int) -> List[GameCharacter]:
        """ゲームIDで機体リストを取得（表示順序でソート）"""
        query = text("""
            SELECT id, game_id, character_name, description, sort_order, created_at
            FROM game_characters 
            WHERE game_id = :game_id 
            ORDER BY sort_order ASC, id ASC
        """)
        
        result = self.session.execute(query, {"game_id": game_id})
        characters = []
        
        for row in result:
            character = GameCharacter(
                id=row.id,
                game_id=row.game_id,
                character_name=row.character_name,
                description=row.description,
                sort_order=row.sort_order,
                created_at=row.created_at
            )
            characters.append(character)
        
        return characters
    
    def find_by_id(self, character_id: int) -> Optional[GameCharacter]:
        """IDで機体を取得"""
        query = text("""
            SELECT id, game_id, character_name, description, sort_order, created_at
            FROM game_characters 
            WHERE id = :character_id
        """)
        
        result = self.session.execute(query, {"character_id": character_id})
        row = result.first()
        
        if row:
            return GameCharacter(
                id=row.id,
                game_id=row.game_id,
                character_name=row.character_name,
                description=row.description,
                sort_order=row.sort_order,
                created_at=row.created_at
            )
        
        return None
    
    def find_by_game_and_name(self, game_id: int, character_name: str) -> Optional[GameCharacter]:
        """ゲームIDと機体名で機体を取得"""
        query = text("""
            SELECT id, game_id, character_name, description, sort_order, created_at
            FROM game_characters 
            WHERE game_id = :game_id AND character_name = :character_name
        """)
        
        result = self.session.execute(query, {
            "game_id": game_id,
            "character_name": character_name
        })
        row = result.first()
        
        if row:
            return GameCharacter(
                id=row.id,
                game_id=row.game_id,
                character_name=row.character_name,
                description=row.description,
                sort_order=row.sort_order,
                created_at=row.created_at
            )
        
        return None
    
    def save(self, character: GameCharacter) -> GameCharacter:
        """機体を保存（新規作成・更新）"""
        if not character.is_valid():
            raise ValueError("Invalid GameCharacter data")
        
        if character.id is None:
            # 新規作成
            return self._create(character)
        else:
            # 更新
            return self._update(character)
    
    def _create(self, character: GameCharacter) -> GameCharacter:
        """新規機体作成"""
        query = text("""
            INSERT INTO game_characters (game_id, character_name, description, sort_order, created_at)
            VALUES (:game_id, :character_name, :description, :sort_order, :created_at)
        """)
        
        from datetime import datetime
        now = datetime.now()
        
        result = self.session.execute(query, {
            "game_id": character.game_id,
            "character_name": character.character_name,
            "description": character.description,
            "sort_order": character.sort_order,
            "created_at": now
        })
        
        # 新しく作成されたIDを取得
        character.id = result.lastrowid
        character.created_at = now
        
        self.session.commit()
        return character
    
    def _update(self, character: GameCharacter) -> GameCharacter:
        """既存機体更新"""
        query = text("""
            UPDATE game_characters 
            SET character_name = :character_name,
                description = :description,
                sort_order = :sort_order
            WHERE id = :id
        """)
        
        self.session.execute(query, {
            "id": character.id,
            "character_name": character.character_name,
            "description": character.description,
            "sort_order": character.sort_order
        })
        
        self.session.commit()
        return character
    
    def delete(self, character_id: int) -> bool:
        """機体を削除"""
        query = text("""
            DELETE FROM game_characters WHERE id = :character_id
        """)
        
        result = self.session.execute(query, {"character_id": character_id})
        self.session.commit()
        
        return result.rowcount > 0
    
    def get_character_count_by_game(self, game_id: int) -> int:
        """ゲーム別機体数を取得"""
        query = text("""
            SELECT COUNT(*) as count
            FROM game_characters 
            WHERE game_id = :game_id
        """)
        
        result = self.session.execute(query, {"game_id": game_id})
        row = result.first()
        
        return row.count if row else 0