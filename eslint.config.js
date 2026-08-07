import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/build/**',
      '**/coverage/**',
      '**/storybook-static/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{jsx,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      // The rule cannot see that our wrappers render native controls, so a
      // valid wrapping <label><Radio /> Alpha</label> reads as unassociated.
      // Naming them restores real checking instead of disabling the rule.
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['Input', 'Textarea', 'Checkbox', 'Radio', 'Switch', 'Select'],
        },
      ],
      // A scrollable container MUST be keyboard focusable (WCAG 2.1.1) —
      // otherwise a keyboard user cannot scroll a wide table. The rule's
      // default allowlist only covers tabpanel, so the roles we use for
      // named scroll containers are added rather than the rule disabled.
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'group', 'region'], allowExpressionValues: true },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['scripts/**', '**/scripts/**'],
    rules: {
      'no-console': 'off',
    },
  },
  prettierConfig,
);
