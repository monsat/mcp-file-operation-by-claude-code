import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TestMCP',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@modelcontextprotocol/sdk', 'fs', 'path', 'crypto'],
      output: {
        globals: {
          '@modelcontextprotocol/sdk': 'ModelContextProtocolSDK',
        },
      },
    },
    outDir: 'build/src',
    sourcemap: true,
    target: 'node18',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})