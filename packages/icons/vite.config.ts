import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Mirrors packages/ui minus everything CSS- and directive-related: icons ship
// no stylesheet, and deliberately carry NO 'use client' so they stay usable
// straight from a server component (docs/ICONS_PLAN.md §1). Consequently there
// is no rollup-preserve-directives here — scripts/check-directive.mjs asserts
// the absence.
export default defineConfig({
  plugins: [
    dts({
      // v5 renamed rollupTypes → bundleTypes; the old name is silently ignored
      bundleTypes: true,
      exclude: ['**/*.test.*'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
  },
});
