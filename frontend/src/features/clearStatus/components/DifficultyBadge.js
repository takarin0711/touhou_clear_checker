import React from 'react';
import Badge from '../../../components/common/Badge';
import { DIFFICULTY_COLORS } from '../../../types/clearStatus';

/**
 * 難易度バッジコンポーネント
 */
const DifficultyBadge = ({ difficulty, size = 'small', className = '' }) => {
  const getVariantForDifficulty = (difficulty) => {
    const colorMap = {
      'green': 'success',
      'blue': 'primary',
      'orange': 'warning',
      'red': 'danger',
      'purple': 'purple',
      'pink': 'secondary'
    };
    
    const color = DIFFICULTY_COLORS[difficulty] || 'blue';
    return colorMap[color] || 'default';
  };

  return (
    <Badge 
      variant={getVariantForDifficulty(difficulty)} 
      size={size}
      className={className}
    >
      {difficulty}
    </Badge>
  );
};

export default DifficultyBadge;