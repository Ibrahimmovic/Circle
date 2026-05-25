module.exports = {
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^(React|[A-Z])' }],
    'no-console': 'off'
  },
  overrides: [
    {
      files: ['*.jsx'],
      env: { browser: true },
      globals: { React: 'readonly' }
    }
  ]
};
