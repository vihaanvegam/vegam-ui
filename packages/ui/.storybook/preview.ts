import type { Preview } from '@storybook/react-vite';
import '@vegam-ui/tokens/tokens.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',

    options: {
      storySort: {
        order: ['Guides', ['Getting Started', 'Theming'], 'Components', '*'],
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  // Every CSF file gets a generated Docs page (prop table from types + JSDoc).
  // An attached MDX page — the Button.mdx template — replaces it wherever one
  // exists (§6 of BLUEPRINT: one MDX doc per component).
  tags: ['autodocs'],
};

export default preview;
