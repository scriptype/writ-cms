const { stat, mkdir, cp } = require('fs/promises')
const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')

module.exports = {
  async init() {
    Debug.timeStart('theme')
    const { rootDirectory, themeDirectory } = Settings.getSettings()
    const folderPath = join(rootDirectory, themeDirectory)
    try {
      await stat(folderPath)
      Debug.debugLog(`${folderPath} exists`)
      return
    } catch (e) {
      Debug.debugLog(`${folderPath} not found`)
    }
    await this.makeThemeDirectory(folderPath)
    Debug.timeEnd('theme')
  },

  async makeThemeDirectory(folderPath) {
    const ASSETS = 'assets'
    const PARTIALS = 'partials'
    const TEMPLATES = 'templates'

    await mkdir(folderPath)

    await Promise.all([
      mkdir(join(folderPath, ASSETS)),
      mkdir(join(folderPath, TEMPLATES))
    ])

    await Promise.all([
      cp(
        join(__dirname, 'common', ASSETS),
        join(folderPath, ASSETS, 'common'),
        { recursive: true }
      ),
      cp(
        join(__dirname, 'common', PARTIALS),
        join(folderPath, TEMPLATES),
        { recursive: true }
      ),
      cp(
        join(__dirname, 'common', 'template-helpers.js'),
        join(folderPath, TEMPLATES, 'template-helpers.js')
      )
    ])

    const { theme } = Settings.getSettings()
    const themeSrcPath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)
    try {
      await Promise.all([
        cp(
          join(themeSrcPath, ASSETS),
          join(folderPath, ASSETS, theme),
          { recursive: true }
        ),
        cp(
          join(themeSrcPath, PARTIALS),
          join(folderPath, TEMPLATES),
          { recursive: true }
        )
      ])
    } catch (e) {
      Debug.debugLog(`⚠️  error copying theme resources: ${theme}`, e)
    }
  },

  use(type, value) {
    const { rootDirectory, theme, themeDirectory } = Settings.getSettings()
    const folderPath = join(rootDirectory, themeDirectory)

    switch (type) {
      case "templateHelpers":
        const commonTemplateHelpers = require(
          join(__dirname, 'common', 'template-helpers.js')
        )
        let themeTemplateHelpers = {}
        try {
          themeTemplateHelpers = require(
            join(
              __dirname, '..', '..', 'packages', `theme-${theme}`, 'template-helpers.js'
            )
          )
        } catch {}
        const customTemplateHelpers = require(
          join(folderPath, 'templates', 'template-helpers.js')
        )
        return {
          ...value,
          ...commonTemplateHelpers,
          ...themeTemplateHelpers,
          ...customTemplateHelpers
        }

      case "templatePartials":
        return [
          ...value,
          join(folderPath, 'templates')
        ]

      case "assets":
        return [
          ...value,
          {
            src: join(folderPath, 'assets'),
            dest: ''
          }
        ]
    }
    return value
  }
}
