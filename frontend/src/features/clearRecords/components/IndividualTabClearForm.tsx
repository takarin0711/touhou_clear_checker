/**
 * 機体別個別条件登録フォーム（clearStatusの頃のデザイン再現）
 */
import React, { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { getDifficultyOrderForGameBySeries } from '../../../types/difficulty';
import { isModeAvailableForSeries, isFullSpellCardAvailableBySeries, isNoContinueAvailableBySeries } from '../../../constants/gameConstants';
import { getSpecialClearLabel, getSpecialClearDescription, DifficultyData, IndividualConditionData } from '../../../types/clearRecord';
import { useGameCharacters } from '../../games/hooks/useGameCharacters';
import { useClearRecords } from '../../../hooks/useClearRecords';
import { Game, getSeriesNumber } from '../../../types/game';
import { GameCharacter } from '../../../types/gameCharacter';
import { SPECIAL_CLEAR_SERIES_NUMBERS } from '../../../constants/gameFeatureConstants';

interface IndividualTabClearFormProps {
  game: Game;
  onClose: () => void;
  onSuccess: () => void;
}

const IndividualTabClearForm: React.FC<IndividualTabClearFormProps> = ({ game, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<string>('Easy');
  const [selectedMode, setSelectedMode] = useState<string>('pointdevice');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // モード別データ管理：modeData[mode][difficulty] = {characters: {...}}
  const [modeData, setModeData] = useState<{
    pointdevice: Record<string, DifficultyData>;
    legacy: Record<string, DifficultyData>;
  }>({
    pointdevice: {},
    legacy: {}
  });

  const { characters, loading: charactersLoading } = useGameCharacters(game.id);
  const { clearRecords, submitIndividualConditions } = useClearRecords(game.id);

  // series_numberを数値として取得
  const seriesNumber = game ? getSeriesNumber(game) : 0;
  
  // 現在選択中のモードでの利用可能な難易度を取得
  const availableDifficulties = getDifficultyOrderForGameBySeries(game, selectedMode);
  const isModeGame = isModeAvailableForSeries(seriesNumber);
  const isFullSpellAvailable = isFullSpellCardAvailableBySeries(seriesNumber);
  // ヘッダー表示用：現在選択中の難易度でノーコンが利用可能かを判定
  const isNoContinueAvailableForCurrentTab = isNoContinueAvailableBySeries(seriesNumber, selectedMode, activeTab);
  
  // 特殊クリア条件が利用可能かチェック
  const hasSpecialClear1 = SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_1_GAMES.includes(seriesNumber);
  const hasSpecialClear2 = SPECIAL_CLEAR_SERIES_NUMBERS.SPECIAL_CLEAR_2_GAMES.includes(seriesNumber); // 鬼形獣のみ
  
  // 現在のモードのデータ
  const currentModeData = modeData[selectedMode] || {};

  // 既存のクリア記録を元にチェック状態を設定する関数（モード対応）
  const applyExistingClearRecords = (
    initialData: Record<string, DifficultyData>, 
    existingRecords: any[], 
    characters: GameCharacter[], 
    mode: string
  ): Record<string, DifficultyData> => {
    if (!existingRecords || existingRecords.length === 0) {
      return initialData;
    }

    existingRecords.forEach(record => {
      const difficulty = record.difficulty;
      const characterName = record.character_name;
      const recordMode = record.mode || 'normal';
      
      // 指定されたモードと一致するレコードのみ適用
      if (recordMode !== mode) {
        return;
      }
      
      // character_nameからcharacter_idを逆引き
      const character = characters.find(c => c.character_name === characterName);
      const characterId = character?.id;
      
      if (characterId && initialData[difficulty] && initialData[difficulty].characters[characterId]) {
        initialData[difficulty].characters[characterId] = {
          cleared: record.is_cleared || false,
          no_continue: record.is_no_continue_clear || false,
          no_bomb: record.is_no_bomb_clear || false,
          no_miss: record.is_no_miss_clear || false,
          full_spell_card: record.is_full_spell_card || false,
          special_clear_1: record.is_special_clear_1 || false,
          special_clear_2: record.is_special_clear_2 || false,
          special_clear_3: record.is_special_clear_3 || false
        };
      }
    });
    
    return initialData;
  };

  // 機体リストとクリア記録が読み込まれた時に両モードの初期状態を設定
  useEffect(() => {
    if (characters.length > 0) {
      const newModeData = { pointdevice: {}, legacy: {} };
      
      // 両モードの初期データを作成
      ['pointdevice', 'legacy'].forEach(mode => {
        const modeDifficulties = getDifficultyOrderForGameBySeries(game, mode);
        modeDifficulties.forEach(difficulty => {
          newModeData[mode][difficulty] = {
            characters: {}
          };
          characters.forEach(character => {
            newModeData[mode][difficulty].characters[character.id] = {
              cleared: false,
              no_continue: false,
              no_bomb: false,
              no_miss: false,
              full_spell_card: false,
              special_clear_1: false,
              special_clear_2: false,
              special_clear_3: false
            };
          });
        });
        
        // 既存のクリア記録を適用
        newModeData[mode] = applyExistingClearRecords(newModeData[mode], clearRecords, characters, mode);
      });
      
      setModeData(newModeData);
      
      // 最初の難易度をアクティブタブに設定
      const firstDifficulty = getDifficultyOrderForGameBySeries(game, selectedMode)[0];
      if (firstDifficulty) {
        setActiveTab(firstDifficulty);
      }
    }
  }, [characters, clearRecords, game]);

  // 機体の条件を更新（モード対応）
  const updateCharacterCondition = (difficulty: string, characterId: number, conditionType: keyof IndividualConditionData, value: boolean) => {
    setModeData(prev => ({
      ...prev,
      [selectedMode]: {
        ...prev[selectedMode],
        [difficulty]: {
          ...prev[selectedMode][difficulty],
          characters: {
            ...prev[selectedMode][difficulty].characters,
            [characterId]: {
              ...prev[selectedMode][difficulty].characters[characterId],
              [conditionType]: value
            }
          }
        }
      }
    }));
  };

  // 両モードのすべての難易度・機体を一括登録
  const handleSubmitAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const promises: Promise<any>[] = [];
      let totalSettings = 0;
      
      // 両モードのデータを確認・送信
      ['pointdevice', 'legacy'].forEach(mode => {
        const modeDifficulties = getDifficultyOrderForGameBySeries(game, mode);
        
        modeDifficulties.forEach(difficulty => {
          const data = modeData[mode]?.[difficulty];
          if (data && Object.keys(data.characters).length > 0) {
            // 機体データがある場合は送信（全てfalseでも送信する）
            promises.push(
              submitIndividualConditions(game.id, difficulty, data, characters, mode)
            );
            totalSettings++;
          }
        });
      });

      // 登録対象がない場合も正常終了とする
      if (promises.length === 0) {
        setError(null);
        return;
      }

      const results = await Promise.allSettled(promises);
      
      // エラーチェック
      const failures = results.filter(result => result.status === 'rejected' || !result.value?.success);
      
      if (failures.length > 0) {
        setError(`${failures.length}件の登録に失敗しました`);
        return;
      }
      onSuccess();
    } catch (err) {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (charactersLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">機体情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {seriesNumber === 12.8 ? 'ルート別条件登録' : '機体別条件登録'}
        </h3>
        <Button onClick={onClose} variant="outline" size="small">
          閉じる
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* モードタブ（紺珠伝の場合のみ） */}
      {isModeGame && (
        <>
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setSelectedMode('pointdevice')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                selectedMode === 'pointdevice'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              完全無欠モード
            </button>
            <button
              onClick={() => setSelectedMode('legacy')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                selectedMode === 'legacy'
                  ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              レガシーモード
            </button>
          </div>
        </>
      )}

      {/* 難易度タブ */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            {availableDifficulties.map(difficulty => {
              const getDifficultyColors = (diff) => {
                switch (diff) {
                  case 'Easy':
                    return activeTab === diff 
                      ? 'border-green-500 text-green-600 bg-green-50' 
                      : 'border-transparent text-green-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50';
                  case 'Normal':
                    return activeTab === diff 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50';
                  case 'Hard':
                    return activeTab === diff 
                      ? 'border-red-500 text-red-600 bg-red-50' 
                      : 'border-transparent text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50';
                  case 'Lunatic':
                    return activeTab === diff 
                      ? 'border-pink-500 text-pink-600 bg-pink-50' 
                      : 'border-transparent text-pink-600 hover:text-pink-700 hover:border-pink-300 hover:bg-pink-50';
                  case 'Extra':
                  case 'Phantasm':
                    return activeTab === diff 
                      ? 'border-purple-500 text-purple-600 bg-purple-50' 
                      : 'border-transparent text-purple-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50';
                  default:
                    return activeTab === diff 
                      ? 'border-gray-500 text-gray-600 bg-gray-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50';
                }
              };

              return (
                <button
                  key={difficulty}
                  onClick={() => setActiveTab(difficulty)}
                  className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm rounded-t-md transition-all ${getDifficultyColors(difficulty)}`}
                >
                  {difficulty}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 機体別条件設定テーブル（妖精大戦争はルート別条件設定テーブル） */}
      {currentModeData[activeTab] && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab} - {seriesNumber === 12.8 ? 'ルート別条件設定' : '機体別条件設定'}
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {seriesNumber === 12.8 ? 'ルート' : '機体'}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クリア
                  </th>
                  {isNoContinueAvailableForCurrentTab && (
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ノーコン
                    </th>
                  )}
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ノーミス
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ノーボム
                  </th>
                  {hasSpecialClear1 && (
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getSpecialClearLabel(game?.id, 'special_clear_1')}
                    </th>
                  )}
                  {hasSpecialClear2 && (
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getSpecialClearLabel(game?.id, 'special_clear_2')}
                    </th>
                  )}
                  {isFullSpellAvailable && (
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      フルスペカ
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* 妖精大戦争の特殊表示ロジック：Easy〜LunaticはRoute A1〜C2、ExtraはExtraのみ */}
                {(() => {
                  let displayCharacters = characters;
                  
                  if (seriesNumber === 12.8) { // 妖精大戦争
                    if (activeTab === 'Extra') {
                      // Extraタブでは「チルノ（Extra）」のみ表示
                      displayCharacters = characters.filter(char => 
                        char.character_name.includes('Extra')
                      );
                    } else {
                      // Easy, Normal, Hard, LunaticタブではRoute A1〜C2のみ表示
                      displayCharacters = characters.filter(char => 
                        char.character_name.includes('Route')
                      );
                    }
                  }
                  
                  return displayCharacters.map((character, index) => (
                  <tr key={character.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {character.character_name}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={currentModeData[activeTab].characters[character.id]?.cleared || false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'cleared', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    {isNoContinueAvailableForCurrentTab && (
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={currentModeData[activeTab].characters[character.id]?.no_continue || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'no_continue', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={currentModeData[activeTab].characters[character.id]?.no_miss || false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'no_miss', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={currentModeData[activeTab].characters[character.id]?.no_bomb || false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'no_bomb', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    {hasSpecialClear1 && (
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={currentModeData[activeTab].characters[character.id]?.special_clear_1 || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'special_clear_1', e.target.checked)}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                          title={getSpecialClearDescription(game?.id, 'special_clear_1')}
                        />
                      </td>
                    )}
                    {hasSpecialClear2 && (
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={currentModeData[activeTab].characters[character.id]?.special_clear_2 || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'special_clear_2', e.target.checked)}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          title={getSpecialClearDescription(game?.id, 'special_clear_2')}
                        />
                      </td>
                    )}
                    {isFullSpellAvailable && (
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={currentModeData[activeTab].characters[character.id]?.full_spell_card || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCharacterCondition(activeTab, character.id, 'full_spell_card', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex justify-end space-x-4">
        <Button onClick={onClose} variant="outline">
          キャンセル
        </Button>
        <Button
          onClick={handleSubmitAll}
          variant="primary"
          disabled={loading}
          size="medium"
        >
          {loading ? '登録中...' : isModeGame ? '両モードすべて登録する' : 'すべて登録する'}
        </Button>
      </div>
    </div>
  );
};

export default IndividualTabClearForm;