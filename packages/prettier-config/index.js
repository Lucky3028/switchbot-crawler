/**
 * @type {import('prettier').Config}
 */
const config = {
  plugins: [require('prettier-plugin-tailwindcss')],
  printWidth: 140,
  singleQuote: true,
  useTabs: false,
  trailingComma: 'all',
};

module.exports = config;
