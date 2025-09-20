"""
クリア記録リポジトリ実装
"""
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from domain.repositories.clear_record_repository import ClearRecordRepository
from domain.entities.clear_record import ClearRecord
from infrastructure.database.models.clear_record_model import ClearRecordModel


class ClearRecordRepositoryImpl(ClearRecordRepository):
    """クリア記録リポジトリの実装クラス"""
    
    def __init__(self, session: Session):
        self.session = session
    
    async def find_all(self) -> List[ClearRecord]:
        """全クリア記録を取得"""
        models = self.session.query(ClearRecordModel).order_by(ClearRecordModel.created_at.desc()).all()
        return [model.to_entity() for model in models]
    
    async def find_by_id(self, id: int) -> Optional[ClearRecord]:
        """IDでクリア記録を取得"""
        model = self.session.query(ClearRecordModel).filter(ClearRecordModel.id == id).first()
        return model.to_entity() if model else None
    
    async def find_by_user_id(self, user_id: int) -> List[ClearRecord]:
        """ユーザーIDでクリア記録を取得"""
        models = self.session.query(ClearRecordModel).filter(
            ClearRecordModel.user_id == user_id
        ).order_by(
            ClearRecordModel.game_id, 
            ClearRecordModel.character_name, 
            ClearRecordModel.difficulty
        ).all()
        return [model.to_entity() for model in models]
    
    async def find_by_game_id(self, game_id: int) -> List[ClearRecord]:
        """ゲームIDでクリア記録を取得"""
        models = self.session.query(ClearRecordModel).filter(
            ClearRecordModel.game_id == game_id
        ).order_by(
            ClearRecordModel.user_id, 
            ClearRecordModel.character_name, 
            ClearRecordModel.difficulty
        ).all()
        return [model.to_entity() for model in models]
    
    async def find_by_user_and_game(self, user_id: int, game_id: int) -> List[ClearRecord]:
        """ユーザー・ゲームでクリア記録を取得"""
        models = self.session.query(ClearRecordModel).filter(
            ClearRecordModel.user_id == user_id,
            ClearRecordModel.game_id == game_id
        ).order_by(
            ClearRecordModel.character_name, 
            ClearRecordModel.difficulty
        ).all()
        return [model.to_entity() for model in models]
    
    async def find_by_user_game_character_difficulty(
        self, 
        user_id: int, 
        game_id: int, 
        character_name: str, 
        difficulty: str
    ) -> Optional[ClearRecord]:
        """ユーザー・ゲーム・キャラ・難易度でクリア記録を取得"""
        model = self.session.query(ClearRecordModel).filter(
            ClearRecordModel.user_id == user_id,
            ClearRecordModel.game_id == game_id,
            ClearRecordModel.character_name == character_name,
            ClearRecordModel.difficulty == difficulty
        ).first()
        return model.to_entity() if model else None
    
    async def create(self, clear_record: ClearRecord) -> ClearRecord:
        """クリア記録を作成"""
        try:
            now = datetime.now()
            
            # cleared_atの設定: is_clearedがTrueで既存のcleared_atがNoneの場合は今日の日付を設定
            cleared_at = clear_record.cleared_at
            if clear_record.is_cleared and cleared_at is None:
                cleared_at = date.today()
            
            model = ClearRecordModel.from_entity(clear_record)
            if cleared_at:
                model.cleared_at = cleared_at
            model.last_updated_at = now
            model.created_at = now
            
            print(f"Creating model: {model}")
            self.session.add(model)
            self.session.commit()
            self.session.refresh(model)
            result = model.to_entity()
            print(f"Created entity: {result}")
            return result
        except Exception as e:
            print(f"Error in repository create: {e}")
            self.session.rollback()
            raise e
    
    async def update(self, clear_record: ClearRecord) -> ClearRecord:
        """クリア記録を更新"""
        model = self.session.query(ClearRecordModel).filter(ClearRecordModel.id == clear_record.id).first()
        if not model:
            raise ValueError(f"Clear record with id {clear_record.id} not found")
        
        now = datetime.now()
        
        # cleared_atの設定: is_clearedがTrueで既存のcleared_atがNoneの場合は今日の日付を設定
        cleared_at = clear_record.cleared_at
        if clear_record.is_cleared and cleared_at is None:
            cleared_at = date.today()
        elif not clear_record.is_cleared:
            # クリア状態でない場合はcleared_atをクリア
            cleared_at = None
        
        model.is_cleared = clear_record.is_cleared
        model.is_no_continue_clear = clear_record.is_no_continue_clear
        model.is_no_bomb_clear = clear_record.is_no_bomb_clear
        model.is_no_miss_clear = clear_record.is_no_miss_clear
        model.is_full_spell_card = clear_record.is_full_spell_card
        model.is_special_clear_1 = clear_record.is_special_clear_1
        model.is_special_clear_2 = clear_record.is_special_clear_2
        model.is_special_clear_3 = clear_record.is_special_clear_3
        model.cleared_at = cleared_at
        model.last_updated_at = now
        
        self.session.commit()
        return model.to_entity()
    
    async def delete(self, id: int) -> bool:
        """クリア記録を削除"""
        model = self.session.query(ClearRecordModel).filter(ClearRecordModel.id == id).first()
        if model:
            self.session.delete(model)
            self.session.commit()
            return True
        return False
    
    async def exists(self, id: int) -> bool:
        """クリア記録が存在するかチェック"""
        return self.session.query(ClearRecordModel).filter(ClearRecordModel.id == id).first() is not None
    
    async def create_or_update(self, clear_record: ClearRecord) -> ClearRecord:
        """クリア記録を作成または更新（UPSERT）"""
        # 既存記録を検索
        existing = await self.find_by_user_game_character_difficulty(
            clear_record.user_id,
            clear_record.game_id,
            clear_record.character_name,
            clear_record.difficulty
        )
        
        if existing:
            # 既存記録を更新
            clear_record.id = existing.id
            clear_record.created_at = existing.created_at  # 作成日時は保持
            return await self.update(clear_record)
        else:
            # 新規作成
            return await self.create(clear_record)