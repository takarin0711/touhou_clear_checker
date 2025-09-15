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

### clear_status テーブル
ユーザーごとの詳細クリア状況

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | クリア状況ID |
| game_id | INTEGER | NOT NULL | ゲームID（外部キー） |
| user_id | INTEGER | NOT NULL | ユーザーID（外部キー） |
| difficulty | VARCHAR(50) | NOT NULL | 難易度 |
| is_cleared | BOOLEAN | DEFAULT FALSE | 基本クリアフラグ |
| cleared_at | DATETIME | NULL | クリア日時 |
| no_continue_clear | BOOLEAN | DEFAULT FALSE | ノーコンティニュークリア |
| no_bomb_clear | BOOLEAN | DEFAULT FALSE | ノーボムクリア |
| no_miss_clear | BOOLEAN | DEFAULT FALSE | ノーミスクリア |
| score | INTEGER | NULL | スコア |
| clear_count | INTEGER | DEFAULT 0 | クリア回数 |

## リレーション
```sql
-- 外部キー制約
ALTER TABLE clear_status ADD FOREIGN KEY (game_id) REFERENCES games(id);
ALTER TABLE clear_status ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

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
- `Game.get_available_difficulties()`メソッドで制御

### ゲームタイプ（GameType）
```python
class GameType(Enum):
    MAIN_SERIES = "main_series"  # 通常シリーズ（第6作〜第19作）
    FIGHTING = "fighting"        # 格闘ゲーム（.5作系）
    PHOTOGRAPHY = "photography"  # 撮影STG（文花帖系）
    MIXED = "mixed"             # 格闘+STG要素
```

## 初期データ

### デフォルトユーザー
```sql
INSERT INTO users (username, email, hashed_password, is_admin) VALUES
('admin', 'admin@example.com', '$bcrypt_hash$', TRUE);
```

### 通常シリーズゲーム（第6作〜第20作）
```sql
INSERT INTO games (title, series_number, release_year, game_type) VALUES
('東方紅魔郷', 6.0, 2002, 'main_series'),
('東方妖々夢', 7.0, 2003, 'main_series'),
('東方永夜抄', 8.0, 2004, 'main_series'),
('東方花映塚', 9.0, 2005, 'main_series'),
('東方風神録', 10.0, 2007, 'main_series'),
('東方地霊殿', 11.0, 2008, 'main_series'),
('東方星蓮船', 12.0, 2009, 'main_series'),
('妖精大戦争', 12.8, 2010, 'main_series'), 
('東方神霊廟', 13.0, 2011, 'main_series'),
('東方輝針城', 14.0, 2013, 'main_series'),
('東方紺珠伝', 15.0, 2015, 'main_series'),
('東方天空璋', 16.0, 2017, 'main_series'),
('東方鬼形獣', 17.0, 2019, 'main_series'),
('東方虹龍洞', 18.0, 2021, 'main_series'),
('東方獣王園', 19.0, 2023, 'main_series'),
('東方錦上京', 20.0, 2025, 'main_series');
```

**データ追加**: `scripts/add_main_series_games.py`で全作品を一括追加可能  
**投入状況**: 第6作〜第20作（16作品）投入済み

## データベースファイル
- **場所**: `/backend/touhou_clear_checker.db`
- **タイプ**: SQLite3
- **接続設定**: `infrastructure/database/connection.py`

## マイグレーション
- **初期作成**: `scripts/migrate_database.py`
- **管理者権限追加**: `scripts/add_admin_flag.py`
- **通常シリーズデータ追加**: `scripts/add_main_series_games.py`

## セキュリティ考慮事項
- パスワードはbcryptでハッシュ化
- ユーザーは他ユーザーのクリア情報にアクセス不可
- 管理者のみがゲーム作品を管理可能

## 番外編対応の将来設計

### 番外編作品分類
```
格闘ゲーム系（.5作）:
- 東方萃夢想（7.5作）
- 東方緋想天（10.5作）
- 東方非想天則（12.3作）
- 東方心綺楼（13.5作）
- 東方深秘録（14.5作）
- 東方憑依華（15.5作）
- 東方剛欲異聞（17.5作）

撮影STG系:
- 東方文花帖（9.5作）
- ダブルスポイラー（12.5作）
- 秘封ナイトメアダイアリー（16.5作）

※ 妖精大戦争（12.8作）は難易度体系が通常シリーズと同じため、main_seriesに分類
```

### 番外編対応時の拡張案
1. **難易度体系の分離**
   - 格闘ゲーム: 難易度概念なし（対戦相手レベル等）
   - 撮影STG: 独自のシーン/レベル制
   
2. **clear_statusテーブル拡張**
   ```sql
   -- 追加検討カラム
   level_type VARCHAR(50)     -- "difficulty" / "scene" / "opponent" 等
   level_value VARCHAR(100)   -- 難易度名 / シーン名 / 対戦相手名 等
   ```

3. **APIエンドポイント分離**
   - `/api/v1/main-series/` - 通常シリーズ専用
   - `/api/v1/spinoffs/` - 番外編専用

## 今後の拡張予定
- 番外編作品の本格対応
- キャラクター情報テーブル
- リプレイファイル管理
- スコアランキング
- プレイ統計