import React, { useState } from 'react';
import Button from '../common/Button';

/**
 * チェックボックス式クリア状況入力フォームのモックアップ
 * 実際のデータ送信はしない表示専用コンポーネント
 */
const CheckboxClearStatusForm = ({ game, onClose }) => {
  const [selectedDifficulties, setSelectedDifficulties] = useState({});
  const [selectedCharacters, setSelectedCharacters] = useState({});
  const [specialClears, setSpecialClears] = useState({
    no_continue: false,
    no_bomb: false,
    no_miss: false
  });

  // モックデータ：実際は作品ごとに違う
  const difficulties = [
    { key: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { key: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { key: 'hard', label: 'Hard', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'lunatic', label: 'Lunatic', color: 'bg-red-100 text-red-800' },
    { key: 'extra', label: 'Extra', color: 'bg-purple-100 text-purple-800' }
  ];

  // モックデータ：作品ごとに変わる想定
  const characters = [
    { key: 'reimu_a', label: '霊夢 - ショットA' },
    { key: 'reimu_b', label: '霊夢 - ショットB' },
    { key: 'marisa_a', label: '魔理沙 - ショットA' },
    { key: 'marisa_b', label: '魔理沙 - ショットB' }
  ];

  const handleDifficultyChange = (diffKey) => {
    setSelectedDifficulties(prev => ({
      ...prev,
      [diffKey]: !prev[diffKey]
    }));
  };

  const handleCharacterChange = (charKey) => {
    setSelectedCharacters(prev => ({
      ...prev,
      [charKey]: !prev[charKey]
    }));
  };

  const handleSpecialClearChange = (type) => {
    setSpecialClears(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const getSelectedCount = () => {
    const diffCount = Object.values(selectedDifficulties).filter(Boolean).length;
    const charCount = Object.values(selectedCharacters).filter(Boolean).length;
    return diffCount * charCount;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">クリア状況登録（新デザイン案）</h2>
        <p className="text-gray-600">ゲーム: {game?.title || '東方紅魔郷'}</p>
        {getSelectedCount() > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {getSelectedCount()}組み合わせが選択されています
          </p>
        )}
      </div>

      <div className="space-y-8">
        {/* 難易度選択 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">クリアした難易度</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {difficulties.map(diff => (
              <label 
                key={diff.key}
                className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedDifficulties[diff.key] || false}
                  onChange={() => handleDifficultyChange(diff.key)}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-full p-2 rounded-md transition-all ${
                  selectedDifficulties[diff.key] 
                    ? `${diff.color} ring-2 ring-offset-1 ring-blue-500` 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="font-medium">{diff.label}</span>
                  {selectedDifficulties[diff.key] && (
                    <span className="ml-2">✓</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* キャラクター選択 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">使用キャラクター</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {characters.map(char => (
              <label 
                key={char.key}
                className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCharacters[char.key] || false}
                  onChange={() => handleCharacterChange(char.key)}
                  className="sr-only"
                />
                <div className={`flex items-center justify-between w-full p-2 rounded-md transition-all ${
                  selectedCharacters[char.key] 
                    ? 'bg-indigo-100 text-indigo-800 ring-2 ring-offset-1 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="font-medium">{char.label}</span>
                  {selectedCharacters[char.key] && (
                    <span className="text-indigo-600">✓</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 特殊クリア条件 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">特殊クリア条件（オプション）</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={specialClears.no_continue}
                onChange={() => handleSpecialClearChange('no_continue')}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">ノーコンティニュー</span>
                <p className="text-sm text-gray-500">コンティニューなしでクリア</p>
              </div>
            </label>

            <label className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={specialClears.no_bomb}
                onChange={() => handleSpecialClearChange('no_bomb')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">ノーボム</span>
                <p className="text-sm text-gray-500">ボムを使わずにクリア</p>
              </div>
            </label>

            <label className="relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={specialClears.no_miss}
                onChange={() => handleSpecialClearChange('no_miss')}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">ノーミス</span>
                <p className="text-sm text-gray-500">被弾なしでクリア</p>
              </div>
            </label>
          </div>
        </div>

        {/* プレビュー */}
        {getSelectedCount() > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">登録予定の組み合わせ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(selectedDifficulties)
                .filter(([_, selected]) => selected)
                .flatMap(([diffKey]) => 
                  Object.entries(selectedCharacters)
                    .filter(([_, selected]) => selected)
                    .map(([charKey]) => {
                      const diff = difficulties.find(d => d.key === diffKey);
                      const char = characters.find(c => c.key === charKey);
                      return (
                        <div key={`${diffKey}-${charKey}`} className="flex items-center justify-between bg-white px-3 py-1 rounded border">
                          <span>{diff?.label} - {char?.label}</span>
                          <div className="flex space-x-1 text-xs">
                            {specialClears.no_continue && <span className="text-green-600">NC</span>}
                            {specialClears.no_bomb && <span className="text-orange-600">NB</span>}
                            {specialClears.no_miss && <span className="text-red-600">NM</span>}
                          </div>
                        </div>
                      );
                    })
                )}
            </div>
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex justify-end space-x-4 mt-8">
        <Button onClick={onClose} variant="outline">
          キャンセル
        </Button>
        <Button 
          disabled={getSelectedCount() === 0}
          variant="primary"
        >
          登録する（{getSelectedCount()}件）
        </Button>
      </div>
    </div>
  );
};

export default CheckboxClearStatusForm;