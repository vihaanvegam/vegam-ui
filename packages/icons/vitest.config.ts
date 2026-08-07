import { defineConfig } from 'vitest/config';

// Single jsdom project — icons have no stories of their own (the gallery lives
// in packages/ui, which takes icons as a devDependency: ICONS_PLAN §6).
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
