import React, { useState } from 'react';
import Button from '../common/Button';

/**
 * タブ式難易度選択クリア状況入力フォームのモックアップ
 */
const TabClearStatusForm = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState('easy');
  const [difficultyData, setDifficultyData] = useState({
    easy: { characters: {}, specialClears: { no_continue: false, no_bomb: false, no_miss: false } },
    normal: { characters: {}, specialClears: { no_continue: false, no_bomb: false, no_miss: false } },
    hard: { characters: {}, specialClears: { no_continue: false, no_bomb: false, no_miss: false } },
    lunatic: { characters: {}, specialClears: { no_continue: false, no_bomb: false, no_miss: false } },
    extra: { characters: {}, specialClears: { no_continue: false, no_bomb: false, no_miss: false } }
  });

  // モックデータ：実際は作品ごとに違う
  const difficulties = [
    { key: 'easy', label: 'Easy', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { key: 'normal', label: 'Normal', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { key: 'hard', label: 'Hard', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { key: 'lunatic', label: 'Lunatic', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    { key: 'extra', label: 'Extra', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' }
  ];

  const characters = [
    { key: 'reimu_a', label: '霊夢', shotType: 'ショットA', description: '誘導性能重視' },
    { key: 'reimu_b', label: '霊夢', shotType: 'ショットB', description: '攻撃力重視' },
    { key: 'marisa_a', label: '魔理沙', shotType: 'ショットA', description: 'レーザー型' },
    { key: 'marisa_b', label: '魔理沙', shotType: 'ショットB', description: 'ミサイル型' }
  ];

  const handleCharacterChange = (charKey) => {
    setDifficultyData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        characters: {
          ...prev[activeTab].characters,
          [charKey]: !prev[activeTab].characters[charKey]
        }
      }
    }));
  };

  const handleSpecialClearChange = (type) => {
    setDifficultyData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        specialClears: {
          ...prev[activeTab].specialClears,
          [type]: !prev[activeTab].specialClears[type]
        }
      }
    }));
  };

  const getSelectedCharCount = (difficulty) => {
    return Object.values(difficultyData[difficulty].characters).filter(Boolean).length;
  };

  const getTotalEntries = () => {
    return Object.keys(difficultyData).reduce((total, difficulty) => {
      const charCount = getSelectedCharCount(difficulty);
      return total + (charCount > 0 ? charCount : 0);
    }, 0);
  };

  const getActiveDifficulty = () => {
    return difficulties.find(d => d.key === activeTab);
  };

  const hasDataInTab = (difficulty) => {
    return getSelectedCharCount(difficulty) > 0;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">クリア状況登録（タブ式）</h2>
        <p className="text-gray-600">ゲーム: {game?.title || '東方紅魔郷'}</p>
        {getTotalEntries() > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            合計 {getTotalEntries()} 件の組み合わせが登録予定です
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
                ? `border-${diff.color.split('-')[1]}-500 ${diff.textColor} bg-${diff.color.split('-')[1]}-50`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{diff.label}</span>
            {hasDataInTab(diff.key) && (
              <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-${diff.color.split('-')[1]}-500 text-white`}>
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
              使用したキャラクター・ショットタイプを選択してください
            </p>
          </div>

          {/* キャラクター選択 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">使用キャラクター・ショットタイプ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map(char => (
                <label 
                  key={char.key}
                  className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                  style={{
                    borderColor: difficultyData[activeTab].characters[char.key] 
                      ? getActiveDifficulty()?.color.replace('bg-', 'border-')
                      : 'rgb(229, 231, 235)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={difficultyData[activeTab].characters[char.key] || false}
                    onChange={() => handleCharacterChange(char.key)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{char.label}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${getActiveDifficulty()?.color} text-white`}>
                          {char.shotType}
                        </span>
                      </div>
                      {difficultyData[activeTab].characters[char.key] && (
                        <span className={`${getActiveDifficulty()?.textColor} text-xl`}>✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{char.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 特殊クリア条件 */}
          {getSelectedCharCount(activeTab) > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">特殊クリア条件（この難易度のすべてに適用）</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white">
                  <input
                    type="checkbox"
                    checked={difficultyData[activeTab].specialClears.no_continue}
                    onChange={() => handleSpecialClearChange('no_continue')}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">ノーコンティニュー</span>
                    <p className="text-sm text-gray-500">コンティニューなし</p>
                  </div>
                </label>

                <label className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white">
                  <input
                    type="checkbox"
                    checked={difficultyData[activeTab].specialClears.no_bomb}
                    onChange={() => handleSpecialClearChange('no_bomb')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">ノーボム</span>
                    <p className="text-sm text-gray-500">ボムを使用しない</p>
                  </div>
                </label>

                <label className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white">
                  <input
                    type="checkbox"
                    checked={difficultyData[activeTab].specialClears.no_miss}
                    onChange={() => handleSpecialClearChange('no_miss')}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">ノーミス</span>
                    <p className="text-sm text-gray-500">被弾なし</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 現在の選択状況表示 */}
          {getSelectedCharCount(activeTab) > 0 && (
            <div className="mt-6 p-4 bg-white border rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                {getActiveDifficulty()?.label} で登録される組み合わせ ({getSelectedCharCount(activeTab)} 件)
              </h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(difficultyData[activeTab].characters)
                  .filter(([_, selected]) => selected)
                  .map(([charKey]) => {
                    const char = characters.find(c => c.key === charKey);
                    const specialFlags = [];
                    if (difficultyData[activeTab].specialClears.no_continue) specialFlags.push('NC');
                    if (difficultyData[activeTab].specialClears.no_bomb) specialFlags.push('NB');
                    if (difficultyData[activeTab].specialClears.no_miss) specialFlags.push('NM');
                    
                    return (
                      <span key={charKey} className={`px-3 py-1 text-xs rounded-full ${getActiveDifficulty()?.color} text-white flex items-center`}>
                        {char?.label} {char?.shotType}
                        {specialFlags.length > 0 && (
                          <span className="ml-2 opacity-80">({specialFlags.join(',')})</span>
                        )}
                      </span>
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
          {getTotalEntries() > 0 && `合計 ${getTotalEntries()} 件の組み合わせを登録します`}
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

export default TabClearStatusForm;