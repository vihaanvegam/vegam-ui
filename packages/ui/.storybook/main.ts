import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@chromatic-com/storybook',
  ],
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
  typescript: {
    // Autodocs prop tables come straight from the TypeScript types + JSDoc
    // (the recipe mandates JSDoc with @default on every public prop). The
    // filter keeps the hundreds of inherited native DOM props out of the
    // tables — consumers know the platform surface.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
