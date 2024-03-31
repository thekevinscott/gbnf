import { defineConfig, } from 'vitest/config';
// import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/umd.ts',
      formats: ['umd',],
      fileName: 'index',
      name: 'GBNF',
    },
    sourcemap: true,
    target: 'esnext',
    minify: true,
  },
  // plugins: [dts({ rollupTypes: true, }),],
  test: {
    include: ['**/*.test.ts', './test/**/*.test.ts',],
    globals: true,
    // ts
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
