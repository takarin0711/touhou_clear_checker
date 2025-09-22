/**
 * キャラクター管理のカスタムフック
 */
import { useState, useEffect, useCallback } from 'react';
import { characterApi } from '../services/characterApi';

/**
 * キャラクター管理フック
 * @param gameId - 特定ゲームのキャラクターのみを取得する場合のゲームID
 * @returns キャラクター管理の状態と操作
 */
export const useCharacters = (gameId: number | null = null) => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * キャラクター一覧を取得
   */
  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (gameId) {
        data = await characterApi.getGameCharacters(gameId);
      } else {
        data = await characterApi.getAllCharacters();
      }
      setCharacters(data);
    } catch (err) {
      console.error('キャラクター取得エラー:', err);
      setError((err as any).response?.data?.detail || 'キャラクターの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  /**
   * キャラクターを作成（管理者のみ）
   */
  const createCharacter = useCallback(async (characterData) => {
    setError(null);
    
    try {
      const newCharacter = await characterApi.createCharacter(characterData);
      setCharacters(prev => [...prev, newCharacter]);
      return { success: true, data: newCharacter };
    } catch (err) {
      console.error('キャラクター作成エラー:', err);
      const errorMessage = (err as any).response?.data?.detail || 'キャラクターの作成に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * キャラクターを更新（管理者のみ）
   */
  const updateCharacter = useCallback(async (characterId, characterData) => {
    setError(null);
    
    try {
      const updatedCharacter = await characterApi.updateCharacter(characterId, characterData);
      setCharacters(prev => 
        prev.map(char => char.id === characterId ? updatedCharacter : char)
      );
      return { success: true, data: updatedCharacter };
    } catch (err) {
      console.error('キャラクター更新エラー:', err);
      const errorMessage = (err as any).response?.data?.detail || 'キャラクターの更新に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * キャラクターを削除（管理者のみ）
   */
  const deleteCharacter = useCallback(async (characterId) => {
    setError(null);
    
    try {
      await characterApi.deleteCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      return { success: true };
    } catch (err) {
      console.error('キャラクター削除エラー:', err);
      const errorMessage = (err as any).response?.data?.detail || 'キャラクターの削除に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * IDでキャラクターを検索
   */
  const getCharacterById = useCallback((id) => {
    return characters.find(char => char.id === id);
  }, [characters]);

  /**
   * 名前でキャラクターを検索（部分一致）
   */
  const searchCharactersByName = useCallback((searchTerm) => {
    return characters.filter(char => 
      char.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [characters]);

  // 初期データ取得
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterById,
    searchCharactersByName,
    refetch: fetchCharacters
  };
};