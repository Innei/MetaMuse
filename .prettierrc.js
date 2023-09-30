module.exports = {
  tabWidth: 2,
  printWidth: 80,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: [
    require.resolve('prettier-package-json'),
    require.resolve('@ianvs/prettier-plugin-sort-imports'),
    // require.resolve('prettier-plugin-tailwindcss'),
  ],

  importOrder: [
    'react',
    '<THIRD_PARTY_MODULES>',
    '<TYPES>',
    '<TYPES>^[.]',
    '',

    '^@(.*)/(.*)$',
    '',
    '^~/(.*)$',
    '',
    '^@/(.*)$',
    '',
    '^[./]',
    '',
    '^(?!.*[.]css$)[./].*$',
    '.css$',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
}
