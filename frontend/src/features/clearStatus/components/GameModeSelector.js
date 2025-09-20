import React from 'react';
import { GAME_MODES, GAME_MODE_LABELS, isModeAvailableForGame } from '../../../constants/gameConstants';

/**
 * ゲームモード選択コンポーネント（紺珠伝専用）
 */
const GameModeSelector = ({ game, selectedMode, onModeChange, className = '' }) => {
  // モード選択が不要なゲームの場合は何も表示しない
  if (!game || !isModeAvailableForGame(game.id)) {
    return null;
  }

  const availableModes = [GAME_MODES.POINTDEVICE, GAME_MODES.LEGACY];

  const getModeColors = (mode, isSelected = false) => {
    const colorMap = {
      [GAME_MODES.POINTDEVICE]: {
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        text: isSelected ? 'text-blue-700' : 'text-gray-700',
        border: isSelected ? 'border-blue-500' : 'border-gray-300',
        hover: 'hover:border-blue-400 hover:bg-blue-50'
      },
      [GAME_MODES.LEGACY]: {
        bg: isSelected ? 'bg-red-50' : 'bg-white',
        text: isSelected ? 'text-red-700' : 'text-gray-700',
        border: isSelected ? 'border-red-500' : 'border-gray-300',
        hover: 'hover:border-red-400 hover:bg-red-50'
      }
    };
    return colorMap[mode] || colorMap[GAME_MODES.POINTDEVICE];
  };


  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">ゲームモード選択</h3>
        <p className="text-xs text-gray-600 mb-3">
          紺珠伝では2種類のモードでプレイできます。モードごとにクリア記録を管理します。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableModes.map(mode => {
          const colors = getModeColors(mode, selectedMode === mode);
          const isSelected = selectedMode === mode;
          
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 ${colors.bg} ${colors.text} ${colors.border} ${colors.hover} ${
                isSelected ? 'ring-2 ring-opacity-50' : ''
              } ${isSelected && mode === GAME_MODES.POINTDEVICE ? 'ring-blue-300' : ''} ${
                isSelected && mode === GAME_MODES.LEGACY ? 'ring-red-300' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {GAME_MODE_LABELS[mode]}
                </span>
                {isSelected && (
                  <span className={`text-lg ${mode === GAME_MODES.LEGACY ? 'text-red-500' : 'text-blue-500'}`}>
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedMode && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">選択中:</span>
            <span className={`text-sm font-medium ${
              selectedMode === GAME_MODES.LEGACY ? 'text-red-600' : 'text-blue-600'
            }`}>
              {GAME_MODE_LABELS[selectedMode]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameModeSelector;