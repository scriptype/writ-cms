const _ = require('lodash')
const { join, resolve } = require('path')

const defaultSettings = {
  site: {
    title: 'A new blog',
    description: "A future work"
  },
  theme: "default",
  assetsDirectory: "assets",
  exportDirectory: "_site",
  pagesDirectory: "pages",
  ignorePaths: [
    ".git",
    ".gitignore",
    ".DS_Store",
    "_.*",
    "settings.json"
  ]
}
 
module.exports = {
  _settings: defaultSettings,
  getSettings() {
    return this._settings
  },
  init({ mode, rootDirectory, debug }) {
    const root = resolve(rootDirectory)
    const settingsJSON = require(join(root, 'settings.json'))
    this._settings = {
      ...defaultSettings,
      ...settingsJSON,
      ignorePaths: [
        ...defaultSettings.ignorePaths,
        ...settingsJSON.ignorePaths,
        settingsJSON.exportDirectory
      ],
      rootDirectory: root,
      out: join(root, settingsJSON.exportDirectory),
      mode,
      debug
    }
  }
}
