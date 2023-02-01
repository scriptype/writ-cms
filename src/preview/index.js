const { resolve, join } = require('path')
const settings = require('../settings')
const Watcher = require('./watcher')

module.exports = {
  init() {
    Watcher.init()
    this.started = true
  },

  use(type, value) {
    if (!this.started) {
      return value
    }
    const { mode } = settings.getSettings()
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
