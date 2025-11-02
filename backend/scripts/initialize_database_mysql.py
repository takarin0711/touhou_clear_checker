#!/usr/bin/env python3
"""
MySQL対応データベース一括初期化スクリプト
東方プロジェクトクリア状況チェッカー用

Usage:
    python scripts/initialize_database_mysql.py [options]
    
Options:
    --fresh: 既存テーブルを削除して新規作成（adminユーザーも自動作成）
    --games-only: ゲームデータのみ追加
    --characters-only: キャラクターデータのみ追加
    --admin-only: adminユーザーのみ作成
    --verify: データベース内容を確認
"""
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from infrastructure.database.connection import DATABASE_URL
from infrastructure.database.models.user_model import UserModel
from infrastructure.database.models.game_model import GameModel
from infrastructure.database.models.game_character_model import GameCharacterModel
from infrastructure.database.models.clear_record_model import ClearRecordModel
from infrastructure.database.models.game_memo_model import GameMemoModel
from infrastructure.database.connection import Base
from infrastructure.security.password_hasher import PasswordHasher
from infrastructure.security.token_generator import TokenGenerator


class MySQLDatabaseInitializer:
    """MySQL対応データベース初期化クラス"""
    
    def __init__(self):
        print(f"📡 接続先: {DATABASE_URL}")
        self.engine = create_engine(DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
    def create_tables(self):
        """テーブル作成"""
        print("📋 テーブルを作成中...")
        Base.metadata.create_all(bind=self.engine)
        print("✅ 全テーブル作成完了")
        
    def drop_tables(self):
        """テーブル削除"""
        print("🗑️ 既存テーブルを削除中...")
        Base.metadata.drop_all(bind=self.engine)
        print("✅ 全テーブル削除完了")
        
    def insert_game_data(self):
        """ゲームデータ投入"""
        print("🎮 ゲームデータを投入中...")
        
        games_data = [
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
            ('東方錦上京', 20.0, 2025, 'main_series')
        ]
        
        with self.SessionLocal() as session:
            for index, (title, series_number, release_year, game_type) in enumerate(games_data, 1):
                # IDを1から順番に振る
                actual_id = index
                
                game = GameModel(
                    id=actual_id, 
                    title=title,
                    series_number=series_number,
                    release_year=release_year,
                    game_type=game_type
                )
                session.merge(game)  # 既存の場合は更新
            session.commit()
            
        print(f"✅ {len(games_data)}作品のゲームデータ投入完了")
        
    def insert_character_data(self):
        """キャラクターデータ投入"""
        print("👥 キャラクターデータを投入中...")
        
        # SQLiteスクリプトから正しいキャラクターデータを取得
        characters_data = self._get_all_characters_data()
        
        with self.SessionLocal() as session:
            for game_id, character_name, description, sort_order in characters_data:
                character = GameCharacterModel(
                    game_id=game_id,
                    character_name=character_name,
                    description=description,
                    sort_order=sort_order
                )
                session.merge(character)  # 既存の場合は更新
            session.commit()
            
        print(f"✅ {len(characters_data)}種類のキャラクターデータ投入完了")
    
    def _get_all_characters_data(self):
        """SQLiteスクリプトと完全に同じキャラクターデータを返す"""
        characters = []
        
        # 東方紅魔郷（1作目 -> game_id=1）
        characters.extend([
            (1, '霊夢A（霊の御札）', 'ホーミングアミュレット・霊力重視タイプ', 1),
            (1, '霊夢B（夢の御札）', 'パスウェイジョンニードル・攻撃力重視タイプ', 2),
            (1, '魔理沙A（魔の御札）', 'マジックミサイル・魔力重視タイプ', 3),
            (1, '魔理沙B（恋の御札）', 'イリュージョンレーザー・貫通力重視タイプ', 4),
        ])
        
        # 東方妖々夢（2作目 -> game_id=2）
        characters.extend([
            (2, '霊夢A（霊符）', 'ホーミング・誘導型', 1),
            (2, '霊夢B（夢符）', '連射型', 2),
            (2, '魔理沙A（魔符）', 'パワー重視型', 3),
            (2, '魔理沙B（恋符）', '貫通レーザー型', 4),
            (2, '咲夜A（幻符）', '広範囲型', 5),
            (2, '咲夜B（時符）', '特殊型', 6),
        ])
        
        # 東方永夜抄（3作目 -> game_id=3）
        characters.extend([
            (3, '霊夢&紫（人妖タッグ）', '幻想の結界組', 1),
            (3, '魔理沙&アリス（人妖タッグ）', '禁呪の詠唱組', 2),
            (3, '咲夜&レミリア（人妖タッグ）', '夢幻の紅魔組', 3),
            (3, '妖夢&幽々子（人妖タッグ）', '幽冥の住人組', 4),
            (3, '霊夢（人間単体）', '霊力単体攻撃', 5),
            (3, '魔理沙（人間単体）', '魔法単体攻撃', 6),
            (3, '咲夜（人間単体）', '時間操作単体攻撃', 7),
            (3, '妖夢（人間単体）', '半霊単体攻撃', 8),
            (3, '紫（妖怪単体）', '境界操作単体攻撃', 9),
            (3, 'アリス（妖怪単体）', '人形操作単体攻撃', 10),
            (3, 'レミリア（妖怪単体）', '吸血単体攻撃', 11),
            (3, '幽々子（妖怪単体）', '死霊単体攻撃', 12),
        ])
        
        # 東方花映塚（4作目 -> game_id=4）- 対戦型STG
        characters.extend([
            (4, '博麗霊夢', 'チャージ速度★★★★★・当たり判定小', 1),
            (4, '霧雨魔理沙', '移動速度★★★★★・チャージ速度★★', 2),
            (4, '十六夜咲夜', '時間操作系特殊能力', 3),
            (4, '魂魄妖夢', '半霊を活用した特殊攻撃', 4),
            (4, '鈴仙・優曇華院・イナバ', '狂気による特殊効果', 5),
            (4, 'チルノ', '氷結系攻撃', 6),
            (4, 'リリカ・プリズムリバー', '騒霊による音響攻撃', 7),
            (4, 'ミスティア・ローレライ', '夜雀の歌声', 8),
            (4, '因幡てゐ', 'ラッキー効果', 9),
            (4, '射命丸文', '風の力と取材', 10),
            (4, 'メディスン・メランコリー', '毒による攻撃', 11),
            (4, '風見幽香', '花と自然の力', 12),
            (4, '小野塚小町', '距離操作能力', 13),
            (4, '四季映姫・ヤマザナドゥ', '審判の力', 14),
        ])
        
        # 東方風神録（5作目 -> game_id=5）
        characters.extend([
            (5, '霊夢A（誘導装備）', 'ホーミング弾・道中楽・霊撃範囲大', 1),
            (5, '霊夢B（前方集中装備）', '高火力正面集中・遠距離最優秀火力', 2),
            (5, '霊夢C（封印装備）', '近距離特化・道中強化・ボス戦要張り付け', 3),
            (5, '魔理沙A（高威力装備）', '中パワー遠距離火力特化・オプション癖あり', 4),
            (5, '魔理沙B（貫通装備）', 'バグマリ・特定条件下で圧倒的火力', 5),
            (5, '魔理沙C（魔法使い装備）', 'オプション固定可能・戦略性高', 6),
        ])
        
        # 東方地霊殿（6作目 -> game_id=6）
        characters.extend([
            (6, '霊夢A（紫支援）', '前方集中高火力・当たり判定極小', 1),
            (6, '霊夢B（萃香支援）', '高速移動時火力重視', 2),
            (6, '霊夢C（文支援）', '霊撃無敵時間最長・追尾霊撃', 3),
            (6, '魔理沙A（アリス支援）', '人形オプション・パワー8.0まで上昇', 4),
            (6, '魔理沙B（パチュリー支援）', '5元素切替システム（火水木金土符）', 5),
            (6, '魔理沙C（にとり支援）', '霊撃バリア・パワー回復システム', 6),
        ])
        
        # 東方星蓮船（7作目 -> game_id=7）
        characters.extend([
            (7, '霊夢A（一点集中攻撃力重視型）', '針弾ホーミング型・安定性重視', 1),
            (7, '霊夢B（アンチパターン重視超誘導型）', '陰陽玉直線型・火力重視', 2),
            (7, '魔理沙A（無限貫通＆常時攻撃型）', '星型弾幕・前方集中型', 3),
            (7, '魔理沙B（超攻撃範囲重視型）', 'レーザー系・貫通特化', 4),
            (7, '早苗A（一点集中＆誘導型）', 'サブショット直角誘導・全画面スペル', 5),
            (7, '早苗B（高威力＆広範囲炸裂型）', '爆発エフェクト・近距離最強火力', 6),
        ])
        
        # 妖精大戦争（8作目 -> game_id=8）
        characters.extend([
            (8, 'チルノ（Route A1）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 1),
            (8, 'チルノ（Route A2）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 2),
            (8, 'チルノ（Route B1）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 3),
            (8, 'チルノ（Route B2）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 4),
            (8, 'チルノ（Route C1）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 5),
            (8, 'チルノ（Route C2）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 6),
            (8, 'チルノ（Extra）', 'アイスバリア・フリージング機能・パワーLv.1-15→MAX', 7),
        ])
        
        # 東方神霊廟（9作目 -> game_id=9）
        characters.extend([
            (9, '霊夢', '広範囲ホーミング弾・霊収集優秀・初心者向け', 1),
            (9, '魔理沙', '癖のあるショット範囲・高いトランス攻撃力', 2),
            (9, '早苗', '幅広いショット範囲・ライフボム獲得しやすい', 3),
            (9, '妖夢', '溜め撃ち広範囲貫通高火力斬撃・高難易度向け', 4),
        ])
        
        # 東方輝針城（10作目 -> game_id=10）
        characters.extend([
            (10, '霊夢A（お祓い棒）', 'サブショット頻繁配置・魔理沙砲戦術', 1),
            (10, '霊夢B (妖器なし)', '従来型ホーミング・針攻撃', 2),
            (10, '魔理沙A（ミニ八卦路）', '遠距離ダメージ下位・ボムのみが取り柄', 3),
            (10, '魔理沙B（妖器なし）', '極めて強力・最強ファーミング性能・防御脆弱', 4),
            (10, '咲夜A（シルバーブレード）', 'バリアボム・優秀なファーミング・防御性能', 5),
            (10, '咲夜B（妖器なし）', '咲夜Aに劣る性能', 6),
        ])
        
        # 東方紺珠伝（11作目 -> game_id=11）
        characters.extend([
            (11, '霊夢', 'ホーミングショット・やや小さい当たり判定', 1),
            (11, '魔理沙', '低速・高速共に高火力・狭い攻撃範囲', 2),
            (11, '早苗', '低速・高速共に広範囲攻撃・集中ショットホーミング', 3),
            (11, '鈴仙', '集中ショット貫通弾・スペルカード3発耐久バリア・Legacy特化', 4),
        ])
        
        # 東方天空璋（12作目 -> game_id=12）
        characters.extend([
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
            (12, '魔理沙（冬）', '集中前方ショット・ボス戦特化', 16),
        ])
        
        # 東方鬼形獣（13作目 -> game_id=13）
        characters.extend([
            (13, '霊夢（オオカミ）', '集中ショット強化・3個以上でハイパー化', 1),
            (13, '霊夢（カワウソ）', 'スペルカード強化・初期数+1・3個以上でバリア', 2),
            (13, '霊夢（オオワシ）', '拡散ショット強化・3個以上でハイパー化', 3),
            (13, '魔理沙（オオカミ）', '集中ショット強化・3個以上でハイパー化', 4),
            (13, '魔理沙（カワウソ）', 'スペルカード強化・初期数+1・3個以上でバリア', 5),
            (13, '魔理沙（オオワシ）', '拡散ショット強化・3個以上でハイパー化', 6),
            (13, '妖夢（オオカミ）', '集中ショット強化・3個以上でハイパー化', 7),
            (13, '妖夢（カワウソ）', 'スペルカード強化・初期数+1・3個以上でバリア', 8),
            (13, '妖夢（オオワシ）', '拡散ショット強化・3個以上でハイパー化', 9),
        ])
        
        # 東方虹龍洞（14作目 -> game_id=14）
        characters.extend([
            (14, '霊夢', 'アビリティカードシステム対応', 1),
            (14, '魔理沙', 'アビリティカードシステム対応', 2),
            (14, '咲夜', 'アビリティカードシステム対応', 3),
            (14, '早苗', 'アビリティカードシステム対応', 4),
        ])
        
        # 東方獣王園（15作目 -> game_id=15）
        characters.extend([
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
            (15, '日白残無', 'ソンシ様・朱鷺子・最終ボス・強力な弾幕', 19),
        ])
        
        # 東方錦上京（16作目 -> game_id=16）
        characters.extend([
            # 2キャラ×8異変石＝16組み合わせ
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
            (16, '魔理沙（シントイズムウィンド）', '風神録モチーフ・大型前方レーザー', 16),
        ])
        
        return characters
    
    def load_admin_password(self) -> str:
        """secrets/.admin_passwordからパスワードを読み込む"""
        # Docker環境とネイティブ環境両方に対応
        password_paths = [
            Path(__file__).parent.parent.parent / "secrets" / ".admin_password",  # ネイティブ環境
            Path("/app/secrets/.admin_password"),  # Docker環境（マウント想定）
            Path("/secrets/.admin_password"),     # Docker環境（代替パス）
        ]
        
        password_file = None
        for path in password_paths:
            if path.exists():
                password_file = path
                break
        
        if password_file is None:
            print(f"⚠️ パスワードファイルが見つかりません。確認したパス:")
            for path in password_paths:
                print(f"   - {path}")
            print("   デフォルトパスワードを使用します: admin123")
            return "admin123"
            
        try:
            password = password_file.read_text().strip()
            if not password:
                print("⚠️ パスワードファイルが空です。デフォルトパスワードを使用します。")
                return "admin123"
            print(f"🔐 パスワードファイルから読み込み完了: {password_file}")
            return password
        except Exception as e:
            print(f"❌ パスワードファイル読み込みエラー: {e}")
            print("   デフォルトパスワードを使用します: admin123")
            return "admin123"
    
    def insert_admin_user(self):
        """初期adminユーザーを作成する"""
        print("👑 adminユーザーを作成中...")
        
        with self.SessionLocal() as session:
            # 既存のadminユーザーを確認
            existing_admin = session.query(UserModel).filter(
                (UserModel.username == "admin") | (UserModel.is_admin == True)
            ).first()
            
            if existing_admin:
                print(f"ℹ️ adminユーザーが既に存在します: ID={existing_admin.id}, ユーザー名={existing_admin.username}, メール={existing_admin.email}, 管理者={existing_admin.is_admin}")
                return
            
            # adminユーザー情報
            username = "admin"
            email = "admin@touhou-clear-checker.com"
            password = self.load_admin_password()
            
            # パスワードハッシュ化
            password_hasher = PasswordHasher()
            hashed_password = password_hasher.hash_password(password)
            
            # 認証トークン生成
            verification_token = TokenGenerator.generate_verification_token()
            
            # adminユーザー作成
            admin_user = UserModel(
                username=username,
                email=email,
                hashed_password=hashed_password,
                is_active=True,
                is_admin=True,
                email_verified=True,  # adminは認証済みとする
                verification_token=verification_token
            )
            
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)
            
            print(f"✅ adminユーザーが作成されました:")
            print(f"   - ID: {admin_user.id}")
            print(f"   - ユーザー名: {admin_user.username}")
            print(f"   - メール: {admin_user.email}")
            print(f"   - パスワード: {password}")
            print(f"   - 管理者権限: ✅")
            print(f"   - 認証済み: ✅")
        
    def verify_database(self):
        """データベース内容確認"""
        print("🔍 データベース内容を確認中...")
        
        with self.SessionLocal() as session:
            # ゲーム数確認
            games = session.query(GameModel).all()
            print("\n📚 登録済みゲーム:")
            for game in games:
                character_count = session.query(GameCharacterModel).filter(GameCharacterModel.game_id == game.id).count()
                print(f"  {game.id:4.1f}: {game.title} ({character_count}機体)")
            
            # 統計情報
            total_games = len(games)
            total_characters = session.query(GameCharacterModel).count()
            
            print(f"\n📊 統計情報:")
            print(f"  🎮 合計ゲーム数: {total_games}作品")
            print(f"  👥 合計機体数: {total_characters}種類")
            
            # テーブル一覧
            tables = session.execute(text("SHOW TABLES")).fetchall()
            table_names = [table[0] for table in tables]
            print(f"\n🗃️ 作成済みテーブル: {', '.join(table_names)}")
            
    def run_fresh_install(self):
        """完全初期化実行"""
        print("=== 🚀 MySQL データベース完全初期化開始 ===")
        self.drop_tables()
        self.create_tables()
        self.insert_game_data()
        self.insert_character_data()
        self.insert_admin_user()  # adminユーザー作成を追加
        self.verify_database()
        print("\n🎉 MySQL データベース初期化完了！")
        print(f"📡 接続先: {DATABASE_URL}")


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="MySQL対応データベース初期化スクリプト")
    parser.add_argument("--fresh", action="store_true", help="既存テーブルを削除して新規作成")
    parser.add_argument("--games-only", action="store_true", help="ゲームデータのみ追加")
    parser.add_argument("--characters-only", action="store_true", help="キャラクターデータのみ追加")
    parser.add_argument("--admin-only", action="store_true", help="adminユーザーのみ作成")
    parser.add_argument("--verify", action="store_true", help="データベース内容を確認")
    
    args = parser.parse_args()
    
    try:
        initializer = MySQLDatabaseInitializer()
        
        if args.fresh:
            initializer.run_fresh_install()
        elif args.games_only:
            initializer.insert_game_data()
        elif args.characters_only:
            initializer.insert_character_data()
        elif args.admin_only:
            initializer.insert_admin_user()
        elif args.verify:
            initializer.verify_database()
        else:
            # デフォルトは確認のみ
            initializer.verify_database()
            
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())