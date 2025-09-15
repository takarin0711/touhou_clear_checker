import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../../../types/clearStatus';

/**
 * クリア状況編集フォームコンポーネント
 */
const ClearStatusForm = ({ 
  gameId,
  game,
  initialData = null,
  onSubmit,
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    difficulty: DIFFICULTIES.EASY,
    is_cleared: false,
    cleared_at: '',
    no_continue_clear: false,
    no_bomb_clear: false,
    no_miss_clear: false,
    score: '',
    memo: ''
  });

  // ゲーム固有の利用可能難易度を取得
  const getAvailableDifficulties = (game) => {
    if (!game) return [DIFFICULTIES.EASY, DIFFICULTIES.NORMAL, DIFFICULTIES.HARD, DIFFICULTIES.LUNATIC, DIFFICULTIES.EXTRA];
    
    // 基本難易度
    const baseDifficulties = [
      DIFFICULTIES.EASY,
      DIFFICULTIES.NORMAL,
      DIFFICULTIES.HARD,
      DIFFICULTIES.LUNATIC
    ];

    // Extra難易度は獣王園（第19作）以外
    if (game.series_number !== 19) {
      baseDifficulties.push(DIFFICULTIES.EXTRA);
    }

    // Phantasm難易度は妖々夢（第7作）のみ
    if (game.series_number === 7) {
      baseDifficulties.push(DIFFICULTIES.PHANTASM);
    }

    return baseDifficulties;
  };

  const availableDifficulties = getAvailableDifficulties(game);

  // 初期データをフォームに設定
  useEffect(() => {
    if (initialData) {
      setFormData({
        difficulty: initialData.difficulty,
        is_cleared: initialData.is_cleared,
        cleared_at: initialData.cleared_at 
          ? initialData.cleared_at.split('T')[0]
          : '',
        no_continue_clear: initialData.no_continue_clear,
        no_bomb_clear: initialData.no_bomb_clear,
        no_miss_clear: initialData.no_miss_clear,
        score: initialData.score?.toString() || '',
        memo: initialData.memo || ''
      });
    }
  }, [initialData]);

  // クリア済みチェックボックスが変更された時の処理
  useEffect(() => {
    if (formData.is_cleared && !formData.cleared_at) {
      // クリア済みにチェックした場合、今日の日付を自動設定
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        cleared_at: today
      }));
    }
  }, [formData.is_cleared]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // バリデーション
    if (formData.is_cleared && !formData.cleared_at) {
      alert('クリア済みの場合はクリア日を入力してください。');
      return;
    }
    
    const submitData = {
      game_id: gameId,
      difficulty: formData.difficulty,
      is_cleared: formData.is_cleared,
      cleared_at: formData.cleared_at || null,
      no_continue_clear: formData.no_continue_clear,
      no_bomb_clear: formData.no_bomb_clear,
      no_miss_clear: formData.no_miss_clear,
      score: formData.score ? parseInt(formData.score) : null,
      memo: formData.memo || null,
      clear_count: 0
    };

    console.log('送信データ:', submitData); // デバッグ用

    onSubmit(submitData);
  };

  return (
    <div>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <span className="text-red-500">*</span> は必須項目です。
          クリア済みにチェックした場合は、クリア日の入力が必要です。
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
      {/* 難易度選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          難易度 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.difficulty}
          onChange={(e) => handleInputChange('difficulty', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {availableDifficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {DIFFICULTY_LABELS[difficulty]}
            </option>
          ))}
        </select>
      </div>

      {/* クリア済みチェックボックス */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_cleared"
          checked={formData.is_cleared}
          onChange={() => handleCheckboxChange('is_cleared')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="is_cleared" className="ml-2 block text-sm text-gray-900">
          クリア済み
        </label>
      </div>

      {/* クリア日 */}
      <Input
        label="クリア日"
        type="date"
        value={formData.cleared_at}
        onChange={(e) => handleInputChange('cleared_at', e.target.value)}
        disabled={loading}
        required={formData.is_cleared}
      />

      {/* スコア */}
      <Input
        label="スコア（任意）"
        type="number"
        value={formData.score}
        onChange={(e) => handleInputChange('score', e.target.value)}
        placeholder="例: 1234567890"
        disabled={loading}
      />

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メモ（任意）
        </label>
        <textarea
          value={formData.memo}
          onChange={(e) => handleInputChange('memo', e.target.value)}
          placeholder="プレイの感想や攻略メモなど..."
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
      </div>


      {/* 特殊クリア条件 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          特殊クリア条件（任意）
        </label>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="no_continue_clear"
            checked={formData.no_continue_clear}
            onChange={() => handleCheckboxChange('no_continue_clear')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="no_continue_clear" className="ml-2 block text-sm text-gray-900">
            ノーコンティニュークリア
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="no_bomb_clear"
            checked={formData.no_bomb_clear}
            onChange={() => handleCheckboxChange('no_bomb_clear')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="no_bomb_clear" className="ml-2 block text-sm text-gray-900">
            ノーボムクリア
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="no_miss_clear"
            checked={formData.no_miss_clear}
            onChange={() => handleCheckboxChange('no_miss_clear')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="no_miss_clear" className="ml-2 block text-sm text-gray-900">
            ノーミスクリア
          </label>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="medium"
          loading={loading}
          disabled={loading}
        >
          {initialData ? '更新' : '作成'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="medium"
          onClick={onCancel}
          disabled={loading}
        >
          キャンセル
        </Button>
      </div>
      </form>
    </div>
  );
};

export default ClearStatusForm;