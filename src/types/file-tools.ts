export interface ReadFileParams {
  path: string
  encoding?: string
}

export interface WriteFileParams {
  path: string
  content: string
  encoding?: string
}

export interface ListFilesParams {
  path: string
  recursive?: boolean
  includeHidden?: boolean
}

export interface DeleteFileParams {
  path: string
}

export interface CreateDirectoryParams {
  path: string
  recursive?: boolean
}

export interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  lastModified?: Date
  permissions?: string
}

export interface FileOperationResult {
  success: boolean
  message?: string
  data?: unknown
}

export interface SecurityConfig {
  allowedDirectories: string[]
  blockedDirectories: string[]
  maxFileSize: number
  allowedExtensions?: string[]
  blockedExtensions?: string[]
}
