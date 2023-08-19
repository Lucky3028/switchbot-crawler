module.exports = {
  root: true,
  extends: ['custom'],
  overrides: [
    {
      files: ['src/worker.ts'],
      rules: {
        'import/prefer-default-export': 'error',
        'import/no-default-export': 'off',
      },
    },
  ],
};
