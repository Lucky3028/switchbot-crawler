/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['custom-react'],
  overrides: [
    {
      files: ['remix.env.d.ts'],
      rules: {
        'import/prefer-default-export': 'error',
        'import/no-default-export': 'off',
      },
    },
  ],
};
