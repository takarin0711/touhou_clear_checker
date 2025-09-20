import React, { useState } from 'react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { GAME_TYPE_LABELS } from '../../../types/game';
import { DIFFICULTIES, getDifficultyOrderForGame } from '../../../types/clearStatus';
import { useClearStatus } from '../../clearStatus/hooks/useClearStatus';
import ClearStatusCard from '../../clearStatus/components/ClearStatusCard';
import ClearStatusForm from '../../clearStatus/components/ClearStatusForm';
import IndividualTabClearForm from '../../clearStatus/components/IndividualTabClearForm';
import DifficultyBadge from '../../clearStatus/components/DifficultyBadge';
import { GAME_MODES, isModeAvailableForGame } from '../../../constants/gameConstants';
import { useGameCharacters } from '../hooks/useGameCharacters';

/**
 * ゲーム詳細コンポーネント
 */
const GameDetail = ({ game, onBack }) => {
  const [showForm, setShowForm] = useState(false);
  const [showIndividualForm, setShowIndividualForm] = useState(false);
  const [editingClearStatus, setEditingClearStatus] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    clearStatuses,
    loading,
    error,
    createClearStatus,
    updateClearStatus,
    deleteClearStatus,
    getClearStatusByGameAndDifficulty
  } = useClearStatus(game.id);

  const {
    characters,
    loading: charactersLoading,
    error: charactersError
  } = useGameCharacters(game.id);

  const getBadgeVariant = (gameType) => {
    switch (gameType) {
      case 'main_series':
        return 'primary';
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

  // クリア状況更新イベントを発火
  const emitClearStatusUpdate = () => {
    window.dispatchEvent(new Event('clearStatusUpdated'));
  };

  const getAvailableDifficulties = () => {
    // 紺珠伝の場合は両モードの難易度を統合表示
    if (isModeAvailableForGame(game?.id)) {
      const legacyDifficulties = getDifficultyOrderForGame(game, GAME_MODES.LEGACY);
      const pointdeviceDifficulties = getDifficultyOrderForGame(game, GAME_MODES.POINTDEVICE);
      
      // 重複を除いてマージ（Legacy + Pointdevice の難易度を全て表示）
      const allDifficulties = [...new Set([...pointdeviceDifficulties, ...legacyDifficulties])];
      return allDifficulties;
    }
    
    return getDifficultyOrderForGame(game);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    
    try {
      let result;
      if (editingClearStatus) {
        result = await updateClearStatus(editingClearStatus.id, formData);
      } else {
        result = await createClearStatus(formData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingClearStatus(null);
        emitClearStatusUpdate(); // クリア状況まとめを更新
      }
    } catch (error) {
      console.error('フォーム送信エラー:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClearStatus = (clearStatus) => {
    setEditingClearStatus(clearStatus);
    setShowForm(true);
  };

  const handleDeleteClearStatus = async (clearStatus) => {
    if (window.confirm('このクリア状況を削除しますか？')) {
      const result = await deleteClearStatus(clearStatus.id);
      if (result.success) {
        emitClearStatusUpdate(); // クリア状況まとめを更新
      }
    }
  };

  const handleToggleClear = async (clearStatus) => {
    const updatedData = {
      is_cleared: !clearStatus.is_cleared,
      cleared_at: !clearStatus.is_cleared ? new Date().toISOString().split('T')[0] : null,
      no_continue_clear: clearStatus.no_continue_clear,
      no_bomb_clear: clearStatus.no_bomb_clear,
      no_miss_clear: clearStatus.no_miss_clear,
      score: clearStatus.score,
      memo: clearStatus.memo,
      clear_count: clearStatus.clear_count || 0
    };
    
    const result = await updateClearStatus(clearStatus.id, updatedData);
    if (result.success) {
      emitClearStatusUpdate(); // クリア状況まとめを更新
    }
  };

  const handleAddNewClearStatus = () => {
    setEditingClearStatus(null);
    setShowForm(true);
  };

  const handleAddIndividualClearStatus = () => {
    setShowIndividualForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingClearStatus(null);
  };

  const handleCancelIndividualForm = () => {
    setShowIndividualForm(false);
  };

  const handleIndividualFormSuccess = () => {
    setShowIndividualForm(false);
    emitClearStatusUpdate(); // クリア状況まとめを更新
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* 戻るボタン */}
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="medium"
        >
          ← ゲーム一覧に戻る
        </Button>
      </div>

      {/* ゲーム情報 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{game.title}</h1>
          <Badge variant={getBadgeVariant(game.game_type)} size="large">
            {GAME_TYPE_LABELS[game.game_type] || game.game_type}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">シリーズ:</span> {getSeriesDisplay(game.series_number)}
          </div>
          <div>
            <span className="font-medium">リリース年:</span> {game.release_year}年
          </div>
        </div>

        {/* 難易度一覧 */}
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700">難易度一覧:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {getAvailableDifficulties().map(difficulty => (
              <div key={difficulty} className="flex items-center">
                <DifficultyBadge difficulty={difficulty} />
                {/* 紺珠伝のExtraはLegacyモードのみの注釈 */}
                {isModeAvailableForGame(game?.id) && difficulty === 'Extra' && (
                  <span className="ml-1 text-xs text-gray-500">(Legacy)</span>
                )}
              </div>
            ))}
          </div>
          
          {/* 紺珠伝用のモード説明 */}
          {isModeAvailableForGame(game?.id) && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">
                紺珠伝では2つのモードが利用可能です：
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <span className="font-medium">Legacy Mode</span>: 従来システム（Extra対応）</div>
                <div>• <span className="font-medium">Pointdevice Mode</span>: チェックポイント制（Easy～Lunatic）</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* クリア状況セクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">クリア状況</h2>
          <Button
            onClick={handleAddIndividualClearStatus}
            variant="primary"
            size="medium"
          >
            クリア記録
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          </div>
        )}

        {/* 個別追加フォーム表示 */}
        {showForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingClearStatus ? 'クリア状況を編集' : '新しいクリア状況を追加'}
            </h3>
            <ClearStatusForm
              gameId={game.id}
              game={game}
              initialData={editingClearStatus}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              loading={formLoading}
            />
          </div>
        )}

        {/* 機体別条件登録フォーム表示 */}
        {showIndividualForm && (
          <div className="mb-6">
            <IndividualTabClearForm
              game={game}
              onClose={handleCancelIndividualForm}
              onSuccess={handleIndividualFormSuccess}
            />
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">クリア状況を読み込み中...</span>
          </div>
        )}

        {/* クリア状況一覧 */}
        {!loading && (
          <div className="space-y-4">
            {clearStatuses.length > 0 ? (
              clearStatuses.map((clearStatus) => (
                <ClearStatusCard
                  key={clearStatus.id}
                  clearStatus={clearStatus}
                  onEdit={handleEditClearStatus}
                  onDelete={handleDeleteClearStatus}
                  onToggleClear={handleToggleClear}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだクリア状況が登録されていません
                </h3>
                <p className="text-gray-600 mb-4">
                  「新しいクリア状況を追加」ボタンからクリア状況を登録しましょう。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default GameDetail;