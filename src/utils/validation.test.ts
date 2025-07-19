import { describe, it, expect } from 'vitest'
import {
  validateReadFileParams,
  validateWriteFileParams,
  validateListFilesParams,
  validateDeleteFileParams,
  validateCreateDirectoryParams,
  validateFilePath,
} from './validation'

describe('validation', () => {
  describe('validateReadFileParams', () => {
    it('should accept valid parameters', () => {
      expect(validateReadFileParams({ path: '/test.txt' })).toBe(true)
      expect(validateReadFileParams({ path: '/test.txt', encoding: 'utf8' })).toBe(true)
    })

    it('should reject invalid parameters', () => {
      expect(validateReadFileParams(null)).toBe(false)
      expect(validateReadFileParams(undefined)).toBe(false)
      expect(validateReadFileParams('string')).toBe(false)
      expect(validateReadFileParams({})).toBe(false)
    })

    it('should reject invalid path', () => {
      expect(validateReadFileParams({ path: 123 })).toBe(false)
      expect(validateReadFileParams({ path: '' })).toBe(false)
      expect(validateReadFileParams({ path: '   ' })).toBe(false)
    })

    it('should reject invalid encoding', () => {
      expect(validateReadFileParams({ path: '/test.txt', encoding: 123 })).toBe(false)
      expect(validateReadFileParams({ path: '/test.txt', encoding: true })).toBe(false)
    })
  })

  describe('validateWriteFileParams', () => {
    it('should accept valid parameters', () => {
      expect(validateWriteFileParams({ path: '/test.txt', content: 'hello' })).toBe(true)
      expect(validateWriteFileParams({
        path: '/test.txt',
        content: 'hello',
        encoding: 'utf8',
      })).toBe(true)
    })

    it('should reject missing content', () => {
      expect(validateWriteFileParams({ path: '/test.txt' })).toBe(false)
      expect(validateWriteFileParams({ path: '/test.txt', content: 123 })).toBe(false)
      expect(validateWriteFileParams({ path: '/test.txt', content: null })).toBe(false)
    })

    it('should reject invalid path', () => {
      expect(validateWriteFileParams({ content: 'hello' })).toBe(false)
      expect(validateWriteFileParams({ path: '', content: 'hello' })).toBe(false)
    })

    it('should reject invalid encoding', () => {
      expect(validateWriteFileParams({
        path: '/test.txt',
        content: 'hello',
        encoding: 123,
      })).toBe(false)
    })
  })

  describe('validateListFilesParams', () => {
    it('should accept valid parameters', () => {
      expect(validateListFilesParams({ path: '/tmp' })).toBe(true)
      expect(validateListFilesParams({
        path: '/tmp',
        recursive: true,
        includeHidden: false,
      })).toBe(true)
    })

    it('should reject invalid path', () => {
      expect(validateListFilesParams({})).toBe(false)
      expect(validateListFilesParams({ path: 123 })).toBe(false)
      expect(validateListFilesParams({ path: '' })).toBe(false)
    })

    it('should reject invalid boolean options', () => {
      expect(validateListFilesParams({ path: '/tmp', recursive: 'true' })).toBe(false)
      expect(validateListFilesParams({ path: '/tmp', includeHidden: 1 })).toBe(false)
    })

    it('should accept undefined boolean options', () => {
      expect(validateListFilesParams({ path: '/tmp', recursive: undefined })).toBe(true)
      expect(validateListFilesParams({ path: '/tmp', includeHidden: undefined })).toBe(true)
    })
  })

  describe('validateDeleteFileParams', () => {
    it('should accept valid parameters', () => {
      expect(validateDeleteFileParams({ path: '/test.txt' })).toBe(true)
    })

    it('should reject invalid parameters', () => {
      expect(validateDeleteFileParams(null)).toBe(false)
      expect(validateDeleteFileParams({})).toBe(false)
      expect(validateDeleteFileParams({ path: 123 })).toBe(false)
      expect(validateDeleteFileParams({ path: '' })).toBe(false)
    })
  })

  describe('validateCreateDirectoryParams', () => {
    it('should accept valid parameters', () => {
      expect(validateCreateDirectoryParams({ path: '/tmp/newdir' })).toBe(true)
      expect(validateCreateDirectoryParams({
        path: '/tmp/newdir',
        recursive: true,
      })).toBe(true)
    })

    it('should reject invalid path', () => {
      expect(validateCreateDirectoryParams({})).toBe(false)
      expect(validateCreateDirectoryParams({ path: 123 })).toBe(false)
      expect(validateCreateDirectoryParams({ path: '' })).toBe(false)
    })

    it('should reject invalid recursive option', () => {
      expect(validateCreateDirectoryParams({
        path: '/tmp/newdir',
        recursive: 'true',
      })).toBe(false)
      expect(validateCreateDirectoryParams({
        path: '/tmp/newdir',
        recursive: 1,
      })).toBe(false)
    })

    it('should accept undefined recursive option', () => {
      expect(validateCreateDirectoryParams({
        path: '/tmp/newdir',
        recursive: undefined,
      })).toBe(true)
    })
  })

  describe('validateFilePath', () => {
    it('should accept valid file paths', () => {
      expect(validateFilePath('/test.txt')).toEqual({ valid: true })
      expect(validateFilePath('/tmp/subdir/file.json')).toEqual({ valid: true })
      expect(validateFilePath('relative/path.txt')).toEqual({ valid: true })
    })

    it('should reject null or undefined paths', () => {
      expect(validateFilePath(null as any)).toEqual({
        valid: false,
        error: 'ファイルパスが必要です',
      })
      expect(validateFilePath(undefined as any)).toEqual({
        valid: false,
        error: 'ファイルパスが必要です',
      })
      expect(validateFilePath(123 as any)).toEqual({
        valid: false,
        error: 'ファイルパスが必要です',
      })
    })

    it('should reject empty paths', () => {
      expect(validateFilePath('')).toEqual({
        valid: false,
        error: 'ファイルパスが必要です',
      })
      expect(validateFilePath('   ')).toEqual({
        valid: false,
        error: 'ファイルパスが空です',
      })
    })

    it('should reject paths that are too long', () => {
      const longPath = 'a'.repeat(5000)
      expect(validateFilePath(longPath)).toEqual({
        valid: false,
        error: 'ファイルパスが長すぎます',
      })
    })

    it('should reject paths with null characters', () => {
      expect(validateFilePath('/test\0file.txt')).toEqual({
        valid: false,
        error: 'ファイルパスに無効な文字が含まれています',
      })
    })

    it('should accept paths at the length limit', () => {
      const maxPath = 'a'.repeat(4096)
      expect(validateFilePath(maxPath)).toEqual({ valid: true })
    })
  })
})
