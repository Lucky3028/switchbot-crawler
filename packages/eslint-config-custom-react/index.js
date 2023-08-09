// See: https://zenn.dev/jay_es/articles/2021-04-22-config-js#.eslintrc.js
/** @type {import('eslint/lib/shared/types').ConfigData} */
const config = {
  root: true,
  extends: ['custom', 'plugin:react/recommended', 'airbnb', 'airbnb-typescript'],
  plugins: ['react', 'jsx-expressions'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'react/jsx-props-no-spreading': [
      'error',
      {
        html: 'enforce',
        custom: 'enforce',
        explicitSpread: 'ignore',
      },
    ],
    'react/require-default-props': 'off',
    'jsx-expressions/strict-logical-expressions': 'error',
  },
};

export default config;
