# データベース設計

## 実装済みテーブル構造

### users テーブル
ユーザー管理（認証・権限管理）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | ユーザーID |
| username | VARCHAR(50) | NOT NULL UNIQUE | ユーザー名 |
| email | VARCHAR(100) | NOT NULL UNIQUE | メールアドレス |
| hashed_password | VARCHAR(255) | NOT NULL | ハッシュ化パスワード |
| is_active | BOOLEAN | DEFAULT TRUE | アクティブフラグ |
| is_admin | BOOLEAN | DEFAULT FALSE | 管理者権限フラグ |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### games テーブル
東方シリーズのゲーム作品管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | ゲームID |
| title | VARCHAR(255) | NOT NULL | ゲームタイトル |
| series_number | DECIMAL(4,1) | NOT NULL | シリーズ番号（7.5作等に対応） |
| release_year | INTEGER | NOT NULL | リリース年 |
| game_type | VARCHAR(50) | NOT NULL DEFAULT 'main_series' | ゲームタイプ |

## 新設計テーブル構造（機体別条件式対応）

### game_characters テーブル（新規作成）
作品別機体管理（統合設計）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | 機体ID |
| game_id | INTEGER | NOT NULL | ゲームID（外部キー） |
| character_name | VARCHAR(100) | NOT NULL | 機体名（霊夢A、魔理沙B、霊夢&紫、霊夢（オオカミ）等） |
| description | TEXT | NULL | 機体説明（ショット特性、性能等） |
| sort_order | INTEGER | DEFAULT 0 | 表示順序 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

```sql
-- 制約・インデックス
UNIQUE(game_id, character_name)
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
CREATE INDEX idx_game_characters_game ON game_characters(game_id);
CREATE INDEX idx_game_characters_sort ON game_characters(game_id, sort_order);
```

### clear_records テーブル（clear_statusから変更）
機体別個別条件記録

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | クリア記録ID |
| user_id | INTEGER | NOT NULL | ユーザーID（外部キー） |
| game_id | INTEGER | NOT NULL | ゲームID（外部キー） |
| character_id | INTEGER | NOT NULL | 機体ID（外部キー：game_charactersテーブル） |
| difficulty | VARCHAR(20) | NOT NULL | 難易度 |
| mode | VARCHAR(20) | DEFAULT 'normal' | ゲームモード（通常: normal、紺珠伝: legacy/pointdevice） |
| is_cleared | BOOLEAN | DEFAULT FALSE | 通常クリア達成 |
| is_no_continue_clear | BOOLEAN | DEFAULT FALSE | ノーコンティニュークリア達成 |
| is_no_bomb_clear | BOOLEAN | DEFAULT FALSE | ノーボムクリア達成 |
| is_no_miss_clear | BOOLEAN | DEFAULT FALSE | ノーミスクリア達成 |
| is_full_spell_card | BOOLEAN | DEFAULT FALSE | フルスペルカード取得（全作品共通） |
| is_special_clear_1 | BOOLEAN | DEFAULT FALSE | 作品特有条件1（例: ノーロアリング） |
| is_special_clear_2 | BOOLEAN | DEFAULT FALSE | 作品特有条件2（例: ノー季節解放） |
| is_special_clear_3 | BOOLEAN | DEFAULT FALSE | 作品特有条件3（例: その他特殊条件） |
| cleared_at | DATE | NULL | 最初にクリアした日（日付のみ） |
| last_updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 最終更新日時 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

```sql
-- 制約・インデックス
UNIQUE(user_id, game_id, character_id, difficulty, mode) -- 1ユーザー・1ゲーム・1キャラ・1難易度・1モードにつき1レコード
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE  
FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE CASCADE
CREATE INDEX idx_clear_records_user_game ON clear_records(user_id, game_id);
CREATE INDEX idx_clear_records_user ON clear_records(user_id);
CREATE INDEX idx_clear_records_game ON clear_records(game_id);
CREATE INDEX idx_clear_records_mode ON clear_records(game_id, mode);
```

### game_memos テーブル（新規作成）
作品ごとメモ管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | メモID |
| user_id | INTEGER | NOT NULL | ユーザーID（外部キー） |
| game_id | INTEGER | NOT NULL | ゲームID（外部キー） |
| memo | TEXT | NULL | 作品全体のメモ |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

```sql
-- 制約・インデックス
UNIQUE(user_id, game_id) -- 1ユーザー・1ゲームにつき1つのメモ
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
CREATE INDEX idx_game_memos_user_game ON game_memos(user_id, game_id);
```

## 新設計の特徴

### 1. シンプルで実用的な設計
- **統合game_charactersテーブル**: charactersテーブルとの分離を廃止し、シンプルな構造を実現
- **東方シリーズに最適化**: 作品ごとに異なる機体システムを自然に表現
- **運用の簡素化**: テーブル数削減により保守性向上

### 2. 機体別個別条件記録
- 1つのキャラクター・難易度・モードで複数の達成レベルを記録
- 例：紺珠伝 霊夢A Easy Legacy で「クリア + ノーコン」のみ達成、「ノーボム・ノーミス」は未達成

### 3. 作品固有システム対応
- **ゲームモード**: 紺珠伝のLegacy/Pointdeviceモード対応
- **特殊クリア条件**: 作品特有の条件（ノーロアリング、ノー季節解放等）を3つまで対応
- **フルスペルカード**: 全作品共通のスペルカード取得フラグ

### 4. 柔軟な機体管理
- 作品ごとに機体データを独立管理
- 複雑な機体システム（ペア、動物スピリット等）に対応
- 表示順序の制御が可能

### 5. シンプルなメモ機能
- 作品ごとに1つのメモ（攻略情報、感想等）
- 個別記録レベルではなく作品レベルでの情報管理

## 値オブジェクト

### 難易度（Difficulty）
```python
class Difficulty(Enum):
    EASY = "Easy"
    NORMAL = "Normal"
    HARD = "Hard"
    LUNATIC = "Lunatic"
    EXTRA = "Extra"
    PHANTASM = "Phantasm"  # 妖々夢（第7作）のみ
```

**制限事項**:
- `PHANTASM`難易度は東方妖々夢（第7作）でのみ利用可能
- `EXTRA`難易度は東方獣王園（第19作）では利用不可
- 紺珠伝（第15作）では`EXTRA`はLegacyモードでのみ利用可能

### ゲームモード（GameMode）
```python
class GameMode(Enum):
    NORMAL = "normal"           # 通常モード（全ゲーム共通）
    LEGACY = "legacy"           # レガシーモード（紺珠伝）
    POINTDEVICE = "pointdevice"  # 完全無欠モード（紺珠伝）
```

**制限事項**:
- モード選択は東方紺珠伝（第15作）でのみ利用可能
- 他の作品では`NORMAL`モードのみ

### ゲームタイプ（GameType）
```python
class GameType(Enum):
    MAIN_SERIES = "main_series"  # 本編STG（第6作〜第20作）
    SPIN_OFF_STG = "spin_off_stg"  # 外伝STG（妖精大戦争など）
    FIGHTING = "fighting"        # 格闘ゲーム（.5作系）
    PHOTOGRAPHY = "photography"  # 撮影STG（文花帖系）
    MIXED = "mixed"             # 格闘+STG要素
    VERSUS = "versus"           # 対戦型STG（花映塚、獣王園）
```

## データ移行戦略

### 1. 機体データ投入（統合game_charactersテーブル）
```sql
-- 各作品の機体データ投入例
-- 紅魔郷（6作目）
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(1, '霊夢A', 'ホーミングアミュレット中心の霊力重視タイプ', 1),
(1, '霊夢B', '封魔針中心の攻撃力重視タイプ', 2),
(1, '魔理沙A', 'マジックミサイル中心の魔力重視タイプ', 3),
(1, '魔理沙B', 'イリュージョンレーザー中心の貫通力重視タイプ', 4);

-- 永夜抄（8作目）：ペアシステム
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(3, '霊夢&紫（単独）', '結界操作による単独攻撃特化', 1),
(3, '霊夢&紫（協力）', '結界操作による協力攻撃特化', 2),
(3, '魔理沙&アリス（単独）', '人形と魔法の単独連携', 3),
(3, '魔理沙&アリス（協力）', '人形と魔法の協力連携', 4),
(3, '咲夜&レミリア（単独）', '時間操作と吸血の単独連携', 5),
(3, '咲夜&レミリア（協力）', '時間操作と吸血の協力連携', 6),
(3, '慧音&妹紅（単独）', '歴史と不死の単独連携', 7),
(3, '慧音&妹紅（協力）', '歴史と不死の協力連携', 8);

-- 鬼形獣（17作目）：動物スピリットシステム
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(13, '霊夢（オオカミ）', '近距離特化・高火力の狼スピリット', 1),
(13, '霊夢（カワウソ）', '水属性攻撃・範囲攻撃のカワウソスピリット', 2),
(13, '霊夢（オオワシ）', '遠距離特化・高速移動の鷲スピリット', 3),
(13, '魔理沙（オオカミ）', '魔法×狼の組み合わせ', 4),
(13, '魔理沙（カワウソ）', '魔法×カワウソの組み合わせ', 5),
(13, '魔理沙（オオワシ）', '魔法×鷲の組み合わせ', 6);

-- 紺珠伝（15作目）：特殊能力システム
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(11, '霊夢', 'ホーミングショット・小さい当たり判定', 1),
(11, '魔理沙', '高火力・狭範囲攻撃', 2),
(11, '早苗', '広範囲攻撃・ホーミング集中ショット', 3),
(11, '鈴仙', '貫通弾・3発バリア（Legacy特化性能）', 4);
```

### 2. 既存データ移行
```sql
-- 既存のクリア状況データをclear_recordsテーブルに移行
-- ※ 既存のgame_charactersテーブルがある場合
INSERT INTO clear_records (
    user_id, game_id, character_id, difficulty, mode,
    is_cleared, is_no_continue_clear, is_no_bomb_clear, is_no_miss_clear,
    cleared_at, created_at
)
SELECT 
    cs.user_id,
    cs.game_id,
    cs.character_id,  -- 既存のcharacter_idをそのまま使用
    cs.difficulty,
    'normal',  -- デフォルトモード
    cs.is_cleared,
    cs.is_no_continue_clear,
    cs.is_no_bomb_clear,
    cs.is_no_miss_clear,
    cs.cleared_at,
    cs.created_at
FROM clear_records cs;  -- 既存のテーブル名に応じて調整
```

## 初期データ

### デフォルトユーザー
```sql
INSERT INTO users (username, email, hashed_password, is_admin) VALUES
('admin', 'admin@example.com', '$bcrypt_hash$', TRUE);
```

### 本編STGゲーム（第6作〜第20作）
```sql
INSERT INTO games (title, series_number, release_year, game_type) VALUES
('東方紅魔郷', 6.0, 2002, 'main_series'),
('東方妖々夢', 7.0, 2003, 'main_series'),
('東方永夜抄', 8.0, 2004, 'main_series'),
('東方花映塚', 9.0, 2005, 'main_series'),
('東方風神録', 10.0, 2007, 'main_series'),
('東方地霊殿', 11.0, 2008, 'main_series'),
('東方星蓮船', 12.0, 2009, 'main_series'),
('妖精大戦争', 12.8, 2010, 'spin_off_stg'), 
('東方神霊廟', 13.0, 2011, 'main_series'),
('東方輝針城', 14.0, 2013, 'main_series'),
('東方紺珠伝', 15.0, 2015, 'main_series'),
('東方天空璋', 16.0, 2017, 'main_series'),
('東方鬼形獣', 17.0, 2019, 'main_series'),
('東方虹龍洞', 18.0, 2021, 'main_series'),
('東方獣王園', 19.0, 2023, 'main_series'),
('東方錦上京', 20.0, 2025, 'main_series');
```

## API変更影響範囲

### 新規エンドポイント
```
GET /api/v1/games/{game_id}/characters    # 作品別機体一覧
GET /api/v1/game-memos/{game_id}         # 作品メモ取得
POST /api/v1/game-memos/{game_id}        # 作品メモ保存
PUT /api/v1/game-memos/{game_id}         # 作品メモ更新
```

### 変更されるエンドポイント
```
# クリア状況関連（clear_records対応）
GET /api/v1/clear-records?game_id=1&mode=legacy      # ゲーム別・モード別クリア記録
POST /api/v1/clear-records                           # クリア記録作成（mode対応）
PUT /api/v1/clear-records/{id}                       # クリア記録更新  
DELETE /api/v1/clear-records/{id}                    # クリア記録削除
```

## データベースファイル
- **場所**: `/backend/touhou_clear_checker.db`
- **タイプ**: SQLite3
- **接続設定**: `infrastructure/database/connection.py`

## マイグレーション
- **既存**: `scripts/migrate_database.py`（users, games, clear_records）
- **新規**: `scripts/migrate_to_unified_character_system.py`（統合game_charactersテーブル作成・データ移行）
- **管理者権限追加**: `scripts/add_admin_flag.py`
- **本編STGデータ追加**: `scripts/add_main_series_games.py`
- **紺珠伝モード対応**: `scripts/add_kanjuden_mode_support.py`

## セキュリティ考慮事項
- パスワードはbcryptでハッシュ化
- ユーザーは他ユーザーのクリア情報にアクセス不可
- 管理者のみがゲーム作品・キャラクター管理可能
- 機体別記録により更に細分化された権限管理

## データベース設計原則
- **実用性とシンプルさを最優先**: 過度な正規化を避け、運用しやすい設計
- **東方シリーズに特化**: 作品ごとの特殊システムに対応できる柔軟性
- 外部キー制約による参照整合性の保証
- インデックス最適化によるクエリパフォーマンス向上
- 統合テーブルによる管理の簡素化

## 今後の拡張予定
- 番外編作品の本格対応（格闘ゲーム、撮影STG）
- リプレイファイル管理
- スコアランキング（機体別）
- プレイ統計（キャラクター使用頻度等）
- キャラクター画像・詳細情報