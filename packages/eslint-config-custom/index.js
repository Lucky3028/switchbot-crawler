// See: https://zenn.dev/jay_es/articles/2021-04-22-config-js#.eslintrc.js
/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'airbnb-base', 'airbnb-typescript/base', 'prettier'],
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'no-void': [
      'error',
      {
        allowAsStatement: true,
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '_',
        ignoreRestSiblings: false,
        varsIgnorePattern: '_',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'error',
    // See: https://zenn.dev/teppeis/articles/2023-04-typescript-5_0-verbatim-module-syntax
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',
  },
  settings: {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules', 'build'],
};
