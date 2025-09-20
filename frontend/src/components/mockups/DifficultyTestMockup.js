import React from 'react';
import { getDifficultyOrderForGame } from '../../types/clearStatus';
import DifficultyBadge from '../../features/clearStatus/components/DifficultyBadge';

// テスト用ゲームデータ
const testGames = [
  {
    id: 1,
    title: '東方紅魔郷',
    series_number: 6,
    release_year: 2002,
    game_type: 'main_series'
  },
  {
    id: 2,
    title: '東方妖々夢',
    series_number: 7,
    release_year: 2003,
    game_type: 'main_series'
  },
  {
    id: 3,
    title: '東方獣王園',
    series_number: 19,
    release_year: 2023,
    game_type: 'main_series'
  }
];

/**
 * 難易度表示テスト用モックアップ
 */
const DifficultyTestMockup = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        獣王園 Extra難易度除外テスト
      </h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">テスト内容</h3>
        <p className="text-yellow-700">
          getDifficultyOrderForGame関数が正しく動作し、獣王園（シリーズ番号19）でExtra難易度が除外されるかをテストします。
        </p>
      </div>

      {testGames.map(game => {
        const difficulties = getDifficultyOrderForGame(game);
        const hasExtra = difficulties.includes('Extra');
        const hasPhantasm = difficulties.includes('Phantasm');
        
        let testResult = '';
        let resultClass = '';
        
        if (game.series_number === 19) {
          if (!hasExtra) {
            testResult = '✅ 獣王園でExtra難易度が正しく除外されています';
            resultClass = 'bg-green-50 border-green-200 text-green-800';
          } else {
            testResult = '❌ 獣王園でExtra難易度が除外されていません';
            resultClass = 'bg-red-50 border-red-200 text-red-800';
          }
        } else if (game.series_number === 7) {
          if (hasExtra && hasPhantasm) {
            testResult = '✅ 妖々夢でExtra・Phantasm難易度が正しく含まれています';
            resultClass = 'bg-green-50 border-green-200 text-green-800';
          } else {
            testResult = '❌ 妖々夢で難易度設定に問題があります';
            resultClass = 'bg-red-50 border-red-200 text-red-800';
          }
        } else {
          if (hasExtra && !hasPhantasm) {
            testResult = '✅ 通常作品でExtra難易度のみが正しく含まれています';
            resultClass = 'bg-green-50 border-green-200 text-green-800';
          } else {
            testResult = '❌ 通常作品で難易度設定に問題があります';
            resultClass = 'bg-red-50 border-red-200 text-red-800';
          }
        }
        
        return (
          <div key={game.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{game.title}</h3>
              <div className="text-sm text-gray-600">
                シリーズ番号: {game.series_number}
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">利用可能な難易度:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {difficulties.map(difficulty => (
                  <DifficultyBadge key={difficulty} difficulty={difficulty} />
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                <div>・Extra難易度: {hasExtra ? '有り' : '無し'}</div>
                <div>・Phantasm難易度: {hasPhantasm ? '有り' : '無し'}</div>
              </div>
            </div>
            
            <div className={`p-3 border rounded-lg ${resultClass}`}>
              {testResult}
            </div>
          </div>
        );
      })}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">実装詳細</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>・GameDetail.js の58-59行目で getDifficultyOrderForGame(game) を使用</div>
          <div>・getDifficultyOrderForGame関数はゲーム固有の難易度ルールを適用</div>
          <div>・獣王園（シリーズ番号19）: Extra難易度を除外</div>
          <div>・妖々夢（シリーズ番号7）: Extra + Phantasm難易度を含む</div>
          <div>・その他の作品: Extra難易度のみを含む</div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyTestMockup;