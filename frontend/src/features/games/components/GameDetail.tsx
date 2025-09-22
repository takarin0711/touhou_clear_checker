import React, { useState } from 'react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { GAME_TYPE_LABELS, Game } from '../../../types/game';
import { DIFFICULTIES, getDifficultyOrderForGame, DIFFICULTY_COLORS } from '../../../types/difficulty';
import { useClearRecords } from '../../../hooks/useClearRecords';
import { useGameMemo } from '../../../hooks/useGameMemo';
import IndividualTabClearForm from '../../clearRecords/components/IndividualTabClearForm';
import { GAME_MODES, isModeAvailableForGame } from '../../../constants/gameConstants';
import { useGameCharacters } from '../hooks/useGameCharacters';
import { getSpecialClearLabel } from '../../../types/clearRecord';

interface GameDetailProps {
  game: Game;
  onBack: () => void;
}

/**
 * ゲーム詳細コンポーネント
 */
const GameDetail: React.FC<GameDetailProps> = ({ game, onBack }) => {
  const [showIndividualForm, setShowIndividualForm] = useState<boolean>(false);
  const [showMemoForm, setShowMemoForm] = useState<boolean>(false);
  const [memoText, setMemoText] = useState<string>('');

  const {
    clearRecords,
    loading: recordsLoading,
    error,
    fetchClearRecords
  } = useClearRecords(game.id);


  const {
    characters,
    loading: charactersLoading,
    error: charactersError
  } = useGameCharacters(game.id);

  const {
    memo,
    loading: memoLoading,
    error: memoError,
    saving: memoSaving,
    saveMemo,
    getMemoText,
    hasMemo
  } = useGameMemo(game.id);

  const getBadgeVariant = (gameType: string): 'default' | 'primary' | 'warning' | 'danger' | 'purple' | 'success' => {
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

  const getSeriesDisplay = (seriesNumber: number): string => {
    return seriesNumber % 1 === 0 
      ? `第${Math.floor(seriesNumber)}作` 
      : `第${seriesNumber}作`;
  };

  const getDifficultyColorClasses = (difficulty: string): string => {
    const colorMap = {
      'green': 'bg-green-100 text-green-800 border-green-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'pink': 'bg-pink-100 text-pink-800 border-pink-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    const color = DIFFICULTY_COLORS[difficulty] || 'blue';
    return colorMap[color] || colorMap.blue;
  };


  const getAvailableDifficulties = (): string[] => {
    // 紺珠伝の場合は両モードの難易度を統合表示
    if (isModeAvailableForGame(game?.id)) {
      const legacyDifficulties = getDifficultyOrderForGame(game, GAME_MODES.LEGACY);
      const pointdeviceDifficulties = getDifficultyOrderForGame(game, GAME_MODES.POINTDEVICE);
      
      // 重複を除いてマージ（Legacy + Pointdevice の難易度を全て表示）
      const allDifficulties = Array.from(new Set([...pointdeviceDifficulties, ...legacyDifficulties]));
      return allDifficulties;
    }
    
    return getDifficultyOrderForGame(game);
  };


  const handleAddIndividualClearStatus = () => {
    setShowIndividualForm(true);
  };

  const handleCancelIndividualForm = () => {
    setShowIndividualForm(false);
  };

  const handleIndividualFormSuccess = () => {
    setShowIndividualForm(false);
    // クリア記録を再取得
    fetchClearRecords();
  };

  const handleMemoToggle = () => {
    if (showMemoForm) {
      setShowMemoForm(false);
      setMemoText(getMemoText());
    } else {
      setMemoText(getMemoText());
      setShowMemoForm(true);
    }
  };

  const handleMemoSave = async () => {
    try {
      await saveMemo(memoText);
      setShowMemoForm(false);
    } catch (err) {
      console.error('メモ保存エラー:', err);
    }
  };

  const handleMemoCancel = () => {
    setMemoText(getMemoText());
    setShowMemoForm(false);
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
                <span className={`px-3 py-1 text-sm rounded-full border font-medium ${getDifficultyColorClasses(difficulty)}`}>
                  {difficulty}
                </span>
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
                紺珠伝では2つのモードが選択可能です：
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <span className="font-medium">完全無欠モード</span>: チェックポイント制（Easy～Lunatic）</div>
                <div>• <span className="font-medium">レガシーモード</span>: 従来システム（Easy～Lunatic, Extra）</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* クリア記録セクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">クリア記録</h2>
          <Button
            onClick={handleAddIndividualClearStatus}
            variant="primary"
            size="medium"
          >
            クリア記録登録
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
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
        {recordsLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">クリア記録を読み込み中...</span>
          </div>
        )}

        {/* クリア記録一覧 */}
        {!recordsLoading && (
          <div className="space-y-4">
            {(() => {
              // 全てのクリア条件がfalseのレコードを除外
              const filteredRecords = clearRecords.filter(record => 
                record.is_cleared || 
                record.is_no_continue_clear || 
                record.is_no_bomb_clear || 
                record.is_no_miss_clear || 
                record.is_full_spell_card
              );
              
              return filteredRecords.length > 0 ? (
                <div className="space-y-6">
                  {(() => {
                    // 難易度とモードでグルーピング
                    const groupedRecords: Record<string, {
                      difficulty: string;
                      mode: string;
                      records: any[];
                    }> = filteredRecords.reduce((groups, record) => {
                    // 紺珠伝の場合はモードも考慮
                    const groupKey = isModeAvailableForGame(game?.id) 
                      ? `${record.difficulty}_${record.mode || 'normal'}`
                      : record.difficulty;
                    
                    if (!groups[groupKey]) {
                      groups[groupKey] = {
                        difficulty: record.difficulty,
                        mode: record.mode || 'normal',
                        records: []
                      };
                    }
                    groups[groupKey].records.push(record);
                    return groups;
                  }, {} as Record<string, {
                    difficulty: string;
                    mode: string;
                    records: any[];
                  }>);

                  // 難易度順でソート
                  const availableDifficulties = getAvailableDifficulties();
                  const sortedGroups = Object.values(groupedRecords).sort((a, b) => {
                    const diffIndexA = availableDifficulties.indexOf(a.difficulty);
                    const diffIndexB = availableDifficulties.indexOf(b.difficulty);
                    
                    if (diffIndexA !== diffIndexB) {
                      return diffIndexA - diffIndexB;
                    }
                    
                    // 同じ難易度の場合、モード順でソート（完全無欠→レガシー）
                    if (a.mode === 'normal' && b.mode === 'legacy') return -1;
                    if (a.mode === 'legacy' && b.mode === 'normal') return 1;
                    return 0;
                  });

                  return sortedGroups.map((group) => (
                    <div key={`${group.difficulty}_${group.mode}`} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* グループヘッダー */}
                      <div className={`px-4 py-3 font-medium text-sm ${getDifficultyColorClasses(group.difficulty)}`}>
                        <div className="flex items-center space-x-3">
                          <span>{group.difficulty}</span>
                          {isModeAvailableForGame(game?.id) && (
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-70 rounded-full">
                              {group.mode === 'legacy' ? 'レガシーモード' : '完全無欠モード'}
                            </span>
                          )}
                          <span className="text-xs opacity-75">
                            ({group.records.length}件)
                          </span>
                        </div>
                      </div>
                      
                      {/* グループ内のレコード */}
                      <div className="bg-white">
                        {group.records.map((record, recordIndex) => (
                          <div 
                            key={record.id} 
                            className={`p-3 border-b border-gray-100 last:border-b-0 ${recordIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="font-medium text-gray-900">{record.character_name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                {record.is_cleared && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">クリア</span>}
                                {record.is_no_continue_clear && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">ノーコンティニュー</span>}
                                {record.is_no_bomb_clear && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">ノーボム</span>}
                                {record.is_no_miss_clear && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">ノーミス</span>}
                                {[7, 8, 9, 12, 13, 14].includes(game?.id) && record.is_special_clear_1 && <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full">{getSpecialClearLabel(game?.id, 'special_clear_1')}</span>}
                                {[13].includes(game?.id) && record.is_special_clear_2 && <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full">{getSpecialClearLabel(game?.id, 'special_clear_2')}</span>}
                                {record.is_full_spell_card && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">フルスペカ</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    まだクリア記録が登録されていません
                  </h3>
                  <p className="text-gray-600 mb-4">
                    「クリア記録登録」ボタンからクリア記録を登録しましょう。
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* ゲームメモセクション */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">ゲームメモ</h3>
            <div className="flex items-center space-x-2">
              {hasMemo() && (
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  メモあり
                </span>
              )}
              <Button
                onClick={handleMemoToggle}
                variant={showMemoForm ? "outline" : "secondary"}
                size="small"
                disabled={memoLoading}
              >
                {showMemoForm ? "キャンセル" : (hasMemo() ? "メモを編集" : "メモを追加")}
              </Button>
            </div>
          </div>

          {memoError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{memoError}</div>
            </div>
          )}

          {showMemoForm ? (
            <div className="space-y-3">
              <textarea
                value={memoText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMemoText(e.target.value)}
                placeholder="ゲームに関するメモを入力してください..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[100px]"
                disabled={memoSaving}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleMemoCancel}
                  variant="outline"
                  size="small"
                  disabled={memoSaving}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleMemoSave}
                  variant="primary"
                  size="small"
                  disabled={memoSaving}
                >
                  {memoSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">
              {hasMemo() ? (
                <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-sm">
                  {getMemoText()}
                </div>
              ) : (
                <div className="text-center py-3 text-gray-400 text-sm">
                  まだメモが登録されていません
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default GameDetail;