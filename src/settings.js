const _ = require('lodash')
const { basename, join, resolve } = require('path')
const { loadJSON } = require('./helpers')
const { debugLog } = require('./debug')

const defaultSettings = (rootDirectory) => ({
  title: basename(resolve(rootDirectory)),
  description: "A future work",
  theme: "default",
  permalinkPrefix: "/",
  assetsDirectory: "assets",
  exportDirectory: "docs",
  pagesDirectory: "pages",
  themeDirectory: "theme",
  ignorePaths: [
    ".git",
    ".gitignore",
    "README.md",
    ".DS_Store",
    "_.*",
    "settings.json"
  ],
  expansions: [
    "content-editor"
  ]
})

const getIgnoreRegExp = ({ ignorePaths, exportDirectory }) => {
  return new RegExp(ignorePaths.concat(exportDirectory).join('|'), 'i')
}

let _defaultSettings = defaultSettings('.')

let _settings = {
  ..._defaultSettings
}

module.exports = {
  getDefaultSettings(rootDirectory) {
    if (rootDirectory) {
      return defaultSettings(rootDirectory)
    }
    return _defaultSettings
  },
  getSettings() {
    return _settings
  },
  async init({ mode, rootDirectory }) {
    const root = resolve(rootDirectory)
    const settingsJSON = await loadJSON(join(root, 'settings.json'))
    _defaultSettings = {...defaultSettings(rootDirectory)}
    const userSettings = {
      ..._defaultSettings,
      ...settingsJSON,
    }
    _settings = _.omit({
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
    debugLog('settings', { mode, rootDirectory, root, settingsJSON, userSettings, _settings })
  }
}
