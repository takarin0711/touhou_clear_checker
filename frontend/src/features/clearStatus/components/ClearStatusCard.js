import React from 'react';
import DifficultyBadge from './DifficultyBadge';

/**
 * クリア状況カードコンポーネント
 */
const ClearStatusCard = ({ 
  clearStatus, 
  onEdit, 
  onDelete,
  onToggleClear,
  className = '' 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatScore = (score) => {
    if (!score) return '';
    return score.toLocaleString();
  };

  const cardClass = `
    bg-white rounded-lg shadow-md p-4 border-l-4 
    ${clearStatus.is_cleared ? 'border-green-500' : 'border-gray-300'}
    ${className}
  `.trim();

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-3">
        <DifficultyBadge difficulty={clearStatus.difficulty} />
        <div className="flex items-center space-x-2">
          {clearStatus.is_cleared && (
            <span className="text-green-600 text-sm font-medium">✓ クリア済み</span>
          )}
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit?.(clearStatus)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              編集
            </button>
            <button
              onClick={() => onDelete?.(clearStatus)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {clearStatus.cleared_at && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">クリア日:</span> {formatDate(clearStatus.cleared_at)}
          </div>
        )}

        {clearStatus.score && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">スコア:</span> {formatScore(clearStatus.score)}
          </div>
        )}

        {clearStatus.memo && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">メモ:</span> {clearStatus.memo}
          </div>
        )}


        {/* 特殊クリア条件 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {clearStatus.no_continue_clear && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ノーコンティニュー
            </span>
          )}
          {clearStatus.no_bomb_clear && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ノーボム
            </span>
          )}
          {clearStatus.no_miss_clear && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              ノーミス
            </span>
          )}
        </div>

        {/* クリア状況切り替えボタン */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => onToggleClear?.(clearStatus)}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              clearStatus.is_cleared
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {clearStatus.is_cleared ? '未クリアにする' : 'クリア済みにする'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearStatusCard;