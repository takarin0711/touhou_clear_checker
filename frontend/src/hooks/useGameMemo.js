/**
 * ゲームメモ管理のカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';
import { gameMemoApi } from '../services/gameMemoApi';

/**
 * ゲームメモ管理フック
 * @param {number} gameId - ゲームID
 * @returns {Object} ゲームメモ管理の状態と操作
 */
export const useGameMemo = (gameId) => {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /**
   * ゲームメモを取得
   */
  const fetchMemo = useCallback(async () => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameMemoApi.getGameMemo(gameId);
      setMemo(data);
    } catch (err) {
      console.error('ゲームメモ取得エラー:', err);
      setError(err.response?.data?.detail || 'ゲームメモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  /**
   * ゲームメモを作成
   */
  const createMemo = useCallback(async (memoText) => {
    if (!gameId) return { success: false, error: 'ゲームIDが指定されていません' };
    
    setError(null);
    setSaving(true);
    
    try {
      const newMemo = await gameMemoApi.createGameMemo(gameId, memoText);
      setMemo(newMemo);
      return { success: true, data: newMemo };
    } catch (err) {
      console.error('ゲームメモ作成エラー:', err);
      const errorMessage = err.response?.data?.detail || 'ゲームメモの作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [gameId]);

  /**
   * ゲームメモを更新
   */
  const updateMemo = useCallback(async (memoText) => {
    if (!gameId || !memo) return { success: false, error: 'メモが存在しません' };
    
    setError(null);
    setSaving(true);
    
    try {
      const updatedMemo = await gameMemoApi.updateGameMemo(gameId, memoText);
      setMemo(updatedMemo);
      return { success: true, data: updatedMemo };
    } catch (err) {
      console.error('ゲームメモ更新エラー:', err);
      const errorMessage = err.response?.data?.detail || 'ゲームメモの更新に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [gameId, memo]);

  /**
   * ゲームメモを削除
   */
  const deleteMemo = useCallback(async () => {
    if (!gameId || !memo) return { success: false, error: 'メモが存在しません' };
    
    setError(null);
    setSaving(true);
    
    try {
      await gameMemoApi.deleteGameMemo(gameId);
      setMemo(null);
      return { success: true };
    } catch (err) {
      console.error('ゲームメモ削除エラー:', err);
      const errorMessage = err.response?.data?.detail || 'ゲームメモの削除に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [gameId, memo]);

  /**
   * ゲームメモを保存（作成または更新）
   */
  const saveMemo = useCallback(async (memoText) => {
    if (!memoText || memoText.trim() === '') {
      // 空の場合は削除
      if (memo) {
        return await deleteMemo();
      }
      return { success: true };
    }

    if (memo) {
      return await updateMemo(memoText);
    } else {
      return await createMemo(memoText);
    }
  }, [memo, createMemo, updateMemo, deleteMemo]);

  /**
   * メモが存在するかチェック
   */
  const hasMemo = useCallback(() => {
    return memo != null && memo.memo != null && memo.memo.trim() !== '';
  }, [memo]);

  /**
   * メモのテキストを取得
   */
  const getMemoText = useCallback(() => {
    return memo?.memo || '';
  }, [memo]);

  // 初期データ取得
  useEffect(() => {
    fetchMemo();
  }, [fetchMemo]);

  return {
    memo,
    loading,
    error,
    saving,
    fetchMemo,
    createMemo,
    updateMemo,
    deleteMemo,
    saveMemo,
    hasMemo,
    getMemoText,
    refetch: fetchMemo
  };
};