import { defineConfig } from 'vitest/config';

// Deliberately separate from vite.config.ts: the library build config (lib
// mode, dts, directive preservation) must not run during tests.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/components/**/*.tsx', 'src/utils/**/*.ts'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.tsx',
        'src/**/index.ts',
        'src/**/*.types.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
