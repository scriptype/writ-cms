const { join, resolve } = require('path')
const Settings = require('./settings')

module.exports = {
  use(type, value) {
    const { theme } = Settings.getSettings()
    const basePath = join(__dirname, '..', 'packages', `theme-${theme}`)

    switch (type) {
      case "templateHelpers":
        const templateHelpersPath = resolve(join(basePath, 'template-helpers.js'))
        let helpers = {}
        try {
          helpers = require(templateHelpersPath)
        } catch {}
        return {
          ...value,
          ...helpers
        }

      case "templatePartials":
        return [
          ...value,
          basePath
        ]

      case "assets":
        return [
          ...value,
          {
            src: join(basePath, 'assets'),
            dest: theme
          }
        ]
    }
    return value
  }
}
