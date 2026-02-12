import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.unit.test.ts'],
    environment: 'node',
    setupFiles: ['./tests/vitest.setup.ts'],
  },
})
