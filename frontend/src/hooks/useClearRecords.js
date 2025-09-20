/**
 * クリア記録管理のカスタムフック（機体別条件対応）
 */
import { useState, useEffect, useCallback } from 'react';
import { clearRecordApi } from '../services/clearRecordApi';

/**
 * クリア記録管理フック
 * @param {number} [gameId] - 特定ゲームの記録のみを取得する場合のゲームID
 * @returns {Object} クリア記録管理の状態と操作
 */
export const useClearRecords = (gameId = null) => {
  const [clearRecords, setClearRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * クリア記録一覧を取得
   */
  const fetchClearRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (gameId) {
        data = await clearRecordApi.getMyClearRecordsByGame(gameId);
      } else {
        data = await clearRecordApi.getMyClearRecords();
      }
      setClearRecords(data);
    } catch (err) {
      console.error('クリア記録取得エラー:', err);
      setError(err.response?.data?.detail || 'クリア記録の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  /**
   * クリア記録を作成
   */
  const createClearRecord = useCallback(async (recordData) => {
    setError(null);
    
    try {
      const newRecord = await clearRecordApi.createClearRecord(recordData);
      setClearRecords(prev => [...prev, newRecord]);
      return { success: true, data: newRecord };
    } catch (err) {
      console.error('クリア記録作成エラー:', err);
      const errorMessage = err.response?.data?.detail || 'クリア記録の作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * クリア記録を更新
   */
  const updateClearRecord = useCallback(async (recordId, updateData) => {
    setError(null);
    
    try {
      const updatedRecord = await clearRecordApi.updateClearRecord(recordId, updateData);
      setClearRecords(prev => 
        prev.map(record => record.id === recordId ? updatedRecord : record)
      );
      return { success: true, data: updatedRecord };
    } catch (err) {
      console.error('クリア記録更新エラー:', err);
      const errorMessage = err.response?.data?.detail || 'クリア記録の更新に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * クリア記録を削除
   */
  const deleteClearRecord = useCallback(async (recordId) => {
    setError(null);
    
    try {
      await clearRecordApi.deleteClearRecord(recordId);
      setClearRecords(prev => prev.filter(record => record.id !== recordId));
      return { success: true };
    } catch (err) {
      console.error('クリア記録削除エラー:', err);
      const errorMessage = err.response?.data?.detail || 'クリア記録の削除に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * クリア記録を作成または更新（UPSERT）
   */
  const createOrUpdateClearRecord = useCallback(async (recordData) => {
    setError(null);
    
    try {
      const record = await clearRecordApi.createOrUpdateClearRecord(recordData);
      setClearRecords(prev => {
        const existingIndex = prev.findIndex(r => 
          r.game_id === record.game_id && 
          r.character_id === record.character_id && 
          r.difficulty === record.difficulty
        );
        
        if (existingIndex >= 0) {
          // 既存記録を更新
          const newRecords = [...prev];
          newRecords[existingIndex] = record;
          return newRecords;
        } else {
          // 新規追加
          return [...prev, record];
        }
      });
      return { success: true, data: record };
    } catch (err) {
      console.error('クリア記録作成/更新エラー:', err);
      const errorMessage = err.response?.data?.detail || 'クリア記録の保存に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * 複数のクリア記録を一括処理
   */
  const batchCreateOrUpdateRecords = useCallback(async (recordsData) => {
    setError(null);
    
    try {
      const records = await clearRecordApi.batchCreateOrUpdateRecords(recordsData);
      
      // 状態を更新（既存レコードの更新と新規追加を処理）
      setClearRecords(prev => {
        const updatedRecords = [...prev];
        
        records.forEach(newRecord => {
          const existingIndex = updatedRecords.findIndex(r => 
            r.game_id === newRecord.game_id && 
            r.character_id === newRecord.character_id && 
            r.difficulty === newRecord.difficulty
          );
          
          if (existingIndex >= 0) {
            updatedRecords[existingIndex] = newRecord;
          } else {
            updatedRecords.push(newRecord);
          }
        });
        
        return updatedRecords;
      });
      
      return { success: true, data: records };
    } catch (err) {
      console.error('一括クリア記録処理エラー:', err);
      const errorMessage = err.response?.data?.detail || '一括処理に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * 機体別条件式データを送信
   */
  const submitIndividualConditions = useCallback(async (gameId, difficulty, difficultyData) => {
    setError(null);
    
    try {
      const records = await clearRecordApi.submitIndividualConditions(gameId, difficulty, difficultyData);
      
      // 状態を更新
      setClearRecords(prev => {
        const updatedRecords = [...prev];
        
        records.forEach(newRecord => {
          const existingIndex = updatedRecords.findIndex(r => 
            r.game_id === newRecord.game_id && 
            r.character_id === newRecord.character_id && 
            r.difficulty === newRecord.difficulty
          );
          
          if (existingIndex >= 0) {
            updatedRecords[existingIndex] = newRecord;
          } else {
            updatedRecords.push(newRecord);
          }
        });
        
        return updatedRecords;
      });
      
      return { success: true, data: records };
    } catch (err) {
      console.error('機体別条件送信エラー:', err);
      const errorMessage = err.response?.data?.detail || '条件の保存に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * 特定の組み合わせでクリア記録を検索
   */
  const getClearRecord = useCallback((gameId, characterId, difficulty) => {
    return clearRecords.find(record => 
      record.game_id === gameId && 
      record.character_id === characterId && 
      record.difficulty === difficulty
    );
  }, [clearRecords]);

  /**
   * ゲーム別のクリア記録を取得
   */
  const getClearRecordsByGame = useCallback((gameId) => {
    return clearRecords.filter(record => record.game_id === gameId);
  }, [clearRecords]);

  // 初期データ取得
  useEffect(() => {
    fetchClearRecords();
  }, [fetchClearRecords]);

  return {
    clearRecords,
    loading,
    error,
    fetchClearRecords,
    createClearRecord,
    updateClearRecord,
    deleteClearRecord,
    createOrUpdateClearRecord,
    batchCreateOrUpdateRecords,
    submitIndividualConditions,
    getClearRecord,
    getClearRecordsByGame,
    refetch: fetchClearRecords
  };
};