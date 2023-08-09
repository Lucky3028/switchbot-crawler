// See: https://zenn.dev/jay_es/articles/2021-04-22-config-js#.eslintrc.js
/** @type {import('eslint/lib/shared/types').ConfigData} */
const config = {
  root: true,
  extends: ['custom', 'airbnb-base', 'airbnb-typescript/base'],
};

export default config;
