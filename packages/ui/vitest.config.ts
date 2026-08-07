import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Deliberately separate from vite.config.ts: the library build config (lib
// mode, dts, directive preservation) must not run during tests.
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Two projects: `unit` is the jsdom Vitest suite (pnpm test); `storybook`
// renders every story in headless Chromium via @storybook/addon-vitest
// (pnpm test:storybook, or the Storybook UI's testing panel). CI runs both, in
// separate jobs — the storybook one installs Chromium first (ci.yml `stories`).
export default defineConfig({
  test: {
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
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
          css: false,
        },
      },
      {
        extends: true,
        plugins: [
          // Runs the stories defined in the Storybook config as tests.
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
