// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
  env: {
    jest: true,
  },
  overrides: [
    {
      // Node scripts run outside the app bundle, so Node globals (__dirname, require) are defined
      files: ['scripts/**/*.js', '__tests__/scripts/**/*.js'],
      env: { node: true },
    },
    {
      // Jest mock factories must use require() inside jest.mock(), which cannot reference imports
      files: ['__tests__/**/*.{ts,tsx,js}'],
      rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};
