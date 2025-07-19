import { describe, it, expect } from 'vitest'
import {
  isPathSafe,
  normalizeFilePath,
  sanitizeFileName,
  DEFAULT_SECURITY_CONFIG,
} from './security'

describe('security', () => {
  describe('isPathSafe', () => {
    it('should allow paths within allowed directories', () => {
      const testPath = process.cwd() + '/test.txt'
      expect(isPathSafe(testPath)).toBe(true)
    })

    it('should reject paths with path traversal attempts', () => {
      expect(isPathSafe('../../../etc/passwd')).toBe(false)
      expect(isPathSafe('~/test.txt')).toBe(false)
    })

    it('should reject paths in blocked directories', () => {
      expect(isPathSafe('/etc/passwd')).toBe(false)
      expect(isPathSafe('/usr/bin/bash')).toBe(false)
      expect(isPathSafe('/var/log/system.log')).toBe(false)
    })

    it('should respect allowed extensions', () => {
      const testPath = process.cwd() + '/test.txt'
      expect(isPathSafe(testPath)).toBe(true)

      const jsonPath = process.cwd() + '/config.json'
      expect(isPathSafe(jsonPath)).toBe(true)
    })

    it('should reject blocked extensions', () => {
      const exePath = process.cwd() + '/malware.exe'
      expect(isPathSafe(exePath)).toBe(false)

      const batPath = process.cwd() + '/script.bat'
      expect(isPathSafe(batPath)).toBe(false)
    })

    it('should work with custom config', () => {
      const customConfig = {
        allowedDirectories: ['/tmp'],
        blockedDirectories: ['/etc'],
        maxFileSize: 1024,
        allowedExtensions: ['.log'],
        blockedExtensions: ['.tmp'],
      }

      expect(isPathSafe('/tmp/test.log', customConfig)).toBe(true)
      expect(isPathSafe('/tmp/test.tmp', customConfig)).toBe(false)
      expect(isPathSafe('/etc/test.log', customConfig)).toBe(false)
    })

    it('should handle invalid paths gracefully', () => {
      expect(isPathSafe('')).toBe(false)
    })
  })

  describe('normalizeFilePath', () => {
    it('should normalize relative paths to absolute', () => {
      const result = normalizeFilePath('./test.txt')
      expect(result).toMatch(/^\/.*test\.txt$/)
    })

    it('should handle absolute paths', () => {
      const testPath = '/tmp/test.txt'
      expect(normalizeFilePath(testPath)).toBe(testPath)
    })

    it('should resolve complex paths', () => {
      const complexPath = '/tmp/../tmp/./test.txt'
      expect(normalizeFilePath(complexPath)).toBe('/tmp/test.txt')
    })
  })

  describe('sanitizeFileName', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeFileName('file<name>.txt')).toBe('file_name_.txt')
      expect(sanitizeFileName('file:name.txt')).toBe('file_name.txt')
      expect(sanitizeFileName('file|name.txt')).toBe('file_name.txt')
    })

    it('should handle quotes and slashes', () => {
      expect(sanitizeFileName('file"name.txt')).toBe('file_name.txt')
      expect(sanitizeFileName('file\\name.txt')).toBe('file_name.txt')
      expect(sanitizeFileName('file/name.txt')).toBe('file_name.txt')
    })

    it('should handle control characters', () => {
      expect(sanitizeFileName('file\x00name.txt')).toBe('file_name.txt')
      expect(sanitizeFileName('file\x1fname.txt')).toBe('file_name.txt')
    })

    it('should preserve safe characters', () => {
      expect(sanitizeFileName('filename.txt')).toBe('filename.txt')
      expect(sanitizeFileName('file-name_123.txt')).toBe('file-name_123.txt')
    })

    it('should handle empty or special cases', () => {
      expect(sanitizeFileName('')).toBe('')
      expect(sanitizeFileName('.')).toBe('.')
      expect(sanitizeFileName('..')).toBe('..')
    })
  })

  describe('DEFAULT_SECURITY_CONFIG', () => {
    it('should have required properties', () => {
      expect(DEFAULT_SECURITY_CONFIG).toHaveProperty('allowedDirectories')
      expect(DEFAULT_SECURITY_CONFIG).toHaveProperty('blockedDirectories')
      expect(DEFAULT_SECURITY_CONFIG).toHaveProperty('maxFileSize')
      expect(DEFAULT_SECURITY_CONFIG).toHaveProperty('allowedExtensions')
      expect(DEFAULT_SECURITY_CONFIG).toHaveProperty('blockedExtensions')
    })

    it('should include current working directory in allowed directories', () => {
      expect(DEFAULT_SECURITY_CONFIG.allowedDirectories).toContain(process.cwd())
    })

    it('should block common system directories', () => {
      const blocked = DEFAULT_SECURITY_CONFIG.blockedDirectories
      expect(blocked).toContain('/etc')
      expect(blocked).toContain('/usr')
      expect(blocked).toContain('/bin')
    })

    it('should have reasonable file size limit', () => {
      expect(DEFAULT_SECURITY_CONFIG.maxFileSize).toBe(10 * 1024 * 1024) // 10MB
    })
  })
})
