# File Operations MCP Server

ファイル操作を安全に実行できるMCP（Model Context Protocol）サーバーです。Claude Desktop等のAIクライアントから使用できます。

## 機能

- **read_file**: ファイルの内容を読み取り
- **write_file**: ファイルへの書き込み（親ディレクトリ自動作成）
- **list_files**: ディレクトリ一覧取得（再帰オプション対応）
- **delete_file**: ファイル削除
- **create_directory**: ディレクトリ作成（再帰オプション対応）

## セキュリティ機能

- パストラバーサル攻撃の防止
- 許可されたディレクトリ内のみでの操作
- 危険な拡張子のブロック
- 詳細なエラーハンドリング

## インストールと実行

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. テスト実行

```bash
npm test
```

## Claude Desktopでの使用方法

### 1. Claude Desktop設定ファイルの編集

Claude Desktopの設定ファイルを編集します：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 2. 設定内容

```json
{
  "mcpServers": {
    "file-operations": {
      "command": "node",
      "args": [
        "/path/to/your/test-mcp/build/src/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**重要**: `/path/to/your/test-mcp/`を実際のプロジェクトパスに変更してください。

### 3. Claude Desktopの再起動

設定ファイルを保存後、Claude Desktopを再起動してください。

## 使用例

Claude Desktopで以下のような操作が可能になります：

### ファイル読み取り

```
プロジェクトディレクトリの package.json を読み取って内容を教えて
```

### ファイル書き込み

```
test.txt というファイルに "Hello, World!" という内容を書き込んで
```

### ディレクトリ一覧

```
現在のディレクトリにあるファイル一覧を表示して
```

### ディレクトリ作成

```
"新しいフォルダ" というディレクトリを作成して
```

## 開発

### スクリプト

- `npm run build`: TypeScriptをビルド
- `npm run dev`: 開発モード（ウォッチ）
- `npm test`: テスト実行
- `npm run lint`: ESLintでコードチェック
- `npm run typecheck`: TypeScript型チェック

### プロジェクト構造

```
src/
├── handlers/           # ファイル操作ハンドラー
│   ├── file-operations.ts
│   └── file-operations.test.ts
├── types/             # TypeScript型定義
│   └── file-tools.ts
├── utils/             # ユーティリティ
│   ├── security.ts
│   ├── security.test.ts
│   ├── validation.ts
│   └── validation.test.ts
├── server.ts          # MCPサーバー実装
└── index.ts           # メインエントリーポイント
```

## トラブルシューティング

### サーバーが起動しない

1. ビルドが正常に完了しているか確認
2. Node.jsのバージョンが適切か確認（推奨: v18以上）
3. パスが正しく設定されているか確認

### Claude Desktopで認識されない

1. 設定ファイルのJSONが正しい形式か確認
2. パスが絶対パスで指定されているか確認
3. Claude Desktopを完全に再起動

### 権限エラー

1. 操作対象のディレクトリに適切な権限があるか確認
2. セキュリティ設定で許可されたディレクトリ内での操作か確認

## 技術詳細

- **TypeScript**: 型安全な開発
- **Vitest**: 高速なテストフレームワーク
- **ESLint**: コード品質の維持
- **TDD**: テスト駆動開発で堅牢な実装
- **MCP SDK**: Model Context Protocol の公式SDK使用

## ライセンス

ISC