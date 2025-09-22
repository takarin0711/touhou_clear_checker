/**
 * ゲームメモ管理のカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';
import { gameMemoApi } from '../services/gameMemoApi';

interface UseGameMemoReturn {
  memo: any;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveMemo: (text: string) => Promise<void>;
  getMemoText: () => string;
  hasMemo: () => boolean;
}

/**
 * ゲームメモ管理フック
 * @param gameId - ゲームID
 * @returns ゲームメモ管理の状態と操作
 */
export const useGameMemo = (gameId: number): UseGameMemoReturn => {
  const [memo, setMemo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  /**
   * ゲームメモを取得
   */
  const fetchMemo = useCallback(async (): Promise<void> => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameMemoApi.getGameMemo(gameId);
      setMemo(data);
    } catch (err) {
      console.error('ゲームメモ取得エラー:', err);
      setError((err as any).response?.data?.detail || 'ゲームメモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  /**
   * ゲームメモを作成
   */
  const createMemo = useCallback(async (memoText: string): Promise<any> => {
    if (!gameId) return { success: false, error: 'ゲームIDが指定されていません' };
    
    setError(null);
    setSaving(true);
    
    try {
      const newMemo = await gameMemoApi.createGameMemo(gameId, memoText);
      setMemo(newMemo);
      return { success: true, data: newMemo };
    } catch (err) {
      console.error('ゲームメモ作成エラー:', err);
      const errorMessage = (err as any).response?.data?.detail || 'ゲームメモの作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [gameId]);

  /**
   * ゲームメモを更新
   */
  const updateMemo = useCallback(async (memoText: string): Promise<any> => {
    if (!gameId || !memo) return { success: false, error: 'メモが存在しません' };
    
    setError(null);
    setSaving(true);
    
    try {
      const updatedMemo = await gameMemoApi.updateGameMemo(gameId, memoText);
      setMemo(updatedMemo);
      return { success: true, data: updatedMemo };
    } catch (err) {
      console.error('ゲームメモ更新エラー:', err);
      const errorMessage = (err as any).response?.data?.detail || 'ゲームメモの更新に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [gameId, memo]);

  /**
   * ゲームメモを削除
   */
  const deleteMemo = useCallback(async (): Promise<any> => {
    if (!gameId || !memo) return { success: false, error: 'メモが存在しません' };
    
    setError(null);
    setSaving(true);
    
    try {
      await gameMemoApi.deleteGameMemo(gameId);
      setMemo(null);
      return { success: true };
    } catch (err) {
      console.error('ゲームメモ削除エラー:', err);
      const errorMessage = (err as any).response?.data?.detail || 'ゲームメモの削除に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [gameId, memo]);

  /**
   * ゲームメモを保存（作成または更新）
   */
  const saveMemo = useCallback(async (memoText: string): Promise<void> => {
    if (!memoText || memoText.trim() === '') {
      // 空の場合は削除
      if (memo) {
        await deleteMemo();
      }
      return;
    }

    if (memo) {
      await updateMemo(memoText);
    } else {
      await createMemo(memoText);
    }
  }, [memo, createMemo, updateMemo, deleteMemo]);

  /**
   * メモが存在するかチェック
   */
  const hasMemo = useCallback((): boolean => {
    return memo != null && memo.memo != null && memo.memo.trim() !== '';
  }, [memo]);

  /**
   * メモのテキストを取得
   */
  const getMemoText = useCallback((): string => {
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
    saveMemo,
    hasMemo,
    getMemoText
  };
};