module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
}; 