import React, { useState } from 'react';
import GameCard from './GameCard';
import GameFilter from './GameFilter';
import GameDetail from './GameDetail';
import { useGames } from '../hooks/useGames';
import { Game } from '../../../types/game';

/**
 * ゲーム一覧表示コンポーネント
 */
const GameList: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const { 
    games, 
    loading, 
    error, 
    filters,
    applyFilters, 
    applyServerFilters,
    resetFilters 
  } = useGames();

  // フィルター変更の処理
  const handleFilterChange = (newFilters: any, isServerFilter: boolean = false) => {
    if (isServerFilter) {
      // サーバーサイドフィルター（game_type, series_number）
      const serverFilters: any = {};
      if (newFilters.game_type) serverFilters.game_type = newFilters.game_type;
      if (newFilters.series_number) serverFilters.series_number = newFilters.series_number;
      
      applyServerFilters(serverFilters).then(() => {
        // サーバーフィルター後にクライアントサイドフィルター適用
        if (newFilters.search) {
          applyFilters({ search: newFilters.search });
        }
      });
    } else {
      // クライアントサイドフィルター（検索）
      applyFilters(newFilters);
    }
  };

  // ゲームカードクリック処理
  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  // ゲーム詳細画面から戻る処理
  const handleBackFromDetail = () => {
    setSelectedGame(null);
  };

  // ゲーム詳細画面を表示
  if (selectedGame) {
    return (
      <GameDetail 
        game={selectedGame} 
        onBack={handleBackFromDetail} 
      />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              エラーが発生しました
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ゲーム一覧</h1>
        <p className="mt-2 text-gray-600">
          東方プロジェクトシリーズのゲーム一覧です。クリア状況を管理できます。
        </p>
      </div>

      {/* TODO: フィルター機能は将来実装予定 */}
      {/* <GameFilter 
        onFilterChange={handleFilterChange}
        filters={filters}
        loading={loading}
      /> */}

      {/* ローディング状態 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">ゲーム一覧を読み込み中...</span>
        </div>
      )}

      {/* ゲーム一覧 */}
      {!loading && (
        <>
          {/* TODO: 結果数表示は将来実装予定 */}
          {/* <div className="mb-4">
            <p className="text-sm text-gray-600">
              {games.length} 件のゲームが見つかりました
            </p>
          </div> */}

          {/* ゲームカードグリッド */}
          {games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={handleGameClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎮</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ゲームが見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-4">
                検索条件を変更して再度お試しください。
              </p>
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameList;