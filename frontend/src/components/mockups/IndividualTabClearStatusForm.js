import React, { useState } from 'react';
import Button from '../common/Button';
import { getDifficultyOrderForGame } from '../../types/clearStatus';

// 難易度のスタイリング情報
const difficultyStyles = {
  'Easy': { key: 'easy', label: 'Easy', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-500' },
  'Normal': { key: 'normal', label: 'Normal', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-500' },
  'Hard': { key: 'hard', label: 'Hard', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-500' },
  'Lunatic': { key: 'lunatic', label: 'Lunatic', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-500' },
  'Extra': { key: 'extra', label: 'Extra', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-500' },
  'Phantasm': { key: 'phantasm', label: 'Phantasm', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-500' }
};

/**
 * 機体ごと個別特殊条件選択タブ式クリア状況入力フォームのモックアップ
 */
const IndividualTabClearStatusForm = ({ game, onClose }) => {
  // ゲームに応じた利用可能な難易度を取得
  const availableDifficulties = getDifficultyOrderForGame(game);
  const difficulties = availableDifficulties.map(diff => difficultyStyles[diff]);
  
  const [activeTab, setActiveTab] = useState(difficulties[0]?.key || 'easy');
  const [difficultyData, setDifficultyData] = useState(() => {
    const initialData = {};
    difficulties.forEach(diff => {
      initialData[diff.key] = { characters: {} };
    });
    return initialData;
  });

  const characters = [
    { key: 'reimu_a', label: '博麗霊夢', shotType: 'ショットA', description: '誘導弾重視' },
    { key: 'reimu_b', label: '博麗霊夢', shotType: 'ショットB', description: '攻撃力重視' },
    { key: 'marisa_a', label: '霧雨魔理沙', shotType: 'ショットA', description: 'レーザー型' },
    { key: 'marisa_b', label: '霧雨魔理沙', shotType: 'ショットB', description: 'ミサイル型' }
  ];

  const specialConditions = [
    { key: 'cleared', label: 'クリア', description: '通常クリア', color: 'text-blue-600' },
    { key: 'no_continue', label: 'ノーコンティニュー', description: 'コンティニューなし', color: 'text-green-600' },
    { key: 'no_bomb', label: 'ノーボム', description: 'ボムを使用しない', color: 'text-orange-600' },
    { key: 'no_miss', label: 'ノーミス', description: '被弾なし', color: 'text-red-600' }
  ];

  const handleCharacterConditionChange = (charKey, conditionKey) => {
    setDifficultyData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        characters: {
          ...prev[activeTab].characters,
          [charKey]: {
            ...prev[activeTab].characters[charKey],
            [conditionKey]: !prev[activeTab].characters[charKey]?.[conditionKey]
          }
        }
      }
    }));
  };

  const getCharacterConditions = (charKey) => {
    return difficultyData[activeTab].characters[charKey] || {};
  };

  const getSelectedCharCount = (difficulty) => {
    const chars = difficultyData[difficulty].characters;
    return Object.keys(chars).filter(charKey => 
      Object.values(chars[charKey] || {}).some(Boolean)
    ).length;
  };

  const getTotalEntries = () => {
    let total = 0;
    Object.keys(difficultyData).forEach(difficulty => {
      const chars = difficultyData[difficulty].characters;
      Object.keys(chars).forEach(charKey => {
        const conditions = chars[charKey] || {};
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

  const hasAnyCondition = (charKey) => {
    const conditions = getCharacterConditions(charKey);
    return Object.values(conditions).some(Boolean);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">クリア状況登録（機体別条件選択式）</h2>
        <p className="text-gray-600">ゲーム: {game?.title || '東方紅魔郷'}</p>
        {getTotalEntries() > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            合計 {getTotalEntries()} 件のクリア記録が登録予定です
          </p>
        )}
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-200">
        {difficulties.map(diff => (
          <button
            key={diff.key}
            onClick={() => setActiveTab(diff.key)}
            className={`relative flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === diff.key
                ? `${diff.borderColor} ${diff.textColor} ${diff.bgColor}`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{diff.label}</span>
            {hasDataInTab(diff.key) && (
              <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${diff.color} text-white`}>
                {getSelectedCharCount(diff.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        <div className={`${getActiveDifficulty()?.bgColor} rounded-lg p-6`}>
          <div className="mb-6">
            <h3 className={`text-lg font-medium ${getActiveDifficulty()?.textColor} mb-2`}>
              {getActiveDifficulty()?.label} 難易度のクリア状況
            </h3>
            <p className="text-sm text-gray-600">
              機体・ショットタイプごとに達成した条件を選択してください
            </p>
          </div>

          {/* キャラクター別条件選択 */}
          <div className="space-y-6">
            {characters.map(char => (
              <div key={char.key} className="bg-white rounded-lg border-2 p-6 transition-all hover:shadow-sm"
                style={{
                  borderColor: hasAnyCondition(char.key) 
                    ? getActiveDifficulty()?.borderColor.replace('border-', '')
                    : 'rgb(229, 231, 235)'
                }}>
                
                {/* キャラクター情報 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{char.label}</h4>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs rounded ${getActiveDifficulty()?.color} text-white mr-2`}>
                          {char.shotType}
                        </span>
                        <span className="text-sm text-gray-500">{char.description}</span>
                      </div>
                    </div>
                  </div>
                  {hasAnyCondition(char.key) && (
                    <div className="flex items-center">
                      <span className={`${getActiveDifficulty()?.textColor} text-sm font-medium mr-2`}>
                        {Object.values(getCharacterConditions(char.key)).filter(Boolean).length}件選択中
                      </span>
                      <span className={`${getActiveDifficulty()?.textColor} text-xl`}>✓</span>
                    </div>
                  )}
                </div>

                {/* 特殊条件チェックボックス */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {specialConditions.map(condition => (
                    <label 
                      key={condition.key}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        getCharacterConditions(char.key)[condition.key]
                          ? `${getActiveDifficulty()?.bgColor} ${getActiveDifficulty()?.borderColor} border-2`
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={getCharacterConditions(char.key)[condition.key] || false}
                        onChange={() => handleCharacterConditionChange(char.key, condition.key)}
                        className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 sr-only"
                      />
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className={`font-medium text-sm ${
                            getCharacterConditions(char.key)[condition.key] 
                              ? getActiveDifficulty()?.textColor 
                              : 'text-gray-700'
                          }`}>
                            {condition.label}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{condition.description}</p>
                        </div>
                        {getCharacterConditions(char.key)[condition.key] && (
                          <span className={`${condition.color} ml-2`}>✓</span>
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
                  const conditions = getCharacterConditions(char.key);
                  const selectedConditions = Object.entries(conditions)
                    .filter(([_, selected]) => selected)
                    .map(([conditionKey]) => specialConditions.find(c => c.key === conditionKey));
                  
                  if (selectedConditions.length === 0) return null;
                  
                  return (
                    <div key={char.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        {char.label} - {char.shotType}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedConditions.map(condition => (
                          <span 
                            key={condition.key} 
                            className={`px-2 py-1 text-xs rounded-full ${getActiveDifficulty()?.color} text-white`}
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
            disabled={getTotalEntries() === 0}
            variant="primary"
          >
            すべて登録する
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndividualTabClearStatusForm;