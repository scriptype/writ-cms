const { join, resolve, extname } = require('path')
const { readdir, stat } = require('fs/promises')
const Debug = require('./debug')
const Settings = require('./settings')

module.exports = {
  directory: null,
  assets: [],

  async init() {
    Debug.timeStart('custom theme')
    this.directory = await this.getDirectory()
    this.assets = this.directory ? this.getAssets() : []
    Debug.timeEnd('custom theme')
  },

  async getDirectory() {
    const { themeDirectory } = Settings.getSettings()
    try {
      const directory = await readdir(themeDirectory)
      Debug.debugLog('has custom theme directory')
      return directory
    } catch {
      Debug.debugLog('has no custom theme directory')
      return null
    }
  },

  getAssets() {
    const { themeDirectory, IGNORE_PATHS_REG_EXP } = Settings.getSettings()
    return this.directory.filter(path => (
      !path.startsWith('_') &&
      !path.startsWith('.') &&
      !path.match(IGNORE_PATHS_REG_EXP) &&
      extname(path) !== '.hbs' &&
      extname(path) !== '.handlebars' &&
      path !== 'template-helpers.js'
    ))
    .map(path => join(themeDirectory, path))
  },

  use(type, value) {
    if (!this.directory || !this.directory.length) {
      return value
    }

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
        } catch {}
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
