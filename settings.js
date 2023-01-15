const _ = require('lodash')
const { join, resolve } = require('path')
const { loadJSON } = require('./helpers')
const { debugLog } = require('./debug')

const defaultSettings = {
  title: 'A Blog website',
  description: "A future work",
  theme: "default",
  assetsDirectory: "assets",
  exportDirectory: "docs",
  pagesDirectory: "pages",
  ignorePaths: [
    ".git",
    ".gitignore",
    "README.md",
    ".DS_Store",
    "_.*",
    "settings.json"
  ],
}

const getIgnoreRegExp = ({ ignorePaths, exportDirectory }) => {
  return new RegExp(ignorePaths.concat(exportDirectory).join('|'), 'i')
}

module.exports = {
  _settings: defaultSettings,
  getSettings() {
    return this._settings
  },
  async init({ mode, rootDirectory }) {
    const root = resolve(rootDirectory)
    const settingsJSON = await loadJSON(join(root, 'settings.json'))
    const userSettings = {
      ...defaultSettings,
      ...settingsJSON,
    }
    this._settings = _.omit({
      ...userSettings,
      site: {
        title: userSettings.title,
        description: userSettings.description,
      },
      IGNORE_PATHS_REG_EXP: getIgnoreRegExp(userSettings),
      rootDirectory: root,
      out: join(root, userSettings.exportDirectory),
      mode
    }, ['title', 'description'])
    debugLog('settings', mode, rootDirectory, root, settingsJSON, userSettings, this._settings)
  }
}
