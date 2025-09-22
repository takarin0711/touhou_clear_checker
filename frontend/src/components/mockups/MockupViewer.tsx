import React, { useState } from 'react';
import DifficultyTestMockup from './DifficultyTestMockup';
import Button from '../common/Button';

/**
 * モックアップ表示用コンポーネント
 */
const MockupViewer = () => {
  const [currentMockup, setCurrentMockup] = useState('difficulty-test'); // 'difficulty-test' のみ利用可能

  if (currentMockup === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            開発ツール
          </h1>
          <p className="text-gray-600 mb-8">
            開発・テスト用のツールです。
          </p>
          <div className="grid grid-cols-1 gap-6">
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
            ← ツール選択に戻る
          </Button>
        </div>
        
        {currentMockup === 'difficulty-test' ? (
          <DifficultyTestMockup />
        ) : null}
      </div>
    </div>
  );
};

export default MockupViewer;