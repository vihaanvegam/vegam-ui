import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        // The package's own vite.config.ts is a library build (lib mode, dts,
        // directive preservation) and must not leak into Storybook.
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
};

export default config;
