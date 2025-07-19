import path from 'path'
import { SecurityConfig } from '../types/file-tools'

export const DEFAULT_SECURITY_CONFIG = {
  allowedDirectories: [process.cwd()],
  blockedDirectories: ['/etc', '/usr', '/bin', '/sbin', '/var', '/sys', '/proc'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.txt', '.json', '.md', '.csv', '.log', '.xml', '.yaml', '.yml'],
  blockedExtensions: ['.exe', '.bat', '.sh', '.ps1', '.cmd'],
} satisfies SecurityConfig

export const isPathSafe = (filePath: string, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean => {
  try {
    const resolvedPath = path.resolve(filePath)

    // パストラバーサル攻撃の検出
    if (filePath.includes('..') || filePath.includes('~')) {
      return false
    }

    // 許可されたディレクトリ内かチェック
    const isInAllowedDir = config.allowedDirectories.some(allowedDir => {
      const resolvedAllowedDir = path.resolve(allowedDir)
      return resolvedPath.startsWith(resolvedAllowedDir)
    })

    if (!isInAllowedDir) {
      return false
    }

    // ブロックされたディレクトリかチェック
    const isInBlockedDir = config.blockedDirectories.some(blockedDir => {
      const resolvedBlockedDir = path.resolve(blockedDir)
      return resolvedPath.startsWith(resolvedBlockedDir)
    })

    if (isInBlockedDir) {
      return false
    }

    // ファイル拡張子のチェック
    const fileExt = path.extname(filePath).toLowerCase()

    if (config.blockedExtensions && config.blockedExtensions.includes(fileExt)) {
      return false
    }

    if (config.allowedExtensions && !config.allowedExtensions.includes(fileExt)) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export const normalizeFilePath = (filePath: string): string => {
  return path.resolve(filePath)
}

export const sanitizeFileName = (fileName: string): string => {
  // 危険な文字を除去
  // eslint-disable-next-line no-control-regex
  return fileName.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
}

