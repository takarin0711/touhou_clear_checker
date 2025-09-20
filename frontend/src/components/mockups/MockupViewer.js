import React, { useState } from 'react';
import CheckboxClearStatusForm from './CheckboxClearStatusForm';
import TabClearStatusForm from './TabClearStatusForm';
import IndividualTabClearStatusForm from './IndividualTabClearStatusForm';
import DifficultyTestMockup from './DifficultyTestMockup';
import Button from '../common/Button';

/**
 * モックアップ表示用コンポーネント
 */
const MockupViewer = () => {
  const [currentMockup, setCurrentMockup] = useState('none'); // 'none' | 'checkbox' | 'tab' | 'individual' | 'difficulty-test'

  const mockGame = {
    id: 1,
    title: '東方紅魔郷',
    series_number: 6,
    release_year: 2002,
    game_type: 'main_series'
  };

  if (currentMockup === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            クリア状況入力UI改善案
          </h1>
          <p className="text-gray-600 mb-8">
            現在のプルダウン式から、より使いやすいUIに変更する提案です。<br/>
            2つのデザインパターンを用意しました。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">パターン1: チェックボックス式</h3>
              <p className="text-sm text-gray-600 mb-4">
                難易度とキャラクターを同時選択し、全組み合わせを一括登録
              </p>
              <Button onClick={() => setCurrentMockup('checkbox')} variant="outline">
                チェックボックス式を見る
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">パターン2: タブ式（旧版）</h3>
              <p className="text-sm text-gray-600 mb-4">
                難易度ごとにタブを切り替え、キャラクターと特殊条件を設定
              </p>
              <Button onClick={() => setCurrentMockup('tab')} variant="outline">
                タブ式（旧版）を見る
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-2">パターン3: 機体別条件式 ⭐</h3>
              <p className="text-sm text-gray-600 mb-4">
                機体ごとにクリア・ノーコン・ノーボム・ノーミスを個別選択
              </p>
              <Button onClick={() => setCurrentMockup('individual')} variant="primary">
                機体別条件式を見る
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-red-200">
              <h3 className="text-lg font-medium text-red-900 mb-2">🧪 難易度表示テスト</h3>
              <p className="text-sm text-gray-600 mb-4">
                獣王園のExtra難易度除外機能の動作確認
              </p>
              <Button onClick={() => setCurrentMockup('difficulty-test')} variant="danger">
                難易度テストを見る
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={() => setCurrentMockup('none')} variant="outline">
            ← モックアップ選択に戻る
          </Button>
          <div className="flex space-x-2 flex-wrap">
            <Button 
              onClick={() => setCurrentMockup('checkbox')}
              variant={currentMockup === 'checkbox' ? 'primary' : 'outline'}
              size="small"
            >
              チェックボックス式
            </Button>
            <Button 
              onClick={() => setCurrentMockup('tab')}
              variant={currentMockup === 'tab' ? 'primary' : 'outline'}
              size="small"
            >
              タブ式（旧版）
            </Button>
            <Button 
              onClick={() => setCurrentMockup('individual')}
              variant={currentMockup === 'individual' ? 'primary' : 'outline'}
              size="small"
            >
              機体別条件式 ⭐
            </Button>
            <Button 
              onClick={() => setCurrentMockup('difficulty-test')}
              variant={currentMockup === 'difficulty-test' ? 'danger' : 'outline'}
              size="small"
            >
              🧪 難易度テスト
            </Button>
          </div>
        </div>
        
        {currentMockup === 'checkbox' ? (
          <>
            <CheckboxClearStatusForm 
              game={mockGame}
              onClose={() => setCurrentMockup('none')}
            />
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">📝 チェックボックス式の特徴</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 難易度と機体を複数選択し、全組み合わせを一括登録</li>
                <li>• 特殊クリア条件は全組み合わせに適用</li>
                <li>• 一度に大量の組み合わせを登録可能</li>
                <li>• 登録予定件数をリアルタイム表示</li>
              </ul>
            </div>
          </>
        ) : currentMockup === 'tab' ? (
          <>
            <TabClearStatusForm 
              game={mockGame}
              onClose={() => setCurrentMockup('none')}
            />
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-2">📝 タブ式の特徴</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 難易度ごとにタブを切り替えて個別設定</li>
                <li>• 1つの難易度で複数キャラクター+特殊条件を一括設定</li>
                <li>• タブにバッジで選択済み件数を表示</li>
                <li>• 難易度別に特殊条件を個別設定可能</li>
                <li>• より直感的で分かりやすいUI</li>
              </ul>
            </div>
          </>
        ) : currentMockup === 'individual' ? (
          <>
            <IndividualTabClearStatusForm 
              game={mockGame}
              onClose={() => setCurrentMockup('none')}
            />
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">🎯 機体別条件式の特徴（推奨）</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 機体ごとに個別にクリア・ノーコン・ノーボム・ノーミス条件を選択</li>
                <li>• より細かな記録管理が可能（例：霊夢Aはクリアのみ、魔理沙Bはノーボムまで）</li>
                <li>• 実際のプレイスタイルに合った記録方法</li>
                <li>• 達成済み条件が一目で分かる視覚的なフィードバック</li>
                <li>• タブ式で難易度別の整理された入力</li>
              </ul>
            </div>
          </>
        ) : currentMockup === 'difficulty-test' ? (
          <DifficultyTestMockup />
        ) : null}
      </div>
    </div>
  );
};

export default MockupViewer;