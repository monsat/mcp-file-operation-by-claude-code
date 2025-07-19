import { 
  ReadFileParams, 
  WriteFileParams, 
  ListFilesParams, 
  DeleteFileParams,
  CreateDirectoryParams 
} from '../types/file-tools.js';

export function validateReadFileParams(params: any): params is ReadFileParams {
  if (!params || typeof params !== 'object') {
    return false;
  }

  if (typeof params.path !== 'string' || params.path.trim() === '') {
    return false;
  }

  if (params.encoding && typeof params.encoding !== 'string') {
    return false;
  }

  return true;
}

export function validateWriteFileParams(params: any): params is WriteFileParams {
  if (!params || typeof params !== 'object') {
    return false;
  }

  if (typeof params.path !== 'string' || params.path.trim() === '') {
    return false;
  }

  if (typeof params.content !== 'string') {
    return false;
  }

  if (params.encoding && typeof params.encoding !== 'string') {
    return false;
  }

  return true;
}

export function validateListFilesParams(params: any): params is ListFilesParams {
  if (!params || typeof params !== 'object') {
    return false;
  }

  if (typeof params.path !== 'string' || params.path.trim() === '') {
    return false;
  }

  if (params.recursive !== undefined && typeof params.recursive !== 'boolean') {
    return false;
  }

  if (params.includeHidden !== undefined && typeof params.includeHidden !== 'boolean') {
    return false;
  }

  return true;
}

export function validateDeleteFileParams(params: any): params is DeleteFileParams {
  if (!params || typeof params !== 'object') {
    return false;
  }

  if (typeof params.path !== 'string' || params.path.trim() === '') {
    return false;
  }

  return true;
}

export function validateCreateDirectoryParams(params: any): params is CreateDirectoryParams {
  if (!params || typeof params !== 'object') {
    return false;
  }

  if (typeof params.path !== 'string' || params.path.trim() === '') {
    return false;
  }

  if (params.recursive !== undefined && typeof params.recursive !== 'boolean') {
    return false;
  }

  return true;
}

export function validateFilePath(filePath: string): { valid: boolean; error?: string } {
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'ファイルパスが必要です' };
  }

  if (filePath.trim() === '') {
    return { valid: false, error: 'ファイルパスが空です' };
  }

  if (filePath.length > 4096) {
    return { valid: false, error: 'ファイルパスが長すぎます' };
  }

  // null文字のチェック
  if (filePath.includes('\0')) {
    return { valid: false, error: 'ファイルパスに無効な文字が含まれています' };
  }

  return { valid: true };
}