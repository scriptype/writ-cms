const { resolve, join } = require('path')
const Settings = require('../settings')

module.exports = {
  use(type, value) {
    const { mode } = Settings.getSettings()
    if (mode !== 'start') {
      return value
    }
    switch (type) {
      case "template":
        return value + '{{> preview }}'

      case "templatePartials":
        return [
          ...value,
          resolve(join(__dirname, 'partials'))
        ]

      case "assets":
        return [
          ...value,
          {
            src: resolve(__dirname, './static'),
            dest: 'preview'
          }
        ]
    }
    return value
  }
}
