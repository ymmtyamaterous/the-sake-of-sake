# データベース設計書

## 1. 概要

- DBMS: SQLite (libsql)
- ORM: Drizzle ORM
- 文字コード: UTF-8
- タイムスタンプ: `integer` (mode: `timestamp_ms` = Unix ミリ秒)

---

## 2. テーブル一覧

| テーブル名 | 概要 |
|-----------|------|
| `user` | ユーザー（better-auth 管理） |
| `session` | セッション（better-auth 管理） |
| `account` | OAuth/パスワードアカウント（better-auth 管理） |
| `verification` | メール認証トークン（better-auth 管理） |
| `drink_log` | ユーザーの飲酒記録 |
| `knowledge_category` | お酒カテゴリ知識（静的マスタ） |
| `knowledge_item` | 銘柄・商品知識（静的マスタ） |

---

## 3. テーブル詳細

### 3.1 `user`（better-auth 管理）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | ユーザー ID（CUID） |
| `name` | TEXT | NOT NULL | 表示名 |
| `email` | TEXT | NOT NULL, UNIQUE | メールアドレス |
| `email_verified` | INTEGER (boolean) | NOT NULL, DEFAULT 0 | メール認証済みフラグ |
| `image` | TEXT | NULL | プロフィール画像 URL |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

### 3.2 `session`（better-auth 管理）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | セッション ID |
| `expires_at` | INTEGER (timestamp_ms) | NOT NULL | セッション有効期限 |
| `token` | TEXT | NOT NULL, UNIQUE | セッショントークン |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |
| `ip_address` | TEXT | NULL | クライアント IP |
| `user_agent` | TEXT | NULL | ユーザーエージェント |
| `user_id` | TEXT | NOT NULL, FK→user.id | ユーザー ID |

**インデックス**: `session_userId_idx` on `user_id`

### 3.3 `account`（better-auth 管理）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | アカウント ID |
| `account_id` | TEXT | NOT NULL | プロバイダー側のアカウント ID |
| `provider_id` | TEXT | NOT NULL | プロバイダー名 (例: `credential`) |
| `user_id` | TEXT | NOT NULL, FK→user.id | ユーザー ID |
| `access_token` | TEXT | NULL | アクセストークン |
| `refresh_token` | TEXT | NULL | リフレッシュトークン |
| `id_token` | TEXT | NULL | ID トークン |
| `access_token_expires_at` | INTEGER (timestamp_ms) | NULL | アクセストークン有効期限 |
| `refresh_token_expires_at` | INTEGER (timestamp_ms) | NULL | リフレッシュトークン有効期限 |
| `scope` | TEXT | NULL | スコープ |
| `password` | TEXT | NULL | ハッシュ化パスワード（credential 認証用） |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

### 3.4 `verification`（better-auth 管理）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | 認証トークン ID |
| `identifier` | TEXT | NOT NULL | 識別子（メールアドレス等） |
| `value` | TEXT | NOT NULL | トークン値 |
| `expires_at` | INTEGER (timestamp_ms) | NOT NULL | 有効期限 |
| `created_at` | INTEGER (timestamp_ms) | NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NULL | 更新日時 |

---

### 3.5 `drink_log`（アプリケーション独自）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | 記録 ID（CUID） |
| `user_id` | TEXT | NOT NULL, FK→user.id CASCADE | 作成ユーザー ID |
| `name` | TEXT | NOT NULL | お酒の名前 (最大100文字) |
| `category` | TEXT | NOT NULL | カテゴリ (`whiskey`/`beer`/`wine`/`sake`/`cocktail`/`other`) |
| `rating` | INTEGER | NOT NULL | 評価（1〜5） |
| `drank_at` | TEXT | NOT NULL | 飲んだ日（`YYYY-MM-DD` 形式） |
| `notes` | TEXT | NULL | コメント・メモ（最大1000文字） |
| `image_base64` | TEXT | NULL | 画像データ（Base64、最大2MB） |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

**インデックス**:
- `drink_log_userId_idx` on `user_id`
- `drink_log_category_idx` on `category`
- `drink_log_drankAt_idx` on `drank_at`

**制約**:
- `rating` は CHECK 制約で 1〜5 の整数に限定

---

### 3.6 `knowledge_category`（静的マスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `slug` | TEXT | PK | カテゴリスラッグ (`whiskey` 等) |
| `label` | TEXT | NOT NULL | 表示名（例: `ウイスキー`） |
| `description` | TEXT | NOT NULL | 短い説明（一覧表示用） |
| `full_description` | TEXT | NOT NULL | 詳細説明（製造方法・歴史等） |
| `image_url` | TEXT | NULL | カテゴリ代表画像 URL |

---

### 3.7 `knowledge_item`（静的マスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | 銘柄 ID（CUID） |
| `category_slug` | TEXT | NOT NULL, FK→knowledge_category.slug | カテゴリ |
| `name` | TEXT | NOT NULL | 銘柄名 |
| `origin` | TEXT | NULL | 産地・原産国 |
| `description` | TEXT | NOT NULL | 説明文 |
| `alcohol_percent` | REAL | NULL | アルコール度数（%） |
| `tasting_notes` | TEXT | NULL | テイスティングノート |
| `serving_style` | TEXT | NULL | 推奨する飲み方 |
| `image_url` | TEXT | NULL | 画像 URL |

**インデックス**: `knowledge_item_categorySlug_idx` on `category_slug`

---

## 4. ER 図

```
user ──────────────────────────────────────────────┐
│ id (PK)                                           │
│ name                                              │
│ email                                             │
│                                                   │
├─── session (user_id FK)                          │
├─── account (user_id FK)                          │
└─── drink_log (user_id FK)                        │
     │ id (PK)                                      │
     │ user_id ─────────────────────────────────────┘
     │ name
     │ category
     │ rating
     │ drank_at
     │ notes
     └─ image_base64

knowledge_category ──────────────────────────────────
│ slug (PK)                                          │
│ label                                              │
│                                                    │
└─── knowledge_item (category_slug FK)              │
     │ id (PK)                                       │
     └─ category_slug ────────────────────────────────┘
```

---

## 5. シードデータ（knowledge テーブル）

アプリ起動時に以下のカテゴリ・銘柄の初期データを投入する。

### カテゴリ
| slug | label |
|------|-------|
| `whiskey` | ウイスキー |
| `beer` | ビール |
| `wine` | ワイン |
| `sake` | 日本酒 |
| `cocktail` | カクテル |
| `other` | その他 |

### 代表的な銘柄（例：各カテゴリ5件程度）
ウイスキー: 山崎, 竹鶴, マッカラン, グレンフィディック, バランタイン 等
ビール: ハートランド, 一番搾り, エビス, よなよなエール, 白穂乃香 等
ワイン: シャトー・マルゴー（赤）, モンラッシェ（白）, DOM ペリニョン（スパークリング）等
日本酒: 獺祭, 久保田, 八海山, 浦霞, 新政 等
カクテル: モスコミュール, ジントニック, ネグローニ, マルガリータ, ダイキリ 等

---

## 6. マイグレーション方針

- スキーマ変更は `drizzle-kit generate` でマイグレーションファイルを自動生成する
- サーバー起動時に `drizzle-kit migrate` 相当の処理を自動実行する
- シードデータは `INSERT OR IGNORE` で重複挿入を防ぐ
