import fs from 'fs/promises'
import path from 'path'
import {
  FileOperationResult,
  FileInfo,
} from '../types/file-tools'
import {
  isPathSafe,
} from '../utils/security'
import {
  validateReadFileParams,
  validateWriteFileParams,
  validateListFilesParams,
  validateDeleteFileParams,
  validateCreateDirectoryParams,
} from '../utils/validation'

export const readFile = async(params: unknown): Promise<FileOperationResult> => {
  try {
    // パラメータの検証
    if (!validateReadFileParams(params)) {
      return {
        success: false,
        message: '無効なパラメータです',
      }
    }

    // パスの安全性チェック
    if (!isPathSafe(params.path)) {
      return {
        success: false,
        message: '安全でないパスです',
      }
    }

    // ファイル読み取り
    const content = await fs.readFile(params.path, 'utf8')
    return {
      success: true,
      data: content,
    }
  } catch(error) {
    const errorCode = (error as { code?: string }).code

    if (errorCode === 'ENOENT') {
      return {
        success: false,
        message: 'ファイルが見つかりません',
      }
    }

    if (errorCode === 'EACCES') {
      return {
        success: false,
        message: 'ファイルへのアクセス権限がありません',
      }
    }

    return {
      success: false,
      message: `ファイル読み取りエラー: ${(error as Error).message}`,
    }
  }
}

export const writeFile = async(params: unknown): Promise<FileOperationResult> => {
  try {
    // パラメータの検証
    if (!validateWriteFileParams(params)) {
      return {
        success: false,
        message: '無効なパラメータです',
      }
    }

    // パスの安全性チェック
    if (!isPathSafe(params.path)) {
      return {
        success: false,
        message: '安全でないパスです',
      }
    }

    // 親ディレクトリを作成
    const dir = path.dirname(params.path)
    await fs.mkdir(dir, { recursive: true })

    // ファイル書き込み
    await fs.writeFile(params.path, params.content, 'utf8')
    return {
      success: true,
      message: 'ファイルを正常に書き込みました',
    }
  } catch(error) {
    const errorCode = (error as { code?: string }).code

    if (errorCode === 'EACCES') {
      return {
        success: false,
        message: 'ファイルへの書き込み権限がありません',
      }
    }

    if (errorCode === 'ENOSPC') {
      return {
        success: false,
        message: 'ディスク容量が不足しています',
      }
    }

    return {
      success: false,
      message: `ファイル書き込みエラー: ${(error as Error).message}`,
    }
  }
}

export const listFiles = async(params: unknown): Promise<FileOperationResult> => {
  try {
    // パラメータの検証
    if (!validateListFilesParams(params)) {
      return {
        success: false,
        message: '無効なパラメータです',
      }
    }

    // パスの安全性チェック
    if (!isPathSafe(params.path)) {
      return {
        success: false,
        message: '安全でないパスです',
      }
    }

    const files: FileInfo[] = []

    const processDirectory = async(dirPath: string, recursive = false): Promise<void> => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        try {
          const stats = await fs.stat(fullPath)

          const fileInfo: FileInfo = {
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entry.isFile() ? stats.size : undefined,
            lastModified: stats.mtime,
          }

          files.push(fileInfo)

          if (recursive && entry.isDirectory()) {
            await processDirectory(fullPath, true)
          }
        } catch {
          // 個別ファイルのエラーはスキップして続行（権限エラーなど）
          // エラーは静かに処理し、処理可能なファイルのみを含める
        }
      }
    }

    // ディレクトリ処理実行
    await processDirectory(params.path, params.recursive)
    return {
      success: true,
      data: files,
    }
  } catch(error) {
    const errorCode = (error as { code?: string }).code

    if (errorCode === 'ENOENT') {
      return {
        success: false,
        message: 'ディレクトリが見つかりません',
      }
    }

    if (errorCode === 'EACCES') {
      return {
        success: false,
        message: 'ディレクトリへのアクセス権限がありません',
      }
    }

    return {
      success: false,
      message: `ディレクトリ一覧取得エラー: ${(error as Error).message}`,
    }
  }
}

export const deleteFile = async(params: unknown): Promise<FileOperationResult> => {
  try {
    // パラメータの検証
    if (!validateDeleteFileParams(params)) {
      return {
        success: false,
        message: '無効なパラメータです',
      }
    }

    // パスの安全性チェック
    if (!isPathSafe(params.path)) {
      return {
        success: false,
        message: '安全でないパスです',
      }
    }

    // ファイル削除
    await fs.unlink(params.path)
    return {
      success: true,
      message: 'ファイルを正常に削除しました',
    }
  } catch(error) {
    const errorCode = (error as { code?: string }).code

    if (errorCode === 'ENOENT') {
      return {
        success: false,
        message: 'ファイルが見つかりません',
      }
    }

    if (errorCode === 'EACCES') {
      return {
        success: false,
        message: 'ファイルの削除権限がありません',
      }
    }

    if (errorCode === 'EISDIR') {
      return {
        success: false,
        message: '指定されたパスはディレクトリです',
      }
    }

    return {
      success: false,
      message: `ファイル削除エラー: ${(error as Error).message}`,
    }
  }
}

export const createDirectory = async(params: unknown): Promise<FileOperationResult> => {
  try {
    // パラメータの検証
    if (!validateCreateDirectoryParams(params)) {
      return {
        success: false,
        message: '無効なパラメータです',
      }
    }

    // パスの安全性チェック
    if (!isPathSafe(params.path)) {
      return {
        success: false,
        message: '安全でないパスです',
      }
    }

    // ディレクトリ作成
    await fs.mkdir(params.path, { recursive: params.recursive || false })
    return {
      success: true,
      message: 'ディレクトリを正常に作成しました',
    }
  } catch(error) {
    const errorCode = (error as { code?: string }).code

    if (errorCode === 'EEXIST') {
      return {
        success: true,
        message: 'ディレクトリは既に存在します',
      }
    }

    if (errorCode === 'EACCES') {
      return {
        success: false,
        message: 'ディレクトリの作成権限がありません',
      }
    }

    if (errorCode === 'ENOTDIR') {
      return {
        success: false,
        message: '親パスがディレクトリではありません',
      }
    }

    return {
      success: false,
      message: `ディレクトリ作成エラー: ${(error as Error).message}`,
    }
  }
}
