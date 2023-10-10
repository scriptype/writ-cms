const { join, resolve, extname } = require('path')
const { readdir } = require('fs/promises')
const { debugLog } = require('./debug')
const Settings = require('./settings')

module.exports = {
  async init() {
    const { themeDirectory, IGNORE_PATHS_REG_EXP } = Settings.getSettings()
    try {
      this.assets = (await readdir(themeDirectory))
        .filter(path => {
          return (
            !path.startsWith('_') &&
            !path.startsWith('.') &&
            !path.match(IGNORE_PATHS_REG_EXP) &&
            extname(path) !== '.hbs' &&
            extname(path) !== '.handlebars' &&
            path !== 'template-helpers.js'
          )
        })
        .map(path => join(themeDirectory, path))
    } catch {
      this.assets = []
    }
  },

  use(type, value) {
    const { themeDirectory } = Settings.getSettings()

    switch (type) {
      case "templatePartials":
        return [
          ...value,
          resolve(themeDirectory)
        ]

      case "templateHelpers":
        let helpers = {}
        const templateHelpersPath = resolve(themeDirectory, 'template-helpers.js')
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
          ...this.assets.map(path => ({
            src: resolve(path),
            dest: 'custom',
            single: true
          }))
        ]
    }

    return value
  }
}
