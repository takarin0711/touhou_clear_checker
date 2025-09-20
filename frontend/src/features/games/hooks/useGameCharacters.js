import { useState, useEffect } from 'react';
import { gameCharacterApi } from '../services/gameCharacterApi';

/**
 * ゲーム機体データ管理フック（統合game_charactersテーブル対応）
 * @param {number} gameId - ゲームID
 * @returns {Object} フック戻り値
 */
export const useGameCharacters = (gameId) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 機体一覧を取得
   */
  const fetchCharacters = async () => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameCharacterApi.getGameCharacters(gameId);
      setCharacters(data);
    } catch (err) {
      setError(err.message || '機体データの取得に失敗しました');
      console.error('機体データ取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 機体を作成（管理者のみ）
   * @param {Object} characterData - 機体データ
   * @returns {Promise<boolean>} 成功フラグ
   */
  const createCharacter = async (characterData) => {
    if (!gameId) return false;
    
    try {
      const newCharacter = await gameCharacterApi.createGameCharacter(gameId, characterData);
      setCharacters(prev => [...prev, newCharacter].sort((a, b) => a.sort_order - b.sort_order));
      return true;
    } catch (err) {
      setError(err.message || '機体の作成に失敗しました');
      console.error('機体作成エラー:', err);
      return false;
    }
  };

  /**
   * 機体を更新（管理者のみ）
   * @param {number} characterId - 機体ID
   * @param {Object} characterData - 更新データ
   * @returns {Promise<boolean>} 成功フラグ
   */
  const updateCharacter = async (characterId, characterData) => {
    try {
      const updatedCharacter = await gameCharacterApi.updateGameCharacter(characterId, characterData);
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId ? updatedCharacter : char
        ).sort((a, b) => a.sort_order - b.sort_order)
      );
      return true;
    } catch (err) {
      setError(err.message || '機体の更新に失敗しました');
      console.error('機体更新エラー:', err);
      return false;
    }
  };

  /**
   * 機体を削除（管理者のみ）
   * @param {number} characterId - 機体ID
   * @returns {Promise<boolean>} 成功フラグ
   */
  const deleteCharacter = async (characterId) => {
    try {
      await gameCharacterApi.deleteGameCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      return true;
    } catch (err) {
      setError(err.message || '機体の削除に失敗しました');
      console.error('機体削除エラー:', err);
      return false;
    }
  };

  /**
   * エラーをクリア
   */
  const clearError = () => {
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

/**
 * 機体数取得専用フック
 * @param {number} gameId - ゲームID
 * @returns {Object} フック戻り値
 */
export const useGameCharacterCount = (gameId) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCount = async () => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await gameCharacterApi.getGameCharacterCount(gameId);
      setCount(data.character_count);
    } catch (err) {
      setError(err.message || '機体数の取得に失敗しました');
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