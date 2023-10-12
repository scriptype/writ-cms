const { resolve } = require('path')

const useAssets = (mode) => (value) => {
  if (mode !== 'start') {
    return value
  }
  return [
    ...value,
    {
      src: resolve(__dirname, './static'),
      dest: 'expansions/content-editor'
    }
  ]
}

module.exports = useAssets
