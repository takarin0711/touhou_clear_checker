# データベース設計

## テーブル設計

### games テーブル
東方シリーズのゲーム情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | ゲームID |
| title | VARCHAR(100) | NOT NULL | ゲームタイトル |
| title_en | VARCHAR(100) | NOT NULL | 英語タイトル |
| release_year | INTEGER | NOT NULL | リリース年 |
| series_number | INTEGER | NOT NULL | シリーズ番号 |
| has_extra | BOOLEAN | DEFAULT FALSE | Extraステージ有無 |
| has_phantasm | BOOLEAN | DEFAULT FALSE | Phantasmステージ有無 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |

### difficulties テーブル
難易度マスターテーブル

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | 難易度ID |
| name | VARCHAR(20) | NOT NULL UNIQUE | 難易度名 |
| display_order | INTEGER | NOT NULL | 表示順序 |

### characters テーブル
使用可能キャラクター

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | キャラクターID |
| game_id | INTEGER | NOT NULL | ゲームID（外部キー） |
| name | VARCHAR(50) | NOT NULL | キャラクター名 |
| shot_type | VARCHAR(50) | | ショットタイプ |

### clear_records テーブル
クリア記録のメインテーブル

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | 記録ID |
| game_id | INTEGER | NOT NULL | ゲームID（外部キー） |
| difficulty_id | INTEGER | NOT NULL | 難易度ID（外部キー） |
| character_id | INTEGER | | 使用キャラクター（外部キー） |
| is_cleared | BOOLEAN | DEFAULT FALSE | クリア済みフラグ |
| clear_date | DATE | | クリア日 |
| score | BIGINT | | スコア |
| continue_count | INTEGER | DEFAULT 0 | コンティニュー回数 |
| memo | TEXT | | メモ |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

## 初期データ

### 東方ゲーム一覧（主要作品）
```sql
INSERT INTO games (title, title_en, release_year, series_number, has_extra, has_phantasm) VALUES
('東方紅魔郷', 'Embodiment of Scarlet Devil', 2002, 6, TRUE, FALSE),
('東方妖々夢', 'Perfect Cherry Blossom', 2003, 7, TRUE, TRUE),
('東方永夜抄', 'Imperishable Night', 2004, 8, TRUE, FALSE),
('東方花映塚', 'Phantasmagoria of Flower View', 2005, 9, FALSE, FALSE),
('東方風神録', 'Mountain of Faith', 2007, 10, TRUE, FALSE),
('東方地霊殿', 'Subterranean Animism', 2008, 11, TRUE, FALSE),
('東方星蓮船', 'Undefined Fantastic Object', 2009, 12, TRUE, FALSE),
('東方神霊廟', 'Ten Desires', 2011, 13, TRUE, FALSE),
('東方輝針城', 'Double Dealing Character', 2013, 14, TRUE, FALSE),
('東方紺珠伝', 'Legacy of Lunatic Kingdom', 2015, 15, TRUE, FALSE),
('東方天空璋', 'Hidden Star in Four Seasons', 2017, 16, TRUE, FALSE),
('東方鬼形獣', 'Wily Beast and Weakest Creature', 2019, 17, TRUE, FALSE),
('東方虹龍洞', 'Unconnected Marketeers', 2021, 18, TRUE, FALSE);
```

### 難易度マスター
```sql
INSERT INTO difficulties (name, display_order) VALUES
('Easy', 1),
('Normal', 2),
('Hard', 3),
('Lunatic', 4),
('Extra', 5),
('Phantasm', 6);
```

## インデックス設計
```sql
CREATE INDEX idx_clear_records_game_difficulty ON clear_records(game_id, difficulty_id);
CREATE INDEX idx_clear_records_clear_date ON clear_records(clear_date);
CREATE INDEX idx_characters_game_id ON characters(game_id);
```