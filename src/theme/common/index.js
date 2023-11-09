const { resolve, join } = require('path')

module.exports = {
  use(type, value) {
    switch (type) {
      case "templateHelpers":
        const templateHelpersPath = resolve(join(__dirname, 'template-helpers.js'))
        const helpers = require(templateHelpersPath)
        return {
          ...value,
          ...helpers
        }

      case "templatePartials":
        return [
          ...value,
          resolve(join(__dirname, 'partials'))
        ]

      case "assets":
        return [
          ...value,
          {
            src: resolve(join(__dirname, 'assets')),
            dest: 'common'
          }
        ]
    }
    return value
  }
}
