const js = require('@eslint/js')
const globals = require('globals')

const browserGlobals = { ...globals.browser }
delete browserGlobals['AudioWorkletGlobalScope ']

module.exports = [
  {
    ignores: [
      '**/vendor/**'
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        ...globals.node,
        customElements: true,
        HTMLElement: true
      }
    },

    rules: {
      'no-empty': ['error', { 'allowEmptyCatch': true }]
    }
  },
  js.configs.recommended
]
