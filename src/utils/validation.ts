import {
  ReadFileParams,
  WriteFileParams,
  ListFilesParams,
  DeleteFileParams,
  CreateDirectoryParams,
} from '../types/file-tools'

export const validateReadFileParams = (params: unknown): params is ReadFileParams => {
  if (!params || typeof params !== 'object') {
    return false
  }

  const obj = params as Record<string, unknown>

  if (typeof obj.path !== 'string' || obj.path.trim() === '') {
    return false
  }

  if (obj.encoding && typeof obj.encoding !== 'string') {
    return false
  }

  return true
}

export const validateWriteFileParams = (params: unknown): params is WriteFileParams => {
  if (!params || typeof params !== 'object') {
    return false
  }

  const obj = params as Record<string, unknown>

  if (typeof obj.path !== 'string' || obj.path.trim() === '') {
    return false
  }

  if (typeof obj.content !== 'string') {
    return false
  }

  if (obj.encoding && typeof obj.encoding !== 'string') {
    return false
  }

  return true
}

export const validateListFilesParams = (params: unknown): params is ListFilesParams => {
  if (!params || typeof params !== 'object') {
    return false
  }

  const obj = params as Record<string, unknown>

  if (typeof obj.path !== 'string' || obj.path.trim() === '') {
    return false
  }

  if (obj.recursive !== undefined && typeof obj.recursive !== 'boolean') {
    return false
  }

  if (obj.includeHidden !== undefined && typeof obj.includeHidden !== 'boolean') {
    return false
  }

  return true
}

export const validateDeleteFileParams = (params: unknown): params is DeleteFileParams => {
  if (!params || typeof params !== 'object') {
    return false
  }

  const obj = params as Record<string, unknown>

  if (typeof obj.path !== 'string' || obj.path.trim() === '') {
    return false
  }

  return true
}

export const validateCreateDirectoryParams = (params: unknown): params is CreateDirectoryParams => {
  if (!params || typeof params !== 'object') {
    return false
  }

  const obj = params as Record<string, unknown>

  if (typeof obj.path !== 'string' || obj.path.trim() === '') {
    return false
  }

  if (obj.recursive !== undefined && typeof obj.recursive !== 'boolean') {
    return false
  }

  return true
}

export const validateFilePath = (filePath: string): { valid: boolean; error?: string } => {
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'ファイルパスが必要です' }
  }

  if (filePath.trim() === '') {
    return { valid: false, error: 'ファイルパスが空です' }
  }

  if (filePath.length > 4096) {
    return { valid: false, error: 'ファイルパスが長すぎます' }
  }

  // null文字のチェック
  if (filePath.includes('\0')) {
    return { valid: false, error: 'ファイルパスに無効な文字が含まれています' }
  }

  return { valid: true }
}
