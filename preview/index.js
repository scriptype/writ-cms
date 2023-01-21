const { resolve, join } = require('path')
const settings = require('../settings')
const Watcher = require('./watcher')

module.exports = {
  init() {
    Watcher.init()
  },

  use(type, value) {
    switch (type) {
      case "template":
        const { mode } = settings.getSettings()
        return value + (mode === 'start' ? '{{> preview }}' : '')

      case "templatePartials":
        return [
          ...value,
          resolve(join(__dirname, 'partials'))
        ]
    }
    return value
  }
}
