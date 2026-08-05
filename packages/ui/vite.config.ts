import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-preserve-directives';

export default defineConfig({
  plugins: [
    dts({
      // v5 renamed rollupTypes → bundleTypes; the old name is silently ignored
      bundleTypes: true,
      exclude: ['**/*.test.*', '**/*.stories.*'],
    }),
    preserveDirectives(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'index',
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
      ],
      onwarn(warning, warn) {
        // 'use client' is intentional output preserved by rollup-preserve-directives
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
});
