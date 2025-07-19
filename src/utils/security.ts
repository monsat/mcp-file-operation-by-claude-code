import path from 'path';
import { SecurityConfig } from '../types/file-tools.js';

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowedDirectories: [process.cwd()],
  blockedDirectories: ['/etc', '/usr', '/bin', '/sbin', '/var', '/sys', '/proc'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.txt', '.json', '.md', '.csv', '.log', '.xml', '.yaml', '.yml'],
  blockedExtensions: ['.exe', '.bat', '.sh', '.ps1', '.cmd']
};

export function isPathSafe(filePath: string, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean {
  try {
    const resolvedPath = path.resolve(filePath);
    
    // パストラバーサル攻撃の検出
    if (filePath.includes('..') || filePath.includes('~')) {
      return false;
    }

    // 許可されたディレクトリ内かチェック
    const isInAllowedDir = config.allowedDirectories.some(allowedDir => {
      const resolvedAllowedDir = path.resolve(allowedDir);
      return resolvedPath.startsWith(resolvedAllowedDir);
    });

    if (!isInAllowedDir) {
      return false;
    }

    // ブロックされたディレクトリかチェック
    const isInBlockedDir = config.blockedDirectories.some(blockedDir => {
      const resolvedBlockedDir = path.resolve(blockedDir);
      return resolvedPath.startsWith(resolvedBlockedDir);
    });

    if (isInBlockedDir) {
      return false;
    }

    // ファイル拡張子のチェック
    const fileExt = path.extname(filePath).toLowerCase();
    
    if (config.blockedExtensions && config.blockedExtensions.includes(fileExt)) {
      return false;
    }

    if (config.allowedExtensions && !config.allowedExtensions.includes(fileExt)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function normalizeFilePath(filePath: string): string {
  return path.resolve(filePath);
}

export function sanitizeFileName(fileName: string): string {
  // 危険な文字を除去
  return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
}

export { DEFAULT_SECURITY_CONFIG };