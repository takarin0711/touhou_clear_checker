/**
 * 獣王園のExtra難易度除外テスト用ファイル
 */
import { getDifficultyOrderForGame, DIFFICULTIES } from './types/difficulty';

// テスト用ゲームデータ（実際のデータベースIDに合わせたもの）
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
    id: 11,
    title: '東方紺珠伝',
    series_number: 15,
    release_year: 2015,
    game_type: 'main_series'
  },
  {
    id: 15,
    title: '東方獣王園',
    series_number: 19,
    release_year: 2023,
    game_type: 'versus'
  }
];

// テスト実行関数
export const testDifficultyOrder = () => {
  console.log('=== 難易度順序テスト ===');
  
  testGames.forEach(game => {
    const difficulties = getDifficultyOrderForGame(game);
    console.log(`\n${game.title} (シリーズ番号: ${game.series_number}):`);
    console.log('利用可能な難易度:', difficulties);
    
    // Extra難易度の有無を確認
    const hasExtra = difficulties.includes(DIFFICULTIES.EXTRA);
    const hasPhantasm = difficulties.includes(DIFFICULTIES.PHANTASM);
    
    console.log(`- Extra難易度: ${hasExtra ? '有り' : '無し'}`);
    console.log(`- Phantasm難易度: ${hasPhantasm ? '有り' : '無し'}`);
    
    // 期待値との比較
    if (game.series_number === 19) {
      if (!hasExtra) {
        console.log('✅ 獣王園でExtra難易度が正しく除外されています');
      } else {
        console.log('❌ 獣王園でExtra難易度が除外されていません');
      }
    } else if (game.series_number === 7) {
      if (hasExtra && hasPhantasm) {
        console.log('✅ 妖々夢でExtra・Phantasm難易度が正しく含まれています');
      } else {
        console.log('❌ 妖々夢で難易度設定に問題があります');
      }
    } else {
      if (hasExtra && !hasPhantasm) {
        console.log('✅ 通常作品でExtra難易度のみが正しく含まれています');
      } else {
        console.log('❌ 通常作品で難易度設定に問題があります');
      }
    }
  });
  
  console.log('\n=== テスト完了 ===');
};

// ブラウザのコンソールで直接実行可能にする
if (typeof window !== 'undefined') {
  (window as any).testDifficultyOrder = testDifficultyOrder;
}