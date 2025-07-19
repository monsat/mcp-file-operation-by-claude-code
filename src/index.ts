#!/usr/bin/env node

import { FileOperationServer } from './server.js'

/**
 * ファイル操作MCPサーバーのメインエントリーポイント
 */
async function main() {
  const server = new FileOperationServer()
  await server.run()
}

// エラーハンドリング
main().catch((error) => {
  console.error('Server startup failed:', error)
  process.exit(1)
})

// Export all types and utilities for programmatic use
export * from './types/file-tools'
export * from './utils/security'
export * from './utils/validation'
export * from './handlers/file-operations'
export { FileOperationServer } from './server'
