const _ = require('lodash')
const { basename, join, resolve } = require('path')
const { loadJSON } = require('./helpers')
const Debug = require('./debug')

const defaultSettings = (rootDirectory) => ({
  language: "en",
  title: basename(resolve(rootDirectory)),
  description: "A future work",
  url: "",
  icon: "assets/common/writ-icon-512.png",
  theme: "default",
  permalinkPrefix: "/",
  assetsDirectory: "assets",
  exportDirectory: "docs",
  pagesDirectory: "pages",
  themeDirectory: "theme",
  contentDirectory: "content",
  cname: "",
  syntaxHighlighting: "off",
  search: "off",
  rss: "off",
  ignorePaths: [
    ".git",
    ".gitignore",
    "README.md",
    ".DS_Store",
    "^_.*",
    "settings.json",
    "CNAME"
  ],
  expansions: [],
  revisionHistory: "manual", // auto | manual | off
  previewPort: 3000,
  postsPerPage: 15
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
        url: userSettings.url,
        icon: userSettings.icon
      },
      IGNORE_PATHS_REG_EXP: getIgnoreRegExp(userSettings),
      permalinkPrefix: mode === 'start' ? '/' : userSettings.permalinkPrefix,
      rootDirectory: root,
      out: join(root, userSettings.exportDirectory),
      mode
    }, ['title', 'description'])
    Debug.debugLog('settings', { mode, rootDirectory, root, settingsJSON, userSettings, _settings })
    Debug.timeEnd('settings')
  }
}
