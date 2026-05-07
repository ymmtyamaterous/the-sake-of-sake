# API 設計書

## 1. 概要

- プロトコル: oRPC over HTTP（RPC エンドポイント `/rpc/*`）
- 認証: better-auth のセッション Cookie
- バリデーション: Zod v4
- エラーレスポンス: oRPC 標準のエラーオブジェクト

---

## 2. プロシージャ一覧

### 2.1 認証（Auth）
better-auth が `/api/auth/*` で自動処理するため、oRPC プロシージャとしての定義は不要。

| エンドポイント | メソッド | 概要 |
|--------------|---------|------|
| `/api/auth/sign-up/email` | POST | メールアドレス登録 |
| `/api/auth/sign-in/email` | POST | メールアドレスログイン |
| `/api/auth/sign-out` | POST | ログアウト |
| `/api/auth/get-session` | GET | 現在のセッション取得 |

---

### 2.2 ヘルスチェック

#### `healthCheck`
- **種別**: publicProcedure
- **概要**: サーバー稼働確認
- **入力**: なし
- **出力**: `"OK"` (string)

---

### 2.3 飲酒記録（Drink Log）

#### `drinkLog.create`
- **種別**: protectedProcedure
- **概要**: 飲酒記録を新規作成する
- **入力**:
  ```ts
  {
    name: string          // お酒の名前 (1-100文字)
    category: DrinkCategory  // カテゴリ (whiskey|beer|wine|sake|cocktail|other)
    rating: number        // 評価 (1-5 の整数)
    drankAt: string       // 飲んだ日 (ISO 8601 date string)
    notes?: string        // メモ・コメント (最大1000文字)
    imageBase64?: string  // 画像 (Base64エンコード, 最大2MB)
  }
  ```
- **出力**: 作成した記録オブジェクト（後述の `DrinkLog` 型）

#### `drinkLog.list`
- **種別**: protectedProcedure
- **概要**: ログインユーザーの飲酒記録一覧を取得する
- **入力**:
  ```ts
  {
    category?: DrinkCategory  // カテゴリでフィルタ
    page?: number             // ページ番号 (デフォルト: 1)
    limit?: number            // 件数上限 (デフォルト: 20, 最大: 100)
  }
  ```
- **出力**:
  ```ts
  {
    items: DrinkLog[]
    total: number
    page: number
    limit: number
  }
  ```

#### `drinkLog.get`
- **種別**: protectedProcedure
- **概要**: 指定 ID の飲酒記録を取得する（本人のみ）
- **入力**:
  ```ts
  { id: string }
  ```
- **出力**: `DrinkLog`

#### `drinkLog.update`
- **種別**: protectedProcedure
- **概要**: 指定 ID の飲酒記録を更新する（本人のみ）
- **入力**:
  ```ts
  {
    id: string
    name?: string
    category?: DrinkCategory
    rating?: number
    drankAt?: string
    notes?: string
    imageBase64?: string
  }
  ```
- **出力**: 更新後の `DrinkLog`

#### `drinkLog.delete`
- **種別**: protectedProcedure
- **概要**: 指定 ID の飲酒記録を削除する（本人のみ）
- **入力**:
  ```ts
  { id: string }
  ```
- **出力**: `{ success: true }`

---

### 2.4 知識ベース（Knowledge）

#### `knowledge.listCategories`
- **種別**: publicProcedure
- **概要**: お酒カテゴリ一覧を取得する
- **入力**: なし
- **出力**: `KnowledgeCategory[]`

#### `knowledge.getCategory`
- **種別**: publicProcedure
- **概要**: カテゴリ詳細（説明・代表銘柄リスト含む）を取得する
- **入力**:
  ```ts
  { slug: DrinkCategory }
  ```
- **出力**: `KnowledgeCategoryDetail`

#### `knowledge.getItem`
- **種別**: publicProcedure
- **概要**: 銘柄・商品の詳細を取得する
- **入力**:
  ```ts
  { id: string }
  ```
- **出力**: `KnowledgeItem`

---

### 2.5 ダッシュボード統計（Stats）

#### `stats.summary`
- **種別**: protectedProcedure
- **概要**: ログインユーザーの統計サマリーを取得する
- **入力**: なし
- **出力**:
  ```ts
  {
    totalLogs: number
    logsThisMonth: number
    categoryBreakdown: { category: DrinkCategory; count: number }[]
    favoriteItems: DrinkLog[]  // rating >= 4 の記録 (最新5件)
  }
  ```

---

## 3. 共通型定義

```ts
type DrinkCategory = "whiskey" | "beer" | "wine" | "sake" | "cocktail" | "other";

type DrinkLog = {
  id: string;
  userId: string;
  name: string;
  category: DrinkCategory;
  rating: number;        // 1-5
  drankAt: string;       // ISO 8601 date
  notes: string | null;
  imageBase64: string | null;
  createdAt: string;
  updatedAt: string;
};

type KnowledgeCategory = {
  slug: DrinkCategory;
  label: string;         // 表示名 (例: "ウイスキー")
  description: string;
  imageUrl: string | null;
};

type KnowledgeCategoryDetail = KnowledgeCategory & {
  fullDescription: string;   // 詳細説明（製造方法・歴史等）
  items: KnowledgeItemSummary[];
};

type KnowledgeItemSummary = {
  id: string;
  name: string;
  origin: string | null;
  imageUrl: string | null;
};

type KnowledgeItem = KnowledgeItemSummary & {
  categorySlug: DrinkCategory;
  description: string;
  alcoholPercent: number | null;
  tastingNotes: string | null;
  servingStyle: string | null;   // 飲み方の提案
};
```

---

## 4. エラーコード

| コード | HTTP ステータス相当 | 説明 |
|--------|-------------------|------|
| `UNAUTHORIZED` | 401 | 認証が必要なプロシージャで未認証 |
| `FORBIDDEN` | 403 | 他ユーザーのリソースへのアクセス |
| `NOT_FOUND` | 404 | 指定リソースが存在しない |
| `BAD_REQUEST` | 400 | 入力バリデーションエラー |
| `INTERNAL_SERVER_ERROR` | 500 | 予期しないサーバーエラー |

---

## 5. ルーターファイル構成

```
packages/api/src/routers/
├── index.ts         # appRouter: 全ルーターを統合
├── drinkLog.ts      # drinkLog プロシージャ群
├── knowledge.ts     # knowledge プロシージャ群
└── stats.ts         # stats プロシージャ群
```
