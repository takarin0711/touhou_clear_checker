import React, { useState } from 'react';
import { useClearStatus } from '../hooks/useClearStatus';
import { useGames } from '../../games/hooks/useGames';
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../../../types/clearStatus';

/**
 * クリア状況まとめコンポーネント
 */
const ClearStatusSummary = () => {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { clearStatuses, loading: clearStatusLoading, refetch: refetchClearStatuses } = useClearStatus();
  const { games, loading: gamesLoading } = useGames();

  // グローバルなクリア状況更新イベントをリッスン
  React.useEffect(() => {
    const handleClearStatusUpdate = () => {
      refetchClearStatuses?.();
    };

    window.addEventListener('clearStatusUpdated', handleClearStatusUpdate);
    
    return () => {
      window.removeEventListener('clearStatusUpdated', handleClearStatusUpdate);
    };
  }, [refetchClearStatuses]);

  if (clearStatusLoading || gamesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // 全ゲームを表示（クリア状況の有無に関わらず）
  const sortedGames = games.sort((a, b) => a.series_number - b.series_number);

  // 選択されたゲームの詳細表示用
  const selectedGame = selectedGameId ? games.find(g => g.id === selectedGameId) : null;

  const getAvailableDifficulties = (game) => {
    // 基本難易度
    const baseDifficulties = [
      DIFFICULTIES.EASY,
      DIFFICULTIES.NORMAL,
      DIFFICULTIES.HARD,
      DIFFICULTIES.LUNATIC
    ];

    // Extra難易度は獣王園（第19作）以外
    if (game.series_number !== 19) {
      baseDifficulties.push(DIFFICULTIES.EXTRA);
    }

    // Phantasm難易度は妖々夢（第7作）のみ
    if (game.series_number === 7) {
      baseDifficulties.push(DIFFICULTIES.PHANTASM);
    }

    return baseDifficulties;
  };

  const getClearStatusForDifficulty = (gameId, difficulty) => {
    return clearStatuses.find(cs => cs.game_id === gameId && cs.difficulty === difficulty);
  };

  const renderCheckbox = (checked, label) => (
    <span className="inline-flex items-center space-x-1">
      <span className="text-lg">{checked ? '☑' : '☐'}</span>
      <span className={`text-sm ${checked ? 'text-green-700' : 'text-gray-500'}`}>
        {label}
      </span>
    </span>
  );

  const getGameClearSummary = (game) => {
    const gameClearStatuses = clearStatuses.filter(cs => cs.game_id === game.id);
    const totalDifficulties = getAvailableDifficulties(game).length;
    const clearedCount = gameClearStatuses.filter(cs => cs.is_cleared).length;
    const hasAnyCleared = clearedCount > 0;
    return { clearedCount, totalDifficulties, hasAnyCleared };
  };

  const displayedGames = isExpanded ? sortedGames : sortedGames.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">クリア状況まとめ</h2>
        {sortedGames.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isExpanded ? '折りたたむ' : `すべて表示 (${sortedGames.length}件)`}
          </button>
        )}
      </div>

      {/* ゲーム一覧 */}
      <div className="space-y-2 mb-6">
        {displayedGames.map(game => {
          const { hasAnyCleared } = getGameClearSummary(game);
          const isSelected = selectedGameId === game.id;
          const isClickable = hasAnyCleared;
          
          return (
            <div key={game.id}>
              {isClickable ? (
                <button
                  onClick={() => setSelectedGameId(isSelected ? null : game.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">・{game.title}</span>
                    <span className="text-gray-400">
                      {isSelected ? '▼' : '▶'}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-500">・{game.title}</span>
                    <span className="text-sm text-gray-400 px-2 py-1 bg-gray-200 rounded">
                      未クリア
                    </span>
                  </div>
                </div>
              )}

              {/* 選択されたゲームの詳細 */}
              {isSelected && isClickable && (
                <div className="mt-2 ml-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    {getAvailableDifficulties(game).map(difficulty => {
                      const clearStatus = getClearStatusForDifficulty(game.id, difficulty);
                      const isCleared = clearStatus?.is_cleared || false;
                      const noContinue = clearStatus?.no_continue_clear || false;
                      const noBomb = clearStatus?.no_bomb_clear || false;
                      const noMiss = clearStatus?.no_miss_clear || false;

                      return (
                        <div key={difficulty} className="flex items-center space-x-4 text-sm">
                          <span className="w-20 text-gray-600 font-medium">・{DIFFICULTY_LABELS[difficulty]}</span>
                          <div className="flex items-center space-x-4">
                            {renderCheckbox(isCleared, 'クリア')}
                            {renderCheckbox(noContinue, 'ノーコンティニュー')}
                            {renderCheckbox(noBomb, 'ノーボム')}
                            {renderCheckbox(noMiss, 'ノーミス')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!isExpanded && sortedGames.length > 3 && (
          <div className="text-center pt-2">
            <span className="text-gray-500 text-sm">
              ... 他 {sortedGames.length - 3} 件
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClearStatusSummary;