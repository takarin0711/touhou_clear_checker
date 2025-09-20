/**
 * 機体別個別条件登録フォーム（clearStatusの頃のデザイン再現）
 */
import React, { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { DIFFICULTIES, getDifficultyOrderForGame } from '../../../types/difficulty';
import { GAME_MODES, isModeAvailableForGame } from '../../../constants/gameConstants';
import { useGameCharacters } from '../../games/hooks/useGameCharacters';
import { useClearRecords } from '../../../hooks/useClearRecords';

const IndividualTabClearForm = ({ game, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('Easy');
  const [selectedMode, setSelectedMode] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 各難易度での機体別条件状態を管理
  const [difficultyData, setDifficultyData] = useState({});

  const { characters, loading: charactersLoading } = useGameCharacters(game.id);
  const { submitIndividualConditions } = useClearRecords();

  // 利用可能な難易度を取得
  const availableDifficulties = getDifficultyOrderForGame(game, selectedMode);
  const isModeGame = isModeAvailableForGame(game?.id);

  // 機体リストが読み込まれた時に初期状態を設定
  useEffect(() => {
    if (characters.length > 0) {
      const currentDifficulties = getDifficultyOrderForGame(game, selectedMode);
      const initialData = {};
      currentDifficulties.forEach(difficulty => {
        initialData[difficulty] = {
          characters: {}
        };
        characters.forEach(character => {
          initialData[difficulty].characters[character.id] = {
            cleared: false,
            no_continue: false,
            no_bomb: false,
            no_miss: false,
            full_spell_card: false
          };
        });
      });
      setDifficultyData(initialData);
      
      // 最初の難易度をアクティブタブに設定
      if (currentDifficulties.length > 0) {
        setActiveTab(currentDifficulties[0]);
      }
    }
  }, [characters, game, selectedMode]);

  // 機体の条件を更新
  const updateCharacterCondition = (difficulty, characterId, conditionType, value) => {
    setDifficultyData(prev => ({
      ...prev,
      [difficulty]: {
        ...prev[difficulty],
        characters: {
          ...prev[difficulty].characters,
          [characterId]: {
            ...prev[difficulty].characters[characterId],
            [conditionType]: value
          }
        }
      }
    }));
  };

  // すべての難易度のすべての機体に登録
  const handleSubmitAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const promises = [];
      
      // 各難易度ごとに送信
      for (const difficulty of availableDifficulties) {
        const data = difficultyData[difficulty];
        if (data && Object.keys(data.characters).length > 0) {
          // 何らかの条件が設定されているかチェック
          const hasConditions = Object.values(data.characters).some(conditions =>
            conditions.cleared || conditions.no_continue || conditions.no_bomb || 
            conditions.no_miss || conditions.full_spell_card
          );
          
          if (hasConditions) {
            promises.push(
              submitIndividualConditions(game.id, difficulty, data, characters)
            );
          }
        }
      }

      if (promises.length === 0) {
        setError('設定されている条件がありません');
        return;
      }

      const results = await Promise.allSettled(promises);
      
      // エラーチェック
      const failures = results.filter(result => result.status === 'rejected' || !result.value?.success);
      
      if (failures.length > 0) {
        setError('一部の登録に失敗しました');
        return;
      }

      onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (charactersLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">機体情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">機体別条件登録</h3>
        <Button onClick={onClose} variant="outline" size="small">
          閉じる
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* モード選択（紺珠伝の場合のみ） */}
      {isModeGame && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">ゲームモード選択</h4>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="normal"
                checked={selectedMode === 'normal'}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mr-2 text-blue-600"
              />
              <span className="text-blue-800">完全無欠モード</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="legacy"
                checked={selectedMode === 'legacy'}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mr-2 text-blue-600"
              />
              <span className="text-blue-800">レガシーモード</span>
            </label>
          </div>
        </div>
      )}

      {/* 難易度タブ */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            {availableDifficulties.map(difficulty => {
              const getDifficultyColors = (diff) => {
                switch (diff) {
                  case 'Easy':
                    return activeTab === diff 
                      ? 'border-green-500 text-green-600 bg-green-50' 
                      : 'border-transparent text-green-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50';
                  case 'Normal':
                    return activeTab === diff 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50';
                  case 'Hard':
                    return activeTab === diff 
                      ? 'border-red-500 text-red-600 bg-red-50' 
                      : 'border-transparent text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50';
                  case 'Lunatic':
                    return activeTab === diff 
                      ? 'border-pink-500 text-pink-600 bg-pink-50' 
                      : 'border-transparent text-pink-600 hover:text-pink-700 hover:border-pink-300 hover:bg-pink-50';
                  case 'Extra':
                  case 'Phantasm':
                    return activeTab === diff 
                      ? 'border-purple-500 text-purple-600 bg-purple-50' 
                      : 'border-transparent text-purple-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50';
                  default:
                    return activeTab === diff 
                      ? 'border-gray-500 text-gray-600 bg-gray-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50';
                }
              };

              return (
                <button
                  key={difficulty}
                  onClick={() => setActiveTab(difficulty)}
                  className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm rounded-t-md transition-all ${getDifficultyColors(difficulty)}`}
                >
                  {difficulty}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 機体別条件設定テーブル */}
      {difficultyData[activeTab] && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">{activeTab} - 機体別条件設定</h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    機体
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クリア
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ノーコン
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ノーボム
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ノーミス
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フルスペカ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {characters.map((character, index) => (
                  <tr key={character.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {character.character_name}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={difficultyData[activeTab].characters[character.id]?.cleared || false}
                        onChange={(e) => updateCharacterCondition(activeTab, character.id, 'cleared', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={difficultyData[activeTab].characters[character.id]?.no_continue || false}
                        onChange={(e) => updateCharacterCondition(activeTab, character.id, 'no_continue', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={difficultyData[activeTab].characters[character.id]?.no_bomb || false}
                        onChange={(e) => updateCharacterCondition(activeTab, character.id, 'no_bomb', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={difficultyData[activeTab].characters[character.id]?.no_miss || false}
                        onChange={(e) => updateCharacterCondition(activeTab, character.id, 'no_miss', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={difficultyData[activeTab].characters[character.id]?.full_spell_card || false}
                        onChange={(e) => updateCharacterCondition(activeTab, character.id, 'full_spell_card', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex justify-end space-x-4">
        <Button onClick={onClose} variant="outline">
          キャンセル
        </Button>
        <Button
          onClick={handleSubmitAll}
          variant="primary"
          disabled={loading}
          size="medium"
        >
          {loading ? '登録中...' : 'すべて登録する'}
        </Button>
      </div>
    </div>
  );
};

export default IndividualTabClearForm;