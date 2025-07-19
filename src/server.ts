import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import {
  readFile,
  writeFile,
  listFiles,
  deleteFile,
  createDirectory,
} from './handlers/file-operations.js'

/**
 * ファイル操作MCPサーバー
 * Claude等のAIクライアントからファイル操作を安全に実行できるサーバー
 */
class FileOperationServer {
  private server: Server

  constructor() {
    this.server = new Server(
      {
        name: 'file-operations-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupToolHandlers()
    this.setupErrorHandling()
  }

  /**
   * ツールハンドラーの設定
   */
  private setupToolHandlers(): void {
    // 利用可能なツール一覧を返す
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'read_file',
            description: 'ファイルの内容を読み取ります',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '読み取るファイルのパス',
                },
                encoding: {
                  type: 'string',
                  description: 'ファイルエンコーディング（デフォルト: utf8）',
                  default: 'utf8',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'write_file',
            description: 'ファイルに内容を書き込みます（親ディレクトリが存在しない場合は自動作成）',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '書き込み先ファイルのパス',
                },
                content: {
                  type: 'string',
                  description: '書き込む内容',
                },
                encoding: {
                  type: 'string',
                  description: 'ファイルエンコーディング（デフォルト: utf8）',
                  default: 'utf8',
                },
              },
              required: ['path', 'content'],
            },
          },
          {
            name: 'list_files',
            description: 'ディレクトリ内のファイル・ディレクトリ一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '一覧を取得するディレクトリのパス',
                },
                recursive: {
                  type: 'boolean',
                  description: 'サブディレクトリも再帰的に取得するか（デフォルト: false）',
                  default: false,
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'delete_file',
            description: 'ファイルを削除します',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '削除するファイルのパス',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'create_directory',
            description: 'ディレクトリを作成します',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '作成するディレクトリのパス',
                },
                recursive: {
                  type: 'boolean',
                  description: '親ディレクトリも含めて作成するか（デフォルト: false）',
                  default: false,
                },
              },
              required: ['path'],
            },
          },
        ],
      }
    })

    // ツール実行ハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'read_file':
          return await this.handleTool('read_file', readFile, args)

        case 'write_file':
          return await this.handleTool('write_file', writeFile, args)

        case 'list_files':
          return await this.handleTool('list_files', listFiles, args)

        case 'delete_file':
          return await this.handleTool('delete_file', deleteFile, args)

        case 'create_directory':
          return await this.handleTool('create_directory', createDirectory, args)

        default:
          throw new Error(`未知のツール: ${name}`)
      }
    })
  }

  /**
   * ツール実行の共通処理
   */
  private async handleTool(
    toolName: string,
    handler: (params: unknown) => Promise<{ success: boolean; message?: string; data?: unknown }>,
    args: unknown,
  ) {
    try {
      const result = await handler(args)

      if (result.success) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                data: result.data,
                message: result.message,
              }, null, 2),
            },
          ],
        }
      } else {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: result.message,
              }, null, 2),
            },
          ],
          isError: true,
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
      
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: `${toolName}実行エラー: ${errorMessage}`,
            }, null, 2),
          },
        ],
        isError: true,
      }
    }
  }

  /**
   * エラーハンドリングの設定
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error)
    }

    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  /**
   * サーバー開始
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('File Operations MCP Server started on stdio')
  }
}

export { FileOperationServer }