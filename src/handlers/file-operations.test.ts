import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import {
  readFile,
  writeFile,
  listFiles,
  deleteFile,
  createDirectory,
} from './file-operations'

const TEST_DIR = path.join(process.cwd(), 'test-tmp')
const TEST_FILE = path.join(TEST_DIR, 'test.txt')
const TEST_CONTENT = 'Hello, World!'

describe('file-operations', () => {
  beforeEach(async() => {
    // テスト用ディレクトリを作成
    await fs.mkdir(TEST_DIR, { recursive: true })
  })

  afterEach(async() => {
    // テスト用ディレクトリを削除
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true })
    } catch {
      // エラーは無視
    }
  })

  describe('readFile', () => {
    it('should read file content successfully', async() => {
      // Arrange: テストファイルを作成
      await fs.writeFile(TEST_FILE, TEST_CONTENT)

      // Act
      const result = await readFile({ path: TEST_FILE })

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toBe(TEST_CONTENT)
    })

    it('should return error for non-existent file', async() => {
      const nonExistentFile = path.join(TEST_DIR, 'non-existent.txt')
      const result = await readFile({ path: nonExistentFile })

      expect(result.success).toBe(false)
      expect(result.message).toContain('ファイルが見つかりません')
    })

    it('should reject unsafe paths', async() => {
      const result = await readFile({ path: '../../../etc/passwd' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('安全でないパス')
    })

    it('should reject invalid parameters', async() => {
      const result = await readFile({ path: '' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('無効なパラメータ')
    })
  })

  describe('writeFile', () => {
    it('should write file content successfully', async() => {
      const result = await writeFile({
        path: TEST_FILE,
        content: TEST_CONTENT,
      })

      expect(result.success).toBe(true)

      // ファイルが実際に作成されたことを確認
      const written = await fs.readFile(TEST_FILE, 'utf8')
      expect(written).toBe(TEST_CONTENT)
    })

    it('should reject unsafe paths', async() => {
      const result = await writeFile({
        path: '../../../tmp/evil.txt',
        content: 'evil content',
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain('安全でないパス')
    })

    it('should reject invalid parameters', async() => {
      const result = await writeFile({
        path: '',
        content: 'some content',
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain('無効なパラメータ')
    })

    it('should create parent directories if needed', async() => {
      const deepFile = path.join(TEST_DIR, 'deep', 'nested', 'file.txt')

      const result = await writeFile({
        path: deepFile,
        content: TEST_CONTENT,
      })

      expect(result.success).toBe(true)

      const written = await fs.readFile(deepFile, 'utf8')
      expect(written).toBe(TEST_CONTENT)
    })
  })

  describe('listFiles', () => {
    beforeEach(async() => {
      // テストファイルを複数作成
      await fs.writeFile(path.join(TEST_DIR, 'file1.txt'), 'content1')
      await fs.writeFile(path.join(TEST_DIR, 'file2.json'), 'content2')
      await fs.mkdir(path.join(TEST_DIR, 'subdir'))
      await fs.writeFile(path.join(TEST_DIR, 'subdir', 'file3.txt'), 'content3')
    })

    it('should list files in directory', async() => {
      const result = await listFiles({ path: TEST_DIR })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(3) // 2ファイル + 1ディレクトリ
    })

    it('should list files recursively when requested', async() => {
      const result = await listFiles({
        path: TEST_DIR,
        recursive: true,
      })

      expect(result.success).toBe(true)
      expect(result.data.length).toBeGreaterThan(3)
    })

    it('should reject unsafe paths', async() => {
      const result = await listFiles({ path: '/etc' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('安全でないパス')
    })
  })

  describe('deleteFile', () => {
    beforeEach(async() => {
      await fs.writeFile(TEST_FILE, TEST_CONTENT)
    })

    it('should delete file successfully', async() => {
      const result = await deleteFile({ path: TEST_FILE })

      expect(result.success).toBe(true)

      // ファイルが削除されたことを確認
      try {
        await fs.access(TEST_FILE)
        expect.fail('ファイルが削除されていません')
      } catch {
        // 期待される動作
      }
    })

    it('should return error for non-existent file', async() => {
      const nonExistentFile = path.join(TEST_DIR, 'non-existent.txt')
      const result = await deleteFile({ path: nonExistentFile })

      expect(result.success).toBe(false)
      expect(result.message).toContain('ファイルが見つかりません')
    })

    it('should reject unsafe paths', async() => {
      const result = await deleteFile({ path: '../../../important.txt' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('安全でないパス')
    })
  })

  describe('createDirectory', () => {
    it('should create directory successfully', async() => {
      const newDir = path.join(TEST_DIR, 'newdir')

      const result = await createDirectory({ path: newDir })

      expect(result.success).toBe(true)

      // ディレクトリが作成されたことを確認
      const stats = await fs.stat(newDir)
      expect(stats.isDirectory()).toBe(true)
    })

    it('should create nested directories when recursive is true', async() => {
      const nestedDir = path.join(TEST_DIR, 'deep', 'nested', 'dir')

      const result = await createDirectory({
        path: nestedDir,
        recursive: true,
      })

      expect(result.success).toBe(true)

      const stats = await fs.stat(nestedDir)
      expect(stats.isDirectory()).toBe(true)
    })

    it('should reject unsafe paths', async() => {
      const result = await createDirectory({ path: '../../../tmp/evil' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('安全でないパス')
    })

    it('should handle existing directory gracefully', async() => {
      const result = await createDirectory({ path: TEST_DIR })

      expect(result.success).toBe(true)
    })
  })
})
