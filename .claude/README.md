# 設計書・ドキュメントマップ

## ディレクトリ構成

```
.claude/
├── README.md                           # このファイル
├── 00_project/                         # プロジェクト概要
│   └── 01_concept_requirements.md      # コンセプト・要件定義
├── 01_development_docs/                # 開発・設計資料
│   ├── 01_architecture_design.md       # システムアーキテクチャ
│   ├── 02_database_design.md           # データベース設計
│   ├── 03_api_design.md                # API設計
│   ├── 04_frontend_architecture.md     # フロントエンド設計
│   ├── 05_design_principles.md         # 設計原則
│   ├── 06_special_clear_conditions.md  # 特殊クリア条件
│   ├── 07_testing_strategy.md          # テスト戦略
│   ├── 08_security_design.md           # セキュリティ設計
│   ├── 09_email_verification_dev_guide.md # メール認証開発ガイド
│   ├── 10_mysql_migration_guide.md     # MySQL移行ガイド
│   └── 11_constants_management_guide.md # 定数管理ガイドライン
├── 02_deployment_docs/                 # デプロイメント・運用
│   ├── 01_mysql_setup.md               # MySQL環境設定
│   └── 02_security_setup.md            # セキュリティ設定
├── 03_operational_docs/                # 運用・保守
└── 99_others/                          # その他
    └── 01_character_data_research.md   # 機体データ調査
```

## ドキュメント分類

### 📋 プロジェクト概要
- **目的**: プロジェクトの基本コンセプト・要件
- **対象**: プロジェクト参加者全員
- **場所**: `00_project/`

### ⚙️ 開発・設計資料
- **目的**: システム設計・開発手法・技術仕様
- **対象**: 開発者・アーキテクト
- **場所**: `01_development_docs/`

### 🚀 デプロイメント・運用
- **目的**: 環境構築・セキュリティ・運用手順
- **対象**: DevOps・インフラエンジニア
- **場所**: `02_deployment_docs/`

### 🔧 運用・保守
- **目的**: 日常運用・障害対応・保守手順
- **対象**: 運用チーム・サポート
- **場所**: `03_operational_docs/`

### 📚 その他
- **目的**: 調査資料・一時的な資料
- **対象**: 参考資料
- **場所**: `99_others/`

## 主要ドキュメント一覧

### 🎯 開発開始時に読むべきドキュメント
1. [プロジェクト概要](./00_project/01_concept_requirements.md)
2. [システムアーキテクチャ](./01_development_docs/01_architecture_design.md)
3. [設計原則](./01_development_docs/05_design_principles.md)
4. [セキュリティ設定](./02_deployment_docs/02_security_setup.md)

### 🛠️ 環境構築時に読むべきドキュメント
1. [MySQL環境設定](./02_deployment_docs/01_mysql_setup.md)
2. [MySQL移行ガイド](./01_development_docs/10_mysql_migration_guide.md)
3. [セキュリティ設定](./02_deployment_docs/02_security_setup.md)

### 📊 データベース関連
1. [データベース設計](./01_development_docs/02_database_design.md)
2. [MySQL移行ガイド](./01_development_docs/10_mysql_migration_guide.md)
3. [特殊クリア条件](./01_development_docs/06_special_clear_conditions.md)

### 🔒 セキュリティ関連
1. [セキュリティ設計](./01_development_docs/08_security_design.md)
2. [セキュリティ設定](./02_deployment_docs/02_security_setup.md)
3. [メール認証開発ガイド](./01_development_docs/09_email_verification_dev_guide.md)

### 🧪 テスト関連
1. [テスト戦略](./01_development_docs/07_testing_strategy.md)
2. [API設計](./01_development_docs/03_api_design.md)

## 更新履歴

### 2025年10月4日
- **マジックナンバー完全排除**: プロジェクト全体のマジックナンバーを定数化により排除
- **新規定数ファイル作成**: セキュリティ・バリデーション・ネットワーク設定の定数ファイル追加
- **設計書更新**: アーキテクチャ設計書・設計原則文書の定数管理セクション強化
- **定数管理ガイドライン新規作成**: 包括的な定数管理ドキュメントを追加

### 2025年9月30日
- **ゲームID設計ルール明確化**: gameIDは連番（1-16）、series_numberは作品番号（6.0-20.0）の分離ルールを確立
- **データベース初期化修正**: フロントエンド期待値（連番ID）に合わせて初期化スクリプト修正
- **紺珠伝クリア記録問題解決**: gameID不整合によるモード別クリア記録登録問題を解決
- **ドキュメント更新**: データベース設計書・CLAUDE.mdにgameID設計ルールを追加

### 2025年9月29日
- **adminユーザー自動作成対応**: MySQL初期化スクリプトでadmin自動作成機能追加
- **ゲームデータ正規化**: ソート順序（series_number順）・ゲーム種別の正確な分類
- **フロントエンド修正**: ログイン認証形式・ゲーム表示順序・ラベル表記の修正
- **データベース初期化改善**: 114機体データ・adminユーザー・正確な年度・ゲーム種別対応

### 2025年9月27日
- **MySQL対応完了**: MySQL移行ガイド・セキュリティ設定を追加
- **ドキュメント構造整理**: docs/ → .claude/02_deployment_docs/ に統合
- **セキュリティ強化**: 環境変数ファイル分離・パスワード管理改善

### 主要な改善内容
1. **MySQL環境対応**: SQLite/MySQL切り替え対応
2. **セキュリティ設定**: パスワード管理・環境変数分離
3. **Docker環境**: 開発・本番環境の明確な分離
4. **ドキュメント統合**: 散在していた設定ドキュメントの一元化

## 貢献ガイドライン

### ドキュメント更新時のルール
1. **適切なディレクトリ配置**: 目的に応じた分類
2. **ファイル命名規則**: `01_`, `02_` 等の連番 + 内容を表す名前
3. **相互リンク**: 関連ドキュメント間の適切なリンク設定
4. **更新履歴**: 重要な変更は README.md に記録

### 新規ドキュメント作成時
1. **重複確認**: 既存ドキュメントとの重複チェック
2. **適切な分類**: ディレクトリ構成に従った配置
3. **リンク更新**: README.md・関連ドキュメントのリンク追加

この構造により、プロジェクトの全ドキュメントが体系的に管理され、必要な情報に素早くアクセスできます。