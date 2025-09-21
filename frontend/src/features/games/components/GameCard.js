import React from 'react';
import Badge from '../../../components/common/Badge';
import { GAME_TYPE_LABELS } from '../../../types/game';

/**
 * ゲームカードコンポーネント
 */
const GameCard = ({ game, onClick, className = '' }) => {
  const getBadgeVariant = (gameType) => {
    switch (gameType) {
      case 'main_series':
        return 'primary';
      case 'spin_off_stg':
        return 'warning';
      case 'fighting':
        return 'danger';
      case 'photography':
        return 'warning';
      case 'mixed':
        return 'purple';
      case 'versus':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeriesDisplay = (seriesNumber) => {
    return seriesNumber % 1 === 0 
      ? `第${seriesNumber}作` 
      : `第${seriesNumber}作`;
  };

  const cardClass = `
    bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer
    border border-gray-200 hover:border-blue-300
    ${className}
  `.trim();

  return (
    <div className={cardClass} onClick={() => onClick?.(game)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {game.title}
          </h3>
          <p className="text-sm text-gray-600">
            {getSeriesDisplay(game.series_number)} • {game.release_year}年
          </p>
        </div>
        <Badge variant={getBadgeVariant(game.game_type)} size="small">
          {GAME_TYPE_LABELS[game.game_type] || game.game_type}
        </Badge>
      </div>
      
      <div className="flex items-center justify-end">
        <button 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(game);
          }}
        >
          クリア状況を編集 →
        </button>
      </div>
    </div>
  );
};

export default GameCard;