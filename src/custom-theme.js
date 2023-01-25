const { resolve } = require('path')
const Settings = require('./settings')

module.exports = {
  init(theme) {
    console.log('initing custom theme', theme)
    this.customTheme = theme
    return this
  },

  use(type, value) {
    const yes = type === 'templatePartials' || type === 'assets'
    yes && console.log(type, 'customTheme.use', value)
    if (!this.customTheme) {
      console.log('no custom theme. returning')
      return value
    }

    const { rootDirectory } = Settings.getSettings()

    switch (type) {
      case "templatePartials":
        return [
          ...value,
          resolve(rootDirectory, './theme')
        ]

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
