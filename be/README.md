# バックエンドドキュメント

## 目次
- [バックエンドドキュメント](#バックエンドドキュメント)
  - [目次](#目次)
  - [1. 概要](#1-概要)
  - [2. 必要なバージョン](#2-必要なバージョン)
  - [3. セットアップガイド](#3-セットアップガイド)
    - [3.1 初期セットアップ（初回のみ実行）](#31-初期セットアップ初回のみ実行)
    - [3.2 2回目以降の実行](#32-2回目以降の実行)
    - [3.3 コンテナの停止](#33-コンテナの停止)
  - [4. Railsのキャッシュの有効化と管理](#4-railsのキャッシュの有効化と管理)
    - [4.1 キャッシュの有効化/無効化](#41-キャッシュの有効化無効化)

---

## 1. 概要
これはTeam3のバックエンドRailsアプリケーションです

## 2. 必要なバージョン
- **Ruby**: 3.4.3
- **Rails**: 8.0.2
- **Bundler**: 2.7.1
- **Mysql**: 8

---

## 3. セットアップガイド

### 3.1 初期セットアップ（初回のみ実行）
メインフォルダから以下のコマンドを実行してください：

```bash
cd be
cp config/database.yml.example config/database.yml
cp .env.example .env
docker compose up -d
docker compose exec web bash # Webコンテナ（Railsアプリ）に入る
bundle install
rails db:create db:migrate db:seed
rails s -b 0
```

1. Dockerイメージとコンテナを作成します。
2. `.env`ファイルとデータベース設定ファイルを作成します：
   ```bash
   cp config/database.yml.example config/database.yml
   cp .env.example .env
   ```
3. データベースを作成します：
   ```bash
   rails db:create
   ```
4. Railsサーバーを起動します：
   ```bash
   rails s -b 0
   ```

- [http://localhost:3001/](http://localhost:3001/) にアクセスしてください。Railsのページが表示されればセットアップは成功です。

---

### 3.2 2回目以降の実行
2回目以降は以下のコマンドを使用してください：

```bash
cd be
docker compose up -d
docker compose exec web bash
rails s -b 0
```

---

### 3.3 コンテナの停止
コンテナの停止時は以下のコマンドを使用してください：
```bash
docker compose stop
```

---

## 4. Railsのキャッシュの有効化と管理

### 4.1 キャッシュの有効化/無効化
キャッシュを有効化または無効化するには、以下のコマンドを実行してください：
- 設定ガイド: https://zenn.dev/redheadchloe/articles/631a8fa58ed7b9
```bash
rails dev:cache
```