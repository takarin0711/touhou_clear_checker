"""
ゲームメモリポジトリ実装
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from domain.repositories.game_memo_repository import GameMemoRepository
from domain.entities.game_memo import GameMemo
from infrastructure.database.models.game_memo_model import GameMemoModel


class GameMemoRepositoryImpl(GameMemoRepository):
    """ゲームメモリポジトリの実装クラス"""
    
    def __init__(self, session: Session):
        self.session = session
    
    async def find_all(self) -> List[GameMemo]:
        """全ゲームメモを取得"""
        models = self.session.query(GameMemoModel).order_by(GameMemoModel.updated_at.desc()).all()
        return [model.to_entity() for model in models]
    
    async def find_by_id(self, id: int) -> Optional[GameMemo]:
        """IDでゲームメモを取得"""
        model = self.session.query(GameMemoModel).filter(GameMemoModel.id == id).first()
        return model.to_entity() if model else None
    
    async def find_by_user_id(self, user_id: int) -> List[GameMemo]:
        """ユーザーIDでゲームメモを取得"""
        models = self.session.query(GameMemoModel).filter(
            GameMemoModel.user_id == user_id
        ).order_by(GameMemoModel.game_id).all()
        return [model.to_entity() for model in models]
    
    async def find_by_user_and_game(self, user_id: int, game_id: int) -> Optional[GameMemo]:
        """ユーザー・ゲームでメモを取得"""
        model = self.session.query(GameMemoModel).filter(
            GameMemoModel.user_id == user_id,
            GameMemoModel.game_id == game_id
        ).first()
        return model.to_entity() if model else None
    
    async def create(self, game_memo: GameMemo) -> GameMemo:
        """ゲームメモを作成"""
        model = GameMemoModel(
            user_id=game_memo.user_id,
            game_id=game_memo.game_id,
            memo=game_memo.memo
        )
        
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model.to_entity()
    
    async def update(self, game_memo: GameMemo) -> GameMemo:
        """ゲームメモを更新"""
        model = self.session.query(GameMemoModel).filter(GameMemoModel.id == game_memo.id).first()
        if not model:
            raise ValueError(f"Game memo with id {game_memo.id} not found")
        
        model.memo = game_memo.memo
        
        self.session.commit()
        return model.to_entity()
    
    async def delete(self, id: int) -> bool:
        """ゲームメモを削除"""
        model = self.session.query(GameMemoModel).filter(GameMemoModel.id == id).first()
        if model:
            self.session.delete(model)
            self.session.commit()
            return True
        return False
    
    async def exists(self, id: int) -> bool:
        """ゲームメモが存在するかチェック"""
        return self.session.query(GameMemoModel).filter(GameMemoModel.id == id).first() is not None
    
    async def create_or_update(self, game_memo: GameMemo) -> GameMemo:
        """ゲームメモを作成または更新（UPSERT）"""
        # 既存メモを検索
        existing = await self.find_by_user_and_game(
            game_memo.user_id,
            game_memo.game_id
        )
        
        if existing:
            # 既存メモを更新
            game_memo.id = existing.id
            return await self.update(game_memo)
        else:
            # 新規作成
            return await self.create(game_memo)