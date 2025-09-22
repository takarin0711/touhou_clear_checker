"""
クリア記録サービス
"""
from typing import List, Optional
from datetime import date, datetime
from domain.entities.clear_record import ClearRecord
from domain.repositories.clear_record_repository import ClearRecordRepository


class ClearRecordService:
    """クリア記録サービス"""
    
    def __init__(self, clear_record_repository: ClearRecordRepository):
        self.clear_record_repository = clear_record_repository
    
    async def get_user_clear_records(self, user_id: int) -> List[ClearRecord]:
        """ユーザーのクリア記録を取得"""
        return await self.clear_record_repository.find_by_user_id(user_id)
    
    async def get_user_game_clear_records(self, user_id: int, game_id: int) -> List[ClearRecord]:
        """ユーザーの特定ゲームのクリア記録を取得"""
        return await self.clear_record_repository.find_by_user_and_game(user_id, game_id)
    
    async def get_clear_record_by_id(self, record_id: int) -> Optional[ClearRecord]:
        """IDでクリア記録を取得"""
        return await self.clear_record_repository.find_by_id(record_id)
    
    async def create_clear_record(self, user_id: int, clear_record_data: dict) -> ClearRecord:
        """クリア記録を作成"""
        clear_record = ClearRecord(
            user_id=user_id,
            game_id=clear_record_data.get('game_id'),
            character_name=clear_record_data.get('character_name'),
            difficulty=clear_record_data.get('difficulty'),
            mode=clear_record_data.get('mode', 'normal'),
            is_cleared=clear_record_data.get('is_cleared', False),
            is_no_continue_clear=clear_record_data.get('is_no_continue_clear', False),
            is_no_bomb_clear=clear_record_data.get('is_no_bomb_clear', False),
            is_no_miss_clear=clear_record_data.get('is_no_miss_clear', False),
            is_full_spell_card=clear_record_data.get('is_full_spell_card', False),
            is_special_clear_1=clear_record_data.get('is_special_clear_1', False),
            is_special_clear_2=clear_record_data.get('is_special_clear_2', False),
            is_special_clear_3=clear_record_data.get('is_special_clear_3', False),
            cleared_at=clear_record_data.get('cleared_at')
        )
        return await self.clear_record_repository.create(clear_record)
    
    async def update_clear_record(self, record_id: int, user_id: int, update_data: dict) -> Optional[ClearRecord]:
        """クリア記録を更新"""
        # 既存記録を取得してユーザー権限をチェック
        existing_record = await self.clear_record_repository.find_by_id(record_id)
        if not existing_record or existing_record.user_id != user_id:
            return None
        
        # 更新データを適用
        existing_record.is_cleared = update_data.get('is_cleared', existing_record.is_cleared)
        existing_record.is_no_continue_clear = update_data.get('is_no_continue_clear', existing_record.is_no_continue_clear)
        existing_record.is_no_bomb_clear = update_data.get('is_no_bomb_clear', existing_record.is_no_bomb_clear)
        existing_record.is_no_miss_clear = update_data.get('is_no_miss_clear', existing_record.is_no_miss_clear)
        existing_record.is_full_spell_card = update_data.get('is_full_spell_card', existing_record.is_full_spell_card)
        existing_record.is_special_clear_1 = update_data.get('is_special_clear_1', existing_record.is_special_clear_1)
        existing_record.is_special_clear_2 = update_data.get('is_special_clear_2', existing_record.is_special_clear_2)
        existing_record.is_special_clear_3 = update_data.get('is_special_clear_3', existing_record.is_special_clear_3)
        existing_record.mode = update_data.get('mode', existing_record.mode)
        
        # cleared_atの処理
        if 'cleared_at' in update_data:
            existing_record.cleared_at = update_data['cleared_at']
        
        return await self.clear_record_repository.update(existing_record)
    
    async def delete_clear_record(self, record_id: int, user_id: int) -> bool:
        """クリア記録を削除"""
        # 既存記録を取得してユーザー権限をチェック
        existing_record = await self.clear_record_repository.find_by_id(record_id)
        if not existing_record or existing_record.user_id != user_id:
            return False
        
        return await self.clear_record_repository.delete(record_id)
    
    async def create_or_update_clear_record(self, user_id: int, clear_record_data: dict) -> ClearRecord:
        """クリア記録を作成または更新（UPSERT）"""
        try:
            clear_record = ClearRecord(
                user_id=user_id,
                game_id=clear_record_data.get('game_id'),
                character_name=clear_record_data.get('character_name'),
                difficulty=clear_record_data.get('difficulty'),
                mode=clear_record_data.get('mode', 'normal'),
                is_cleared=clear_record_data.get('is_cleared', False),
                is_no_continue_clear=clear_record_data.get('is_no_continue_clear', False),
                is_no_bomb_clear=clear_record_data.get('is_no_bomb_clear', False),
                is_no_miss_clear=clear_record_data.get('is_no_miss_clear', False),
                is_full_spell_card=clear_record_data.get('is_full_spell_card', False),
                is_special_clear_1=clear_record_data.get('is_special_clear_1', False),
                is_special_clear_2=clear_record_data.get('is_special_clear_2', False),
                is_special_clear_3=clear_record_data.get('is_special_clear_3', False),
                cleared_at=clear_record_data.get('cleared_at')
            )
            result = await self.clear_record_repository.create_or_update(clear_record)
            return result
        except Exception as e:
            raise e
    
    async def upsert_clear_record(self, user_id: int, clear_record_data: dict) -> ClearRecord:
        """クリア記録をUpsert（作成または更新）"""
        return await self.create_or_update_clear_record(user_id, clear_record_data)
    
    async def batch_create_or_update_records(self, user_id: int, records_data: List[dict]) -> List[ClearRecord]:
        """複数のクリア記録を一括で作成または更新"""
        results = []
        for record_data in records_data:
            try:
                result = await self.create_or_update_clear_record(user_id, record_data)
                results.append(result)
            except Exception as e:
                raise e
        return results
    
    async def batch_upsert_clear_records(self, user_id: int, records_data: List[dict]) -> List[ClearRecord]:
        """複数のクリア記録を一括でUpsert"""
        return await self.batch_create_or_update_records(user_id, records_data)