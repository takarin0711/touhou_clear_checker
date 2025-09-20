import React, { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { useGameCharacters } from '../../games/hooks/useGameCharacters';
import { useClearRecords } from '../../../hooks/useClearRecords';
import { useGameMemo } from '../../../hooks/useGameMemo';
import { DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, getDifficultyOrderForGame } from '../../../types/clearStatus';
import { CLEAR_CONDITIONS_ARRAY, CLEAR_CONDITION_LABELS, getClearConditionsForGameType } from '../../../types/clearRecord';
import { GAME_MODES, isModeAvailableForGame } from '../../../constants/gameConstants';
import GameModeSelector from './GameModeSelector';

/**
 * 機体別条件式クリア状況入力フォーム
 */
const IndividualTabClearForm = ({ game, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('Easy');
  const [difficultyData, setDifficultyData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedMode, setSelectedMode] = useState(GAME_MODES.LEGACY); // 紺珠伝用モード

  const { characters, loading: charactersLoading, error: charactersError } = useGameCharacters(game?.id);
  const { submitIndividualConditions, loading: submitLoading } = useClearRecords();
  const { getMemoText, saveMemo } = useGameMemo(game?.id);
  const [memoText, setMemoText] = useState('');

  // ゲームタイプに応じたクリア条件配列を取得
  // 花映塚(id=4)と獣王園(id=15)の場合は強制的にversusとして扱う
  const isVersus = game?.id === 4 || game?.id === 15 || game?.game_type === 'versus';
  const availableConditions = getClearConditionsForGameType(isVersus ? 'versus' : game?.game_type);

  // 難易度設定を生成（ゲーム・モード別）
  const difficultyOrder = getDifficultyOrderForGame(game, selectedMode);
  const difficulties = difficultyOrder.map(diffKey => ({
    key: diffKey,
    label: DIFFICULTY_LABELS[diffKey],
    color: DIFFICULTY_COLORS[diffKey]
  }));

  // 難易度データを初期化（モード変更時も再初期化）
  useEffect(() => {
    if (!game) return;
    
    const initialData = {};
    const difficultyOrder = getDifficultyOrderForGame(game, selectedMode);
    difficultyOrder.forEach(diff => {
      initialData[diff] = { characters: {} };
    });
    setDifficultyData(initialData);
    
    // アクティブタブが新しい難易度リストに含まれない場合は最初の難易度に変更
    if (difficultyOrder.length > 0 && !difficultyOrder.includes(activeTab)) {
      setActiveTab(difficultyOrder[0]);
    }
  }, [game, selectedMode]);

  // メモテキストを初期化
  useEffect(() => {
    setMemoText(getMemoText());
  }, [getMemoText]);

  const handleCharacterConditionChange = (charId, conditionKey) => {
    setDifficultyData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        characters: {
          ...prev[activeTab].characters,
          [charId]: {
            ...prev[activeTab].characters[charId],
            [conditionKey]: !prev[activeTab].characters[charId]?.[conditionKey]
          }
        }
      }
    }));
  };

  const getCharacterConditions = (charId) => {
    return difficultyData[activeTab]?.characters[charId] || {};
  };

  const getSelectedCharCount = (difficulty) => {
    const chars = difficultyData[difficulty]?.characters || {};
    return Object.keys(chars).filter(charId => 
      Object.values(chars[charId] || {}).some(Boolean)
    ).length;
  };

  const getTotalEntries = () => {
    let total = 0;
    Object.keys(difficultyData).forEach(difficulty => {
      const chars = difficultyData[difficulty]?.characters || {};
      Object.keys(chars).forEach(charId => {
        const conditions = chars[charId] || {};
        total += Object.values(conditions).filter(Boolean).length;
      });
    });
    return total;
  };

  const getActiveDifficulty = () => {
    return difficulties.find(d => d.key === activeTab);
  };

  const hasDataInTab = (difficulty) => {
    return getSelectedCharCount(difficulty) > 0;
  };

  const hasAnyCondition = (charId) => {
    const conditions = getCharacterConditions(charId);
    return Object.values(conditions).some(Boolean);
  };

  const getDifficultyColorClasses = (diff, isSelected = false) => {
    const colorMap = {
      'green': {
        bg: isSelected ? 'bg-green-50' : '',
        text: 'text-green-700',
        border: 'border-green-500',
        button: 'bg-green-500'
      },
      'blue': {
        bg: isSelected ? 'bg-blue-50' : '',
        text: 'text-blue-700', 
        border: 'border-blue-500',
        button: 'bg-blue-500'
      },
      'orange': {
        bg: isSelected ? 'bg-orange-50' : '',
        text: 'text-orange-700',
        border: 'border-orange-500', 
        button: 'bg-orange-500'
      },
      'red': {
        bg: isSelected ? 'bg-red-50' : '',
        text: 'text-red-700',
        border: 'border-red-500',
        button: 'bg-red-500'
      },
      'purple': {
        bg: isSelected ? 'bg-purple-50' : '',
        text: 'text-purple-700',
        border: 'border-purple-500',
        button: 'bg-purple-500'
      }
    };
    return colorMap[diff.color] || colorMap.blue;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // 各難易度のデータを送信
      const promises = [];
      
      Object.keys(difficultyData).forEach(difficulty => {
        const chars = difficultyData[difficulty]?.characters || {};
        if (Object.keys(chars).some(charId => Object.values(chars[charId] || {}).some(Boolean))) {
          promises.push(
            submitIndividualConditions(game.id, difficulty, difficultyData[difficulty])
          );
        }
      });

      const results = await Promise.all(promises);
      
      // エラーチェック
      const failed = results.filter(result => !result.success);
      if (failed.length > 0) {
        throw new Error(failed[0].error);
      }

      // メモを保存
      if (memoText.trim() !== getMemoText()) {
        await saveMemo(memoText);
      }

      onSuccess?.();
    } catch (error) {
      console.error('クリア記録登録エラー:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (charactersLoading) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (charactersError) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-red-600">エラー: {charactersError}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">クリア記録登録</h2>
        <p className="text-gray-600 mb-4">ゲーム: {game?.title}</p>
        
        {/* 紺珠伝用モード選択 */}
        {isModeAvailableForGame(game?.id) && (
          <div className="mb-4">
            <GameModeSelector
              game={game}
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
            />
          </div>
        )}
        
        {getTotalEntries() > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            合計 {getTotalEntries()} 件のクリア記録が登録予定です
            {isModeAvailableForGame(game?.id) && selectedMode && (
              <span className="ml-2 text-gray-500">
                (モード: {selectedMode === GAME_MODES.LEGACY ? 'Legacy' : 'Pointdevice'})
              </span>
            )}
          </p>
        )}
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-200">
        {difficulties.map(diff => {
          const colors = getDifficultyColorClasses(diff, activeTab === diff.key);
          return (
            <button
              key={diff.key}
              onClick={() => setActiveTab(diff.key)}
              className={`relative flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === diff.key
                  ? `${colors.border} ${colors.text} ${colors.bg}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{diff.label}</span>
              {hasDataInTab(diff.key) && (
                <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${colors.button} text-white`}>
                  {getSelectedCharCount(diff.key)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        <div className={`${getDifficultyColorClasses(getActiveDifficulty(), true).bg} rounded-lg p-6`}>
          <div className="mb-6">
            <h3 className={`text-lg font-medium ${getDifficultyColorClasses(getActiveDifficulty()).text} mb-2`}>
              {getActiveDifficulty()?.label} 難易度のクリア状況
            </h3>
            <p className="text-sm text-gray-600">
              機体・ショットタイプごとに達成した条件を選択してください
            </p>
          </div>

          {/* キャラクター別条件選択 */}
          <div className="space-y-6">
            {characters.map(char => (
              <div key={char.id} className="bg-white rounded-lg border-2 p-6 transition-all hover:shadow-sm"
                style={{
                  borderColor: hasAnyCondition(char.id) 
                    ? getDifficultyColorClasses(getActiveDifficulty()).border.replace('border-', '#')
                    : '#e5e7eb'
                }}>
                
                {/* キャラクター情報 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{char.character_name}</h4>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs rounded ${getDifficultyColorClasses(getActiveDifficulty()).button} text-white mr-2`}>
                          機体
                        </span>
                        <span className="text-sm text-gray-500">{char.description}</span>
                      </div>
                    </div>
                  </div>
                  {hasAnyCondition(char.id) && (
                    <div className="flex items-center">
                      <span className={`${getDifficultyColorClasses(getActiveDifficulty()).text} text-sm font-medium mr-2`}>
                        {Object.values(getCharacterConditions(char.id)).filter(Boolean).length}件選択中
                      </span>
                      <span className={`${getDifficultyColorClasses(getActiveDifficulty()).text} text-xl`}>✓</span>
                    </div>
                  )}
                </div>

                {/* 特殊条件チェックボックス */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableConditions.map(conditionKey => (
                    <label 
                      key={conditionKey}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        getCharacterConditions(char.id)[conditionKey]
                          ? `${getDifficultyColorClasses(getActiveDifficulty(), true).bg} ${getDifficultyColorClasses(getActiveDifficulty()).border} border-2`
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={getCharacterConditions(char.id)[conditionKey] || false}
                        onChange={() => handleCharacterConditionChange(char.id, conditionKey)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className={`font-medium text-sm ${
                            getCharacterConditions(char.id)[conditionKey] 
                              ? getDifficultyColorClasses(getActiveDifficulty()).text 
                              : 'text-gray-700'
                          }`}>
                            {CLEAR_CONDITION_LABELS[conditionKey]}
                          </span>
                        </div>
                        {getCharacterConditions(char.id)[conditionKey] && (
                          <span className={`${getDifficultyColorClasses(getActiveDifficulty()).text} ml-2`}>✓</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 現在の選択状況表示 */}
          {getSelectedCharCount(activeTab) > 0 && (
            <div className="mt-6 p-4 bg-white border rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                {getActiveDifficulty()?.label} で登録される記録一覧
              </h5>
              <div className="space-y-2">
                {characters.map(char => {
                  const conditions = getCharacterConditions(char.id);
                  const selectedConditions = Object.entries(conditions)
                    .filter(([_, selected]) => selected)
                    .map(([conditionKey]) => ({ key: conditionKey, label: CLEAR_CONDITION_LABELS[conditionKey] }));
                  
                  if (selectedConditions.length === 0) return null;
                  
                  return (
                    <div key={char.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        {char.character_name}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedConditions.map(condition => (
                          <span 
                            key={condition.key} 
                            className={`px-2 py-1 text-xs rounded-full ${getDifficultyColorClasses(getActiveDifficulty()).button} text-white`}
                          >
                            {condition.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* メモ入力 */}
      <div className="p-6 border-t border-gray-200">
        <div className="mb-4">
          <label htmlFor="gameMemo" className="block text-sm font-medium text-gray-700 mb-2">
            ゲームメモ
          </label>
          <textarea
            id="gameMemo"
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="このゲームに関するメモや感想を入力してください..."
          />
        </div>
      </div>

      {/* フッターボタン */}
      <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          {getTotalEntries() > 0 && `合計 ${getTotalEntries()} 件のクリア記録を登録します`}
        </div>
        <div className="flex space-x-4">
          <Button onClick={onClose} variant="outline">
            キャンセル
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={getTotalEntries() === 0 || submitting || submitLoading}
            variant="primary"
          >
            {submitting || submitLoading ? '登録中...' : 'すべて登録する'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndividualTabClearForm;