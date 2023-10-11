const { resolve } = require('path')

const useAssets = (mode) => (value) => {
  return [
    ...value,
    ...(mode === 'start' ? [{
      src: resolve(__dirname, './static'),
      dest: 'expansions/content-editor'
    }] : [])
  ]
}

module.exports = useAssets
