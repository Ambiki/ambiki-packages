'use strict';

module.exports = {
  root: true,
  plugins: ['prettier', '@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  env: {
    node: true,
    browser: true,
  },
  overrides: [
    {
      files: '**/spec/**/*.ts',
      globals: { describe: true, it: true, beforeEach: true },
    },
  ],
};
