# 特殊クリア条件設計仕様

## 概要
東方シリーズの作品固有クリア条件（ノーロアリング、ノー季節解放等）に対応するため、予備フラグ3つを追加したクリア記録システムの設計仕様です。

## データベース設計

### clear_records テーブル拡張
```sql
-- 既存のカラムに以下を追加
ALTER TABLE clear_records ADD COLUMN is_full_spell_card BOOLEAN DEFAULT FALSE;  -- フルスペカ（全作品共通）
ALTER TABLE clear_records ADD COLUMN is_special_clear_1 BOOLEAN DEFAULT FALSE;  -- 作品特有条件1
ALTER TABLE clear_records ADD COLUMN is_special_clear_2 BOOLEAN DEFAULT FALSE;  -- 作品特有条件2
ALTER TABLE clear_records ADD COLUMN is_special_clear_3 BOOLEAN DEFAULT FALSE;  -- 作品特有条件3
```

### フラグの意味
- **is_full_spell_card**: フルスペルカード取得（全作品共通）
- **is_special_clear_1**: 作品特有条件1（優先度高）
- **is_special_clear_2**: 作品特有条件2（優先度中）
- **is_special_clear_3**: 作品特有条件3（予備）

## 作品別特殊条件マッピング

### 東方輝針城（14作目）
- **special_1**: ノーリバース（ひっくり返り弾幕未使用）

### 東方天空璋（16作目）
- **special_1**: ノー季節解放（シーズンリリース未使用）
- **special_2**: ノーサブシーズン（サブシーズン変更なし）

### 東方鬼形獣（17作目）
- **special_1**: ノーロアリング（ローリングモード未発動）
- **special_2**: 単一アニマル（1種類のアニマルスピリットのみ）

### 東方虹龍洞（18作目）
- **special_1**: ノーアビリティカード（アビリティカード未使用）
- **special_2**: 基本装備のみ（初期装備のみでクリア）

### 東方獣王園（19作目）
- **special_1**: ノーカード強化（カードアップグレード未使用）
- **special_2**: 初期デッキのみ（スターターデッキのみ）

### 東方錦上京（20作目）
- **special_1**: ノー異変石（異変石未装備）
- **special_2**: 基本異変石のみ（基本異変石のみ装備）

## 実装アーキテクチャ

### 定数管理
- `domain/constants/clear_condition_constants.py`: 全特殊条件の定義
- ゲーム別マッピング：`GAME_SPECIAL_CONDITIONS`
- 動的条件取得：`get_special_conditions_for_game(game_id)`

### エンティティ拡張
```python
class ClearRecord:
    def __init__(self, ...):
        # 基本条件
        self.is_cleared = False
        self.is_no_continue_clear = False
        self.is_no_bomb_clear = False
        self.is_no_miss_clear = False
        self.is_full_spell_card = False  # フルスペカ（新規追加）
        
        # 特殊条件（新規追加）
        self.is_special_clear_1 = False  # 作品特有条件1
        self.is_special_clear_2 = False  # 作品特有条件2
        self.is_special_clear_3 = False  # 作品特有条件3
```

### 条件判定メソッド拡張
```python
def has_any_clear_condition(self) -> bool:
    return (self.is_cleared or 
            self.is_no_continue_clear or 
            self.is_no_bomb_clear or 
            self.is_no_miss_clear or
            self.is_full_spell_card or      # フルスペカ（新規）
            self.is_special_clear_1 or      # 新規
            self.is_special_clear_2 or      # 新規
            self.is_special_clear_3)        # 新規

def get_achieved_conditions(self) -> list[str]:
    conditions = []
    # 基本条件チェック
    if self.is_cleared: conditions.append("cleared")
    if self.is_no_continue_clear: conditions.append("no_continue")
    if self.is_no_bomb_clear: conditions.append("no_bomb")
    if self.is_no_miss_clear: conditions.append("no_miss")
    if self.is_full_spell_card: conditions.append("full_spell_card")  # フルスペカ（新規）
    
    # 特殊条件チェック（新規）
    if self.is_special_clear_1: conditions.append("special_1")
    if self.is_special_clear_2: conditions.append("special_2")
    if self.is_special_clear_3: conditions.append("special_3")
    
    return conditions
```

## API設計

### レスポンス形式拡張
```json
{
  "id": 123,
  "user_id": 1,
  "game_id": 17,
  "character_id": 75,
  "difficulty": "Normal",
  "is_cleared": true,
  "is_no_continue_clear": false,
  "is_no_bomb_clear": true,
  "is_no_miss_clear": false,
  "is_full_spell_card": false,   // フルスペカ
  "is_special_clear_1": true,    // ノーロアリング
  "is_special_clear_2": false,   // 単一アニマル
  "is_special_clear_3": false,   // 未使用
  "cleared_at": "2024-03-15",
  "created_at": "2024-03-15T10:30:00Z",
  "last_updated_at": "2024-03-15T10:30:00Z"
}
```

### 条件名取得API
```http
GET /api/v1/games/{game_id}/clear-conditions
```

レスポンス例：
```json
{
  "basic_conditions": [
    {"key": "cleared", "display_name": "クリア", "description": "通常クリア"},
    {"key": "no_continue", "display_name": "ノーコン", "description": "コンティニュー未使用でクリア"},
    {"key": "no_bomb", "display_name": "ノーボム", "description": "ボム未使用でクリア"},
    {"key": "no_miss", "display_name": "ノーミス", "description": "ミス0でクリア"},
    {"key": "full_spell_card", "display_name": "フルスペカ", "description": "全スペルカード取得"}
  ],
  "special_conditions": [
    {"key": "special_1", "display_name": "ノーロアリング", "description": "ローリングモード未発動"},
    {"key": "special_2", "display_name": "単一アニマル", "description": "1種類のアニマルスピリットのみ"}
  ]
}
```

## フロントエンド対応

### UI表示
```javascript
const ClearConditionCheckbox = ({ gameId, condition, checked, onChange }) => {
  const specialConditions = useSpecialConditions(gameId);
  
  const getDisplayName = (conditionKey) => {
    if (conditionKey.startsWith('special_')) {
      const special = specialConditions[conditionKey];
      return special?.display_name || conditionKey;
    }
    return BASIC_CONDITIONS[conditionKey]?.display_name || conditionKey;
  };
  
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {getDisplayName(condition)}
    </label>
  );
};
```

### カスタムフック
```javascript
const useSpecialConditions = (gameId) => {
  const [conditions, setConditions] = useState({});
  
  useEffect(() => {
    if (gameId) {
      api.get(`/games/${gameId}/clear-conditions`)
        .then(response => {
          const special = {};
          response.data.special_conditions.forEach(cond => {
            special[cond.key] = cond;
          });
          setConditions(special);
        });
    }
  }, [gameId]);
  
  return conditions;
};
```

## マイグレーション手順

### 1. データベーススキーマ更新
```sql
-- 本番環境での実行手順
ALTER TABLE clear_records ADD COLUMN is_special_clear_1 BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE clear_records ADD COLUMN is_special_clear_2 BOOLEAN DEFAULT FALSE NOT NULL;  
ALTER TABLE clear_records ADD COLUMN is_special_clear_3 BOOLEAN DEFAULT FALSE NOT NULL;

-- インデックス追加（パフォーマンス向上）
CREATE INDEX idx_clear_records_special_1 ON clear_records(is_special_clear_1) WHERE is_special_clear_1 = TRUE;
CREATE INDEX idx_clear_records_special_2 ON clear_records(is_special_clear_2) WHERE is_special_clear_2 = TRUE;
CREATE INDEX idx_clear_records_special_3 ON clear_records(is_special_clear_3) WHERE is_special_clear_3 = TRUE;
```

### 2. 既存データの互換性
- 既存レコードの特殊フラグはすべて`FALSE`でデフォルト設定
- 後方互換性完全保持
- 段階的に特殊条件対応を展開可能

### 3. テスト戦略
```python
def test_special_clear_conditions():
    # 基本条件のみのケース
    record = ClearRecord(is_cleared=True)
    assert record.has_any_clear_condition()
    assert "cleared" in record.get_achieved_conditions()
    
    # 特殊条件のみのケース
    record = ClearRecord(is_special_clear_1=True)
    assert record.has_any_clear_condition()
    assert "special_1" in record.get_achieved_conditions()
    
    # 混合条件のケース
    record = ClearRecord(
        is_no_bomb_clear=True,
        is_special_clear_1=True,
        is_special_clear_2=True
    )
    conditions = record.get_achieved_conditions()
    assert len(conditions) == 3
    assert "no_bomb" in conditions
    assert "special_1" in conditions
    assert "special_2" in conditions
```

## 将来拡張性

### 新作品対応手順
1. `clear_condition_constants.py`に新作品の特殊条件を追加
2. `GAME_SPECIAL_CONDITIONS`に作品IDとマッピングを設定
3. フロントエンドは自動的に新条件を取得・表示

### 4つ目以降の特殊条件
現在3つの予備フラグで想定されるほぼ全ての作品をカバーしていますが、将来的に不足する場合：
1. `is_special_clear_4`, `is_special_clear_5`を追加
2. JSON形式での柔軟な条件管理への移行検討

## 設計原則遵守

### マジックナンバー排除
- 特殊条件キーは定数クラスで管理
- 条件数（3個）も定数化
- ゲームIDとの対応は中央集約化

### 拡張性重視
- 新作品追加は設定ファイル更新のみ
- UIは動的に条件を取得・表示
- 後方互換性を完全保持

この設計により、東方シリーズの多様な特殊クリア条件に対応しつつ、将来的な拡張性と保守性を確保できます。