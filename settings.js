const _ = require('lodash')
const { join } = require('path')

const Settings = {
  _settings: {
    title: 'Blog',
    description: 'My new blog',
    theme: 'default'
  },

  _paths: {
    rootDirectory: '.',
    exportDirectory: '_site',
    assetsDirectory: 'assets',
    pagesDirectory: 'pages',
    ignorePaths: [
      "package.json",
      "package-lock.json",
      "node_modules",
      "settings.json",
      "start.js"
    ],
  },

  setPaths(settings) {
    const keysToExclude = Object.keys(this._settings)
    const paths = _.omit(settings, keysToExclude)
    const {
      rootDirectory,
      exportDirectory,
      assetsDirectory,
      pagesDirectory,
      ignorePaths
    } = {
      ...this._paths,
      ...paths
    }
    this.paths = {
      ROOT: rootDirectory,
      SITE: exportDirectory,
      POSTS_JSON: join(rootDirectory, exportDirectory, 'posts.json'),
      ASSETS: assetsDirectory,
      SUBPAGES: pagesDirectory,
      IGNORE: ignorePaths,
      IGNORE_REG_EXP: new RegExp(ignorePaths.join('|')),
      out: join(rootDirectory, exportDirectory)
    }
  },

  // Return the relevant settings from whatever object is passed,
  // And default to the current this.settings
  setSettings(settings) {
    const { site, theme } = {
      ...this._settings,
      ...settings
    }
    this.settings = {
      site,
      theme
    }
  },

  /* Take in a settings object in the form of:
   * {
   *   site?: {
   *     title?: String,
   *     description?: String
   *   },
   *   exportDirectory?: String,
   *   rootDirectory?: String,
   *   assetsDirectory?: String,
   *   pagesDirectory?: String,
   *   ignorePaths?: String[]
   * }
   *
   * and create settings and paths object out of it.
   */
  init(settings) {
    this.setSettings(settings)
    this.setPaths(settings)
    return this
  }
}

module.exports = Settings
