import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    // ts
    typecheck: {
      tsconfig: './tsconfig.test.json',
    }
  },
})
