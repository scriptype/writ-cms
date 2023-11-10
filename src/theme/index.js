const { stat, mkdir, cp } = require('fs/promises')
const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')

const ASSETS = 'assets'
const PARTIALS = 'partials'
const TEMPLATES = 'templates'
const TEMPLATE_HELPERS = 'template-helpers.js'

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
        join(__dirname, 'common', TEMPLATE_HELPERS),
        join(folderPath, TEMPLATES, TEMPLATE_HELPERS)
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
          join(__dirname, 'common', TEMPLATE_HELPERS)
        )
        let themeTemplateHelpers = {}
        try {
          themeTemplateHelpers = require(
            join(
              __dirname, '..', '..', 'packages', `theme-${theme}`, TEMPLATE_HELPERS
            )
          )
        } catch {}
        const customTemplateHelpers = require(
          join(folderPath, TEMPLATES, TEMPLATE_HELPERS)
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
          join(folderPath, TEMPLATES)
        ]

      case "assets":
        return [
          ...value,
          {
            src: join(folderPath, ASSETS),
            dest: ''
          }
        ]
    }
    return value
  }
}
