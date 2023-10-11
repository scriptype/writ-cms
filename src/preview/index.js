const { resolve, join } = require('path')
const Settings = require('../settings')

module.exports = {
  use(type, value) {
    const { mode } = Settings.getSettings()
    switch (type) {
      case "template":
        return value + (mode === 'start' ? '{{> preview }}' : '')

      case "templatePartials":
        return mode === 'start' ? [
          ...value,
          resolve(join(__dirname, 'partials'))
        ] : []

      case "assets":
        return mode === 'start' ? [
          ...value,
          {
            src: resolve(__dirname, './static'),
            dest: 'preview'
          }
        ] : []
    }
    return value
  }
}
