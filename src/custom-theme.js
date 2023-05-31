const { resolve } = require('path')
const { debugLog } = require('./debug')
const Settings = require('./settings')

module.exports = {
  init(theme) {
    this.customTheme = theme
    return this
  },

  use(type, value) {
    if (!this.customTheme) {
      return value
    }

    const { rootDirectory } = Settings.getSettings()

    switch (type) {
      case "templatePartials":
        return [
          ...value,
          resolve(rootDirectory, './theme')
        ]

      case "templateHelpers":
        let helpers = {}
        const templateHelpersPath = resolve(rootDirectory, './theme', 'template-helpers.js')
        try {
          helpers = require(templateHelpersPath)
        } catch (e) {
          debugLog('no custom template helpers')
        }
        return {
          ...value,
          ...helpers
        }

      case "assets":
        return [
          ...value,
          ...this.customTheme.assets.map(asset => ({
            src: resolve(rootDirectory, asset.path),
            dest: 'custom',
            single: true
          }))
        ]
    }

    return value
  }
}
