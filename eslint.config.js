import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseUiRestriction = {
  patterns: [
    {
      group: ['@base-ui*', '@base-ui/*'],
      message: 'Base UI may only be imported inside src/components (ADR 0002).',
    },
  ],
};

export default tseslint.config(
  {
    ignores: [
      'dist',
      'storybook-static',
      'fixtures',
      'playwright-report',
      'test-results',
      '.superpowers',
      'docs',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.tsx', '.storybook/**/*.tsx'],
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    plugins: { 'import-x': importX },
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.css.ts',
            '**/*.test.*',
            '**/*.test-d.*',
            '**/*.stories.*',
            // Typechecked docs examples, shown in stories and never built.
            '**/*.example.*',
            '**/testUtils.*',
            '**/browserTestUtils.*',
            'tests/**',
            'scripts/**',
            '.storybook/**',
            '*.config.*',
            'vitest.setup.ts',
            'vitest.browser.setup.ts',
            'vitest.desktop-pointer.setup.ts',
            '**/*.browser.*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/**'],
    rules: { 'no-restricted-imports': ['error', baseUiRestriction] },
  },
  { files: ['src/components/**'], rules: { 'no-restricted-imports': 'off' } },
  {
    files: ['scripts/**', '*.config.*', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
);
