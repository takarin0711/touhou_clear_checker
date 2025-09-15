import { useState, useEffect, useCallback } from 'react';
import { clearStatusApi } from '../services/clearStatusApi';

/**
 * クリア状況管理のカスタムフック
 */
export const useClearStatus = (gameId = null) => {
  const [clearStatuses, setClearStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // クリア状況の取得
  const fetchClearStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (gameId) {
        data = await clearStatusApi.getMyClearStatusByGame(gameId);
      } else {
        data = await clearStatusApi.getMyClearStatus();
      }
      setClearStatuses(data);
    } catch (err) {
      console.error('クリア状況の取得に失敗:', err);
      setError(err.response?.data?.detail || 'クリア状況の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // クリア状況の作成
  const createClearStatus = useCallback(async (clearStatusData) => {
    setError(null);
    
    try {
      const newClearStatus = await clearStatusApi.createClearStatus(clearStatusData);
      setClearStatuses(prev => [...prev, newClearStatus]);
      return { success: true, data: newClearStatus };
    } catch (err) {
      console.error('クリア状況の作成に失敗:', err);
      
      // エラーメッセージの適切な抽出
      let errorMessage = 'クリア状況の作成に失敗しました';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // クリア状況の更新
  const updateClearStatus = useCallback(async (clearStatusId, clearStatusData) => {
    setError(null);
    
    try {
      const updatedClearStatus = await clearStatusApi.updateClearStatus(clearStatusId, clearStatusData);
      setClearStatuses(prev => 
        prev.map(cs => cs.id === clearStatusId ? updatedClearStatus : cs)
      );
      return { success: true, data: updatedClearStatus };
    } catch (err) {
      console.error('クリア状況の更新に失敗:', err);
      
      // エラーメッセージの適切な抽出
      let errorMessage = 'クリア状況の更新に失敗しました';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // クリア状況の削除
  const deleteClearStatus = useCallback(async (clearStatusId) => {
    setError(null);
    
    try {
      await clearStatusApi.deleteClearStatus(clearStatusId);
      setClearStatuses(prev => prev.filter(cs => cs.id !== clearStatusId));
      return { success: true };
    } catch (err) {
      console.error('クリア状況の削除に失敗:', err);
      const errorMessage = err.response?.data?.detail || 'クリア状況の削除に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // クリア済みとしてマーク
  const markAsCleared = useCallback(async (gameId, difficulty) => {
    setError(null);
    
    try {
      const clearedStatus = await clearStatusApi.markAsCleared(gameId, difficulty);
      setClearStatuses(prev => {
        const exists = prev.find(cs => cs.game_id === gameId && cs.difficulty === difficulty);
        if (exists) {
          return prev.map(cs => 
            cs.game_id === gameId && cs.difficulty === difficulty ? clearedStatus : cs
          );
        } else {
          return [...prev, clearedStatus];
        }
      });
      return { success: true, data: clearedStatus };
    } catch (err) {
      console.error('クリア状況のマークに失敗:', err);
      const errorMessage = err.response?.data?.detail || 'クリア状況のマークに失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // 特定ゲーム・難易度のクリア状況を取得
  const getClearStatusByGameAndDifficulty = useCallback((gameId, difficulty) => {
    return clearStatuses.find(cs => cs.game_id === gameId && cs.difficulty === difficulty);
  }, [clearStatuses]);

  // 特定ゲームのクリア状況一覧を取得
  const getClearStatusesByGame = useCallback((gameId) => {
    return clearStatuses.filter(cs => cs.game_id === gameId);
  }, [clearStatuses]);

  // 初期データの取得
  useEffect(() => {
    fetchClearStatuses();
  }, [fetchClearStatuses]);

  return {
    clearStatuses,
    loading,
    error,
    fetchClearStatuses,
    createClearStatus,
    updateClearStatus,
    deleteClearStatus,
    markAsCleared,
    getClearStatusByGameAndDifficulty,
    getClearStatusesByGame,
    refetch: fetchClearStatuses,
  };
};