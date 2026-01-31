# API仕様書: 心の距離マップ

## 1. 概要

本ドキュメントはバックエンドAPI（Azure Functions）の仕様を定義します。

### 1.1 ベースURL

```
Production: https://<function-app-name>.azurewebsites.net/api
Development: http://localhost:7071/api
```

### 1.2 認証

すべてのAPIエンドポイント（`/health`を除く）はAzure AD B2Cから発行されたJWTトークンを要求します。

**リクエストヘッダー**:
```
Authorization: Bearer <JWT_TOKEN>
```

## 2. エンドポイント

### 2.1 ヘルスチェック

#### `GET /health`

サービスの稼働状態を確認

**認証**: 不要

**レスポンス**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T09:53:00Z",
  "version": "1.0.0"
}
```

---

### 2.2 ユーザー管理

#### `POST /users/initialize`

新規ユーザーの初期化（初回ログイン時）

**認証**: 必要

**リクエストボディ**:
```json
{
  "facebookUserId": "optional-facebook-user-id",
  "locale": "ja-JP"
}
```

**レスポンス**:
```json
{
  "userId": "uuid-v4",
  "createdAt": "2026-01-31T09:53:00Z",
  "preferences": {
    "maxNodes": 12,
    "updateFrequency": "daily",
    "displayMode": "minimal"
  }
}
```

---

#### `GET /users/me`

現在のユーザー情報取得

**認証**: 必要

**レスポンス**:
```json
{
  "userId": "uuid-v4",
  "createdAt": "2026-01-31T09:53:00Z",
  "lastLoginAt": "2026-01-31T09:53:00Z",
  "facebookConnected": true,
  "preferences": {
    "maxNodes": 12,
    "updateFrequency": "daily",
    "displayMode": "minimal"
  }
}
```

---

#### `PATCH /users/me/preferences`

ユーザー設定の更新

**認証**: 必要

**リクエストボディ**:
```json
{
  "maxNodes": 9,
  "updateFrequency": "manual",
  "displayMode": "label_emphasis"
}
```

**レスポンス**:
```json
{
  "userId": "uuid-v4",
  "preferences": {
    "maxNodes": 9,
    "updateFrequency": "manual",
    "displayMode": "label_emphasis"
  },
  "updatedAt": "2026-01-31T09:53:00Z"
}
```

---

#### `DELETE /users/me`

ユーザーアカウント削除（GDPR対応）

**認証**: 必要

**レスポンス**:
```json
{
  "message": "User data deleted successfully",
  "deletedAt": "2026-01-31T09:53:00Z"
}
```

---

### 2.3 Facebook連携

#### `POST /facebook/connect`

Facebook連携の開始

**認証**: 必要

**リクエストボディ**:
```json
{
  "accessToken": "facebook-access-token"
}
```

**レスポンス**:
```json
{
  "connected": true,
  "facebookUserId": "facebook-user-id",
  "connectedAt": "2026-01-31T09:53:00Z"
}
```

---

#### `POST /facebook/disconnect`

Facebook連携の解除

**認証**: 必要

**レスポンス**:
```json
{
  "disconnected": true,
  "disconnectedAt": "2026-01-31T09:53:00Z"
}
```

---

#### `GET /facebook/aggregate-signals`

Facebook集計データの取得

**認証**: 必要

**クエリパラメータ**:
- `windowDays`: データ取得期間（デフォルト: 14）

**レスポンス**:
```json
{
  "userId": "uuid-v4",
  "windowDays": 14,
  "signals": {
    "activityVolume": "moderate",
    "reactionCount": "medium",
    "commentCount": "low",
    "postCount": "medium"
  },
  "collectedAt": "2026-01-31T09:53:00Z",
  "validUntil": "2026-02-01T09:53:00Z"
}
```

> **注**: 個人名や投稿内容は含まれません。集計値のみを抽象化したレベルで返します。

---

### 2.4 マップ生成

#### `POST /map/generate`

人間関係マップの生成

**認証**: 必要

**リクエストボディ**:
```json
{
  "nodes": [
    {
      "id": "node-1",
      "label": "家族",
      "customLabel": "家族",
      "userHint": "near"
    },
    {
      "id": "node-2",
      "label": "友達",
      "customLabel": "親友A",
      "userHint": null
    }
  ],
  "preferences": {
    "maxNodes": 12,
    "jitterEnabled": true
  }
}
```

**レスポンス**:
```json
{
  "mapId": "uuid-v4",
  "generatedAt": "2026-01-31T09:53:00Z",
  "nodes": [
    {
      "id": "node-1",
      "label": "家族",
      "customLabel": "家族",
      "position": {
        "x": 120,
        "y": 80,
        "distance": "near"
      },
      "color": "#warm-tone",
      "observationText": "最近、目にすることが多かった。考えが残りやすい。"
    },
    {
      "id": "node-2",
      "label": "友達",
      "customLabel": "親友A",
      "position": {
        "x": 200,
        "y": 150,
        "distance": "mid"
      },
      "color": "#neutral-tone",
      "observationText": "反応は少なめ。でも存在感はある。"
    }
  ],
  "basis": {
    "facebookSignals": true,
    "userHints": true,
    "randomJitter": true
  }
}
```

---

#### `GET /map/observation-text`

観測文のテンプレート取得（オフライン生成用）

**認証**: 必要

**レスポンス**:
```json
{
  "templates": {
    "near": [
      "最近、目にすることが多かった",
      "考えが残りやすい",
      "無言でも違和感はない"
    ],
    "mid": [
      "反応は少なめ",
      "でも存在感はある",
      "距離は安定している"
    ],
    "far": [
      "会話は生まれていない",
      "少し気を使う",
      "存在感はある"
    ]
  }
}
```

---

### 2.5 データ管理

#### `DELETE /data/all`

全ローカル・サーバーデータの削除

**認証**: 必要

**レスポンス**:
```json
{
  "message": "All user data deleted",
  "deletedAt": "2026-01-31T09:53:00Z"
}
```

---

## 3. エラーレスポンス

### 3.1 標準エラーフォーマット

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message (ja-JP)",
    "details": {}
  },
  "timestamp": "2026-01-31T09:53:00Z"
}
```

### 3.2 HTTPステータスコード

| コード | 説明 | 例 |
|-------|-----|---|
| 200 | 成功 | データ取得成功 |
| 201 | 作成成功 | ユーザー初期化成功 |
| 400 | 不正なリクエスト | 必須パラメータ不足 |
| 401 | 認証エラー | JWTトークンなし・無効 |
| 403 | 権限エラー | 他ユーザーのデータへのアクセス |
| 404 | リソース未発見 | 存在しないユーザーID |
| 429 | レート制限 | API呼び出し過多 |
| 500 | サーバーエラー | 内部エラー |
| 503 | サービス利用不可 | Facebook API障害 |

### 3.3 エラーコード一覧

| コード | 意味 |
|-------|-----|
| `AUTH_INVALID_TOKEN` | 無効なJWTトークン |
| `AUTH_EXPIRED_TOKEN` | トークン期限切れ |
| `USER_NOT_FOUND` | ユーザーが存在しない |
| `FACEBOOK_CONNECTION_FAILED` | Facebook連携失敗 |
| `FACEBOOK_API_ERROR` | Facebook API呼び出しエラー |
| `VALIDATION_ERROR` | 入力データ検証エラー |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 |
| `INTERNAL_ERROR` | 内部サーバーエラー |

---

## 4. レート制限

### 4.1 制限値

| エンドポイント | 制限 |
|-------------|-----|
| `/facebook/aggregate-signals` | 10回/時間/ユーザー |
| `/map/generate` | 100回/日/ユーザー |
| その他 | 1000回/日/ユーザー |

### 4.2 レート制限ヘッダー

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706702400
```

---

## 5. データモデル

### 5.1 User

```typescript
interface User {
  userId: string;           // UUID v4
  azureAdOid: string;       // Azure AD B2C Object ID
  facebookUserId?: string;  // Facebook User ID (optional)
  locale: string;           // ja-JP
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

interface UserPreferences {
  maxNodes: 6 | 9 | 12;
  updateFrequency: 'startup' | 'daily' | 'manual';
  displayMode: 'minimal' | 'label_emphasis';
}
```

### 5.2 AggregateSignal

```typescript
interface AggregateSignal {
  userId: string;
  windowDays: number;
  signals: {
    activityVolume: 'low' | 'moderate' | 'high';
    reactionCount: 'low' | 'medium' | 'high';
    commentCount: 'low' | 'medium' | 'high';
    postCount: 'low' | 'medium' | 'high';
  };
  collectedAt: Date;
  validUntil: Date;        // collectedAt + 24h
}
```

### 5.3 MapNode

```typescript
interface MapNode {
  id: string;
  label: string;            // デフォルトラベル
  customLabel?: string;     // ユーザーカスタマイズ
  position: {
    x: number;
    y: number;
    distance: 'near' | 'mid' | 'far';
  };
  color: string;
  observationText: string;  // 観測文
}
```

---

## 6. セキュリティ

### 6.1 JWT検証

すべての保護されたエンドポイントで以下を検証:

1. トークン署名の正当性
2. 発行者（Azure AD B2C）
3. 有効期限
4. Audience

### 6.2 CORS設定

```javascript
{
  origin: [
    'https://<static-web-app>.azurestaticapps.net',
    'http://localhost:5173' // 開発環境
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

**作成日**: 2026-01-31  
**バージョン**: 1.0
