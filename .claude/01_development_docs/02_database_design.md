# データベース設計

## データベース環境対応

### 対応データベース
- **SQLite**: 開発環境用（軽量・高速）
- **MySQL 8.0**: 本番環境用（スケーラブル・高性能）

### 環境切り替え
- 環境変数 `DATABASE_URL` で切り替え
- SQLite: `sqlite:///./touhou_clear_checker.db`
- MySQL: `mysql+pymysql://user:password@host:port/database?charset=utf8mb4`

### MySQL設定
- **文字エンコーディング**: UTF-8 (utf8mb4) 完全対応
- **照合順序**: utf8mb4_unicode_ci
- **接続ライブラリ**: PyMySQL 1.1.1
- **文字化け対策**: 接続時charset指定、サーバー設定の統一

### データ移行
- SQLite → MySQL移行スクリプト: `migrate_sqlite_to_mysql.py`
- 141機体データの完全移行対応
- 外部キー制約を考慮した安全な移行

## 実装済みテーブル構造

### users テーブル
ユーザー管理（認証・権限管理・メール認証）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | INTEGER | PRIMARY KEY | ユーザーID |
| username | VARCHAR(50) | NOT NULL UNIQUE | ユーザー名 |
| email | VARCHAR(100) | NOT NULL UNIQUE | メールアドレス |
| hashed_password | VARCHAR(255) | NOT NULL | ハッシュ化パスワード |
| is_active | BOOLEAN | DEFAULT TRUE | アクティブフラグ |
| is_admin | BOOLEAN | DEFAULT FALSE | 管理者権限フラグ |
| email_verified | BOOLEAN | DEFAULT FALSE NOT NULL | メール認証済みフラグ |
| verification_token | VARCHAR(255) | NULL INDEX | メール認証トークン |
| verification_token_expires_at | TIMESTAMP | NULL | 認証トークン有効期限 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新日時 |

```sql
-- インデックス
CREATE INDEX idx_users_verification_token ON users(verification_token);
```

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

### 1. 機体データ投入（全作品統合）

#### 東方紅魔郷（6作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(1, '霊夢A（霊の御札）', 'ホーミングアミュレット・霊力重視タイプ', 1),
(1, '霊夢B（夢の御札）', 'パスウェイジョンニードル・攻撃力重視タイプ', 2),
(1, '魔理沙A（魔の御札）', 'マジックミサイル・魔力重視タイプ', 3),
(1, '魔理沙B（恋の御札）', 'イリュージョンレーザー・貫通力重視タイプ', 4);
```

#### 東方妖々夢（7作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(2, '霊夢A（霊符）', 'ホーミング・誘導型', 1),
(2, '霊夢B（夢符）', '連射型', 2),
(2, '魔理沙A（魔符）', 'パワー重視型', 3),
(2, '魔理沙B（恋符）', '貫通レーザー型', 4),
(2, '咲夜A（幻符）', '広範囲型', 5),
(2, '咲夜B（時符）', '特殊型', 6);
```

#### 東方永夜抄（8作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
-- 人妖タッグ（初期利用可能）
(3, '霊夢&紫（人妖タッグ）', '幻想の結界組', 1),
(3, '魔理沙&アリス（人妖タッグ）', '禁呪の詠唱組', 2),
(3, '咲夜&レミリア（人妖タッグ）', '夢幻の紅魔組', 3),
(3, '妖夢&幽々子（人妖タッグ）', '幽冥の住人組', 4),
-- 人間単体（全タッグで6B面クリア後解放）
(3, '霊夢（人間単体）', '霊力単体攻撃', 5),
(3, '魔理沙（人間単体）', '魔法単体攻撃', 6),
(3, '咲夜（人間単体）', '時間操作単体攻撃', 7),
(3, '妖夢（人間単体）', '半霊単体攻撃', 8),
-- 妖怪単体（全タッグで6B面クリア後解放）
(3, '紫（妖怪単体）', '境界操作単体攻撃', 9),
(3, 'アリス（妖怪単体）', '人形操作単体攻撃', 10),
(3, 'レミリア（妖怪単体）', '吸血単体攻撃', 11),
(3, '幽々子（妖怪単体）', '死霊単体攻撃', 12);
```

#### 東方花映塚（9作目）- 対戦型STG
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(4, '霊夢', 'チャージ速度★★★★★・当たり判定小', 1),
(4, '魔理沙', '移動速度★★★★★・チャージ速度★★', 2),
(4, '咲夜', '時間操作系特殊能力', 3),
(4, '妖夢', '半霊を活用した特殊攻撃', 4),
(4, '鈴仙', '狂気による特殊効果', 5),
(4, 'チルノ', '氷結系攻撃', 6),
(4, 'リリカ', '騒霊による音響攻撃', 7),
(4, 'メルラン', '幻想の演奏', 8),
(4, 'ルナサ', '憂鬱な音色', 9),
(4, 'ミスティア', '夜雀の歌声', 10),
(4, 'てゐ', 'ラッキー効果', 11),
(4, '文', '風の力と取材', 12),
(4, 'メディスン', '毒による攻撃', 13),
(4, '幽香', '花と自然の力', 14),
(4, '小町', '距離操作能力', 15),
(4, '映姫', '審判の力', 16);
```

#### 東方風神録（10作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(5, '霊夢A（誘導装備）', 'ホーミング弾・道中楽・霊撃範囲大', 1),
(5, '霊夢B（前方集中装備）', '高火力正面集中・遠距離最優秀火力', 2),
(5, '霊夢C（封印装備）', '近距離特化・道中強化・ボス戦要張り付け', 3),
(5, '魔理沙A（高威力装備）', '中パワー遠距離火力特化・オプション癖あり', 4),
(5, '魔理沙B（貫通装備）', 'バグマリ・特定条件下で圧倒的火力', 5),
(5, '魔理沙C（魔法使い装備）', 'オプション固定可能・戦略性高', 6);
```

#### 東方地霊殿（11作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(6, '霊夢A（紫支援）', '前方集中高火力・当たり判定極小', 1),
(6, '霊夢B（萃香支援）', '高速移動時火力重視', 2),
(6, '霊夢C（文支援）', '霊撃無敵時間最長・追尾霊撃', 3),
(6, '魔理沙A（アリス支援）', '人形オプション・パワー8.0まで上昇', 4),
(6, '魔理沙B（パチュリー支援）', '5元素切替システム（火水木金土符）', 5),
(6, '魔理沙C（にとり支援）', '霊撃バリア・パワー回復システム', 6);
```

#### 東方星蓮船（12作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(7, '霊夢A（一点集中攻撃力重視型）', '針弾ホーミング型・安定性重視', 1),
(7, '霊夢B（アンチパターン重視超誘導型）', '陰陽玉直線型・火力重視', 2),
(7, '魔理沙A（無限貫通＆常時攻撃型）', '星型弾幕・前方集中型', 3),
(7, '魔理沙B（超攻撃範囲重視型）', 'レーザー系・貫通特化', 4),
(7, '早苗A（一点集中＆誘導型）', 'サブショット直角誘導・全画面スペル', 5),
(7, '早苗B（高威力＆広範囲炸裂型）', '爆発エフェクト・近距離最強火力', 6);
```

#### 東方妖精大戦争（12.8作目）- 特殊仕様対応
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(8, 'チルノ（Route A1）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 1),
(8, 'チルノ（Route A2）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 2),
(8, 'チルノ（Route B1）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 3),
(8, 'チルノ（Route B2）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 4),
(8, 'チルノ（Route C1）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 5),
(8, 'チルノ（Route C2）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 6),
(8, 'チルノ（Extra）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 7);
```

**妖精大戦争特殊仕様:**
- **データ構造**: Route A1〜C2（6機体）+ Extra（1機体）の合計7機体
- **フロントエンド表示制御**:
  - Easy/Normal/Hard/Lunaticタブ: Route A1〜C2のみ表示
  - Extraタブ: Extra機体のみ表示
- **表記変更**: 「機体別」→「ルート別」での統一表記
- **実装箇所**: `IndividualTabClearForm.tsx`でgame_id=8による条件分岐

#### 東方神霊廟（13作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(9, '霊夢', '広範囲ホーミング弾・霊収集優秀・初心者向け', 1),
(9, '魔理沙', '癖のあるショット範囲・高いトランス攻撃力', 2),
(9, '早苗', '幅広いショット範囲・ライフボム獲得しやすい', 3),
(9, '妖夢', '溜め撃ち広範囲貫通高火力斬撃・高難易度向け', 4);
```

#### 東方輝針城（14作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(10, '霊夢A（お祓い棒）', 'サブショット頻繁配置・魔理沙砲戦術', 1),
(10, '霊夢B (妖器なし)', '従来型ホーミング・針攻撃', 2),
(10, '魔理沙A（ミニ八卦路）', '遠距離ダメージ下位・ボムのみが取り柄', 3),
(10, '魔理沙B（妖器なし）', '極めて強力・最強ファーミング性能・防御脆弱', 4),
(10, '咲夜A（シルバーブレード）', 'バリアボム・優秀なファーミング・防御性能', 5),
(10, '咲夜B（妖器なし）', '咲夜Aに劣る性能', 6);
```

#### 東方紺珠伝（15作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(11, '霊夢', 'ホーミングショット・やや小さい当たり判定', 1),
(11, '魔理沙', '低速・高速共に高火力・狭い攻撃範囲', 2),
(11, '早苗', '低速・高速共に広範囲攻撃・集中ショットホーミング', 3),
(11, '鈴仙', '集中ショット貫通弾・スペルカード3発耐久バリア・Legacy特化', 4);
```

#### 東方天空璋（16作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
-- 4キャラ×4サブシーズン
(12, '霊夢（春）', '弱いホーミングショット・長い無敵時間', 1),
(12, '霊夢（夏）', '低ゲージ消費・直接ダメージ', 2),
(12, '霊夢（秋）', '高ショット威力・独特な移動性能', 3),
(12, '霊夢（冬）', 'レーザー倍加バグで高ダメージ可能', 4),
(12, 'チルノ（春）', '氷弾系攻撃・低速度・高耐久', 5),
(12, 'チルノ（夏）', '氷弾系攻撃・低速度・高耐久', 6),
(12, 'チルノ（秋）', '氷弾系攻撃・低速度・高耐久', 7),
(12, 'チルノ（冬）', '氷弾系攻撃・低速度・高耐久', 8),
(12, '文（春）', '高速移動・風系攻撃', 9),
(12, '文（夏）', '高速移動・風系攻撃', 10),
(12, '文（秋）', '高速移動・風系攻撃', 11),
(12, '文（冬）', '高速移動・風系攻撃', 12),
(12, '魔理沙（春）', '集中前方ショット・ボス戦特化', 13),
(12, '魔理沙（夏）', '集中前方ショット・ボス戦特化', 14),
(12, '魔理沙（秋）', '集中前方ショット・ボス戦特化', 15),
(12, '魔理沙（冬）', '集中前方ショット・ボス戦特化', 16);
```

#### 東方鬼形獣（17作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
-- 3キャラ×3アニマルスピリット
(13, '霊夢（オオカミ）', '集中ショット強化・3個以上でハイパー化', 1),
(13, '霊夢（カワウソ）', 'スペルカード強化・初期数+1・3個以上でバリア', 2),
(13, '霊夢（オオワシ）', '拡散ショット強化・3個以上でハイパー化', 3),
(13, '魔理沙（オオカミ）', '集中ショット強化・3個以上でハイパー化', 4),
(13, '魔理沙（カワウソ）', 'スペルカード強化・初期数+1・3個以上でバリア', 5),
(13, '魔理沙（オオワシ）', '拡散ショット強化・3個以上でハイパー化', 6),
(13, '妖夢（オオカミ）', '集中ショット強化・3個以上でハイパー化', 7),
(13, '妖夢（カワウソ）', 'スペルカード強化・初期数+1・3個以上でバリア', 8),
(13, '妖夢（オオワシ）', '拡散ショット強化・3個以上でハイパー化', 9);
```

#### 東方虹龍洞（18作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(14, '霊夢', 'アビリティカードシステム対応', 1),
(14, '魔理沙', 'アビリティカードシステム対応', 2),
(14, '咲夜', 'アビリティカードシステム対応', 3),
(14, '早苗', 'アビリティカードシステム対応', 4);
```

#### 東方獣王園（19作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
(15, '博麗霊夢', '楽園の巫女・ホーミング弾・バランス型', 1),
(15, '霧雨魔理沙', '普通の魔法使い・攻撃特化・レーザー系', 2),
(15, '東風谷早苗', '風祝・安定性重視・幅広いショット', 3),
(15, '八雲藍', '式神・九尾のキツネ・式神操作', 4),
(15, '高麗野あうん', '狛犬・阿吽一対・防御特化', 5),
(15, 'ナズーリン', 'ネズミの妖怪・ダウザー・探索能力', 6),
(15, '清蘭', '月の兎・イーグルラヴィ・空中機動', 7),
(15, '火焔猫燐', '地獄の火車・お燐・火炎攻撃', 8),
(15, '菅牧典', 'キツネの妖怪・管狐使い・召喚攻撃', 9),
(15, '二ッ岩マミゾウ', 'タヌキの妖怪・化け学の権威・変化能力', 10),
(15, '吉弔八千慧', '鬼傑組の総長・キクリ・組織力', 11),
(15, '驪駒早鬼', '驪駒組の組長・牛鬼・突進攻撃', 12),
(15, '饕餮尤魔', '饕餮・大食い妖怪・吸収能力', 13),
(15, '伊吹萃香', '鬼・力の四天王・怪力攻撃', 14),
(15, '孫美天', '杖刀偶・ハニワの妖怪・土属性攻撃', 15),
(15, '三頭慧ノ子', '山彦・エコー妖怪・音響攻撃', 16),
(15, '天火人ちやり', '天邪鬼・あまのじゃく・反転能力', 17),
(15, '豫母都日狭美', '石の妖怪・ヨミの使者・重力操作', 18),
(15, '日白残無', 'ソンシ様・朱鷺子・最終ボス・強力な弾幕', 19);
```

#### 東方錦上京（20作目）
```sql
INSERT INTO game_characters (game_id, character_name, description, sort_order) VALUES
-- 2キャラ×8異変石＝16組み合わせ
(16, '霊夢（スカーレットデビル）', '紅魔郷モチーフ・ボム周囲回転光弾', 1),
(16, '霊夢（クリーチャーレッド）', '鬼形獣モチーフ・ボム周囲回転光弾', 2),
(16, '霊夢（スノーブロッサム）', '妖々夢モチーフ・ボム周囲回転光弾', 3),
(16, '霊夢（ブルーシーズン）', '天空璋モチーフ・ボム周囲回転光弾', 4),
(16, '霊夢（イエローサブタレイニアン）', '地霊殿モチーフ・ボム周囲回転光弾', 5),
(16, '霊夢（インペリシャブルムーン）', '永夜抄モチーフ・ボム周囲回転光弾', 6),
(16, '霊夢（ビーストハードネス）', '獣王園モチーフ・ボム周囲回転光弾', 7),
(16, '霊夢（シントイズムウィンド）', '風神録モチーフ・ボム周囲回転光弾', 8),
(16, '魔理沙（スカーレットデビル）', '紅魔郷モチーフ・大型前方レーザー', 9),
(16, '魔理沙（クリーチャーレッド）', '鬼形獣モチーフ・大型前方レーザー', 10),
(16, '魔理沙（スノーブロッサム）', '妖々夢モチーフ・大型前方レーザー', 11),
(16, '魔理沙（ブルーシーズン）', '天空璋モチーフ・大型前方レーザー', 12),
(16, '魔理沙（イエローサブタレイニアン）', '地霊殿モチーフ・大型前方レーザー', 13),
(16, '魔理沙（インペリシャブルムーン）', '永夜抄モチーフ・大型前方レーザー', 14),
(16, '魔理沙（ビーストハードネス）', '獣王園モチーフ・大型前方レーザー', 15),
(16, '魔理沙（シントイズムウィンド）', '風神録モチーフ・大型前方レーザー', 16);
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
('東方花映塚', 9.0, 2005, 'versus'),
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
('東方獣王園', 19.0, 2023, 'versus'),
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