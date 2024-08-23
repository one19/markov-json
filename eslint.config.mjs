import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import parser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  eslintConfigPrettier,

  {
    ignores: ['**/dist'],
  },

  {
    files: ['*.ts'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
      parser,
    },
  },

  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
  },
  {
    rules: {
      'no-misleading-character-class': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-control-regex': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 100,
        },
      ],
    },
  },
];
