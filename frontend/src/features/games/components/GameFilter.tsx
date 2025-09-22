import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { GAME_TYPES, GAME_TYPE_LABELS, GameFilter as GameFilterType } from '../../../types/game';

interface GameFilterProps {
  onFilterChange: (filters: any, isServerFilter?: boolean) => void;
  filters: GameFilterType;
  loading?: boolean;
}

/**
 * ゲームフィルター・検索コンポーネント
 */
const GameFilter: React.FC<GameFilterProps> = ({ onFilterChange, filters, loading = false }) => {
  const [localFilters, setLocalFilters] = useState<{
    search: string;
    game_type: string;
    series_number: string;
  }>({
    search: filters.search || '',
    game_type: filters.game_type || '',
    series_number: filters.series_number?.toString() || '',
  });

  // フィルター値の更新
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...localFilters,
      [key]: value,
    };
    setLocalFilters(newFilters);
    
    // リアルタイムでフィルター適用（検索のみ）
    if (key === 'search') {
      onFilterChange(newFilters);
    }
  };

  // サーバーサイドフィルターの適用
  const applyServerFilters = () => {
    const serverFilters: any = {};
    
    if (localFilters.game_type) {
      serverFilters.game_type = localFilters.game_type;
    }
    
    if (localFilters.series_number) {
      const seriesNum = parseFloat(localFilters.series_number);
      if (!isNaN(seriesNum)) {
        serverFilters.series_number = seriesNum;
      }
    }
    
    onFilterChange({ ...localFilters, ...serverFilters }, true); // サーバーフィルターフラグ
  };

  // フィルターのリセット
  const resetFilters = () => {
    const emptyFilters = {
      search: '',
      game_type: '',
      series_number: '',
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters, true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        ゲーム検索・フィルター
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* タイトル検索 */}
        <div>
          <Input
            label="タイトル検索"
            type="text"
            value={localFilters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
            placeholder="ゲームタイトルを検索..."
            disabled={loading}
          />
        </div>

        {/* ゲームタイプフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ゲームタイプ
          </label>
          <select
            value={localFilters.game_type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('game_type', e.target.value)}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">すべて</option>
            {Object.entries(GAME_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* シリーズ番号フィルター */}
        <div>
          <Input
            label="シリーズ番号"
            type="number"
            step="0.1"
            value={localFilters.series_number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('series_number', e.target.value)}
            placeholder="例: 7, 12.8"
            disabled={loading}
          />
        </div>

        {/* ボタン群 */}
        <div className="flex flex-col justify-end space-y-2">
          <Button
            onClick={applyServerFilters}
            variant="primary"
            size="medium"
            disabled={loading}
            loading={loading}
          >
            フィルター適用
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            リセット
          </Button>
        </div>
      </div>

      {/* アクティブフィルター表示 */}
      {(localFilters.search || localFilters.game_type || localFilters.series_number) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">適用中:</span>
            {localFilters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                検索: "{localFilters.search}"
              </span>
            )}
            {localFilters.game_type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                タイプ: {GAME_TYPE_LABELS[localFilters.game_type]}
              </span>
            )}
            {localFilters.series_number && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                シリーズ: {localFilters.series_number}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameFilter;