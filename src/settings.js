const _ = require('lodash')
const { basename, join, resolve } = require('path')
const { loadJSON } = require('./helpers')
const Debug = require('./debug')

const defaultSettings = (rootDirectory) => ({
  title: basename(resolve(rootDirectory)),
  description: "A future work",
  theme: "default",
  permalinkPrefix: "/",
  defaultCategoryName: "Uncategorized",
  assetsDirectory: "assets",
  exportDirectory: "docs",
  pagesDirectory: "pages",
  themeDirectory: "theme",
  contentDirectory: "content",
  domain: "",
  ignorePaths: [
    ".git",
    ".gitignore",
    "README.md",
    ".DS_Store",
    "_.*",
    "settings.json",
    "CNAME"
  ],
  expansions: [
    "content-editor"
  ],
  revisionHistory: "manual" // auto | manual | off
})

const getIgnoreRegExp = ({ ignorePaths, exportDirectory, themeDirectory }) => {
  return new RegExp(ignorePaths.concat(exportDirectory, themeDirectory).join('|'), 'i')
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
    Debug.timeStart('settings')
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
    Debug.debugLog('settings', { mode, rootDirectory, root, settingsJSON, userSettings, _settings })
    Debug.timeEnd('settings')
  }
}
