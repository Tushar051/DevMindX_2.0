module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended',
    'plugin:promise/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json', // Point to your tsconfig.json
  },
  plugins: [
    '@typescript-eslint',
    'node',
    'promise',
  ],
  rules: {
    // Add or override rules here
    'no-console': 'warn', // Example: Warn about console.log
    'indent': ['error', 2], // Enforce 2-space indentation
    'linebreak-style': ['error', 'windows'], // Enforce Windows-style line endings
    'quotes': ['error', 'single'], // Enforce single quotes
    'semi': ['error', 'always'], // Enforce semicolons
  },
};
