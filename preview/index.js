const { resolve, join } = require('path')
const settings = require('../settings')
const Watcher = require('./watcher')

module.exports = {
  init() {
    Watcher.init()
  },

  useTemplate(template) {
    const { mode } = settings.getSettings()
    return template + (mode === 'start' ? '{{> preview }}' : '')
  },

  useTemplatePartials(partials) {
    return [
      ...partials,
      resolve(join(__dirname, 'partials'))
    ]
  }
}
