import { FlatCompat } from '@eslint/eslintrc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import pluginReactPlugin from 'eslint-plugin-react';
import pluginReactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      semi: ['error', 'always'],
      'semi-spacing': ['error', { after: true, before: false }],
      'semi-style': ['error', 'last'],
      'no-extra-semi': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
    },
  },
  {
    ...pluginReactPlugin.configs.flat.recommended,
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-hooks': pluginReactHooksPlugin,
    },
    rules: {
      ...pluginReactHooksPlugin.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    plugins: {
      jsxA11y: jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
    },
  },
  {
    plugins: {
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
export default eslintConfig;
