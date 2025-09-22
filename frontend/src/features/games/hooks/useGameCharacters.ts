import { useState, useEffect } from 'react';
import { gameCharacterApi } from '../services/gameCharacterApi';
import { GameCharacter, GameCharacterFormData } from '../../../types/gameCharacter';

interface UseGameCharactersReturn {
  characters: GameCharacter[];
  loading: boolean;
  error: string | null;
  fetchCharacters: () => Promise<void>;
  createCharacter: (characterData: GameCharacterFormData) => Promise<boolean>;
  updateCharacter: (characterId: number, characterData: GameCharacterFormData) => Promise<boolean>;
  deleteCharacter: (characterId: number) => Promise<boolean>;
  clearError: () => void;
}

/**
 * ゲーム機体データ管理フック（統合game_charactersテーブル対応）
 * @param gameId - ゲームID
 * @returns フック戻り値
 */
export const useGameCharacters = (gameId: number): UseGameCharactersReturn => {
  const [characters, setCharacters] = useState<GameCharacter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 機体一覧を取得
   */
  const fetchCharacters = async (): Promise<void> => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameCharacterApi.getGameCharacters(gameId);
      setCharacters(data);
    } catch (err) {
      setError((err as Error).message || '機体データの取得に失敗しました');
      console.error('機体データ取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 機体を作成（管理者のみ）
   * @param characterData - 機体データ
   * @returns 成功フラグ
   */
  const createCharacter = async (characterData: GameCharacterFormData): Promise<boolean> => {
    if (!gameId) return false;
    
    try {
      const newCharacter = await gameCharacterApi.createGameCharacter(gameId, characterData);
      setCharacters(prev => [...prev, newCharacter].sort((a, b) => a.sort_order - b.sort_order));
      return true;
    } catch (err) {
      setError((err as Error).message || '機体の作成に失敗しました');
      console.error('機体作成エラー:', err);
      return false;
    }
  };

  /**
   * 機体を更新（管理者のみ）
   * @param characterId - 機体ID
   * @param characterData - 更新データ
   * @returns 成功フラグ
   */
  const updateCharacter = async (characterId: number, characterData: GameCharacterFormData): Promise<boolean> => {
    try {
      const updatedCharacter = await gameCharacterApi.updateGameCharacter(characterId, characterData);
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId ? updatedCharacter : char
        ).sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (err) {
      setError((err as Error).message || '機体の更新に失敗しました');
      console.error('機体更新エラー:', err);
      return false;
    }
  };

  /**
   * 機体を削除（管理者のみ）
   * @param characterId - 機体ID
   * @returns 成功フラグ
   */
  const deleteCharacter = async (characterId: number): Promise<boolean> => {
    try {
      await gameCharacterApi.deleteGameCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      return true;
    } catch (err) {
      setError((err as Error).message || '機体の削除に失敗しました');
      console.error('機体削除エラー:', err);
      return false;
    }
  };

  /**
   * エラーをクリア
   */
  const clearError = (): void => {
    setError(null);
  };

  // gameIdが変わったら機体一覧を再取得
  useEffect(() => {
    fetchCharacters();
  }, [gameId]);

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    clearError,
  };
};

interface UseGameCharacterCountReturn {
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 機体数取得専用フック
 * @param gameId - ゲームID
 * @returns フック戻り値
 */
export const useGameCharacterCount = (gameId: number): UseGameCharacterCountReturn => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async (): Promise<void> => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameCharacterApi.getGameCharacterCount(gameId);
      setCount(data.character_count);
    } catch (err) {
      setError((err as Error).message || '機体数の取得に失敗しました');
      console.error('機体数取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [gameId]);

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  };
};