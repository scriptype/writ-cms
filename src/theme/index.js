const { stat, mkdir, cp, readdir } = require('fs/promises')
const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')

const ASSETS = 'assets'
const PARTIALS = 'partials'
const TEMPLATES = 'templates'
const TEMPLATE_HELPERS = 'template-helpers.js'
const THEME_SETTINGS = 'theme-settings.css'

module.exports = {
  async init() {
    Debug.timeStart('theme')
    const { rootDirectory, themeDirectory } = Settings.getSettings()
    const customThemePath = join(rootDirectory, themeDirectory)
    this.customizers = []
    try {
      await stat(customThemePath)
      Debug.debugLog(`${customThemePath} exists`)
      this.customizers.push(...(await this.getCustomizers(customThemePath)))
      return
    } catch (e) {
      Debug.debugLog(`${customThemePath} not found`)
    }
    await this.makeCustomThemeDirectory(customThemePath)
    Debug.timeEnd('theme')
  },

  async getCustomizers(customThemePath) {
    const paths = await readdir(customThemePath)
    return paths.filter(p => p.endsWith('.css') || p.endsWith('.js'))
  },

  copyCommonResources(folderPath) {
    return Promise.all([
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
  },

  copyBaseThemeResources(customThemePath) {
    const { theme } = Settings.getSettings()
    const themeSrcPath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)
    return Promise.all([
      cp(
        join(themeSrcPath, ASSETS),
        join(customThemePath, ASSETS, theme),
        { recursive: true }
      ),
      cp(
        join(themeSrcPath, PARTIALS),
        join(customThemePath, TEMPLATES),
        { recursive: true }
      ),
      cp(
        join(themeSrcPath, THEME_SETTINGS),
        join(customThemePath, THEME_SETTINGS)
      )
    ]).then(() => {
      this.customizers.push(THEME_SETTINGS)
    }).catch(e => {
      Debug.debugLog(`⚠️  error copying theme resources: ${theme}`, e)
    })
  },

  async copyCustomizers(customThemePath) {
    const paths = await readdir(join(__dirname, 'customizers'))
    const customizers = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    this.customizers.push(...customizers)
    return Promise.all(
      paths.map(path => {
        return cp(
          join(__dirname, 'customizers', path),
          join(customThemePath, path)
        )
      })
    )
  },

  async makeCustomThemeDirectory(customThemePath) {
    await mkdir(customThemePath)

    await Promise.all([
      mkdir(join(customThemePath, ASSETS)),
      mkdir(join(customThemePath, TEMPLATES))
    ])

    await this.copyCommonResources(customThemePath)
    await this.copyBaseThemeResources(customThemePath)
    await this.copyCustomizers(customThemePath)
  },

  use(type, value) {
    const { rootDirectory, theme, themeDirectory } = Settings.getSettings()
    const customThemePath = join(rootDirectory, themeDirectory)
    const baseThemePath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)

    switch (type) {
      case "templateHelpers":
        const commonTemplateHelpers = require(
          join(__dirname, 'common', TEMPLATE_HELPERS)
        )

        let themeTemplateHelpers = {}
        try {
          themeTemplateHelpers = require(join(baseThemePath, TEMPLATE_HELPERS))
        } catch {}

        let customTemplateHelpers = {}
        try {
          customTemplateHelpers = require(
            join(customThemePath, TEMPLATES, TEMPLATE_HELPERS)
          )
        } catch {}

        const customizers = this.customizers
        const customizerHelpers = {
          hasCustomStyle() {
            return customizers.includes('style.css')
          },
          hasThemeSettings() {
            return customizers.includes('theme-settings.css')
          },
          hasCustomScript() {
            return customizers.includes('script.js')
          }
        }

        return {
          ...value,
          ...commonTemplateHelpers,
          ...themeTemplateHelpers,
          ...customTemplateHelpers,
          ...customizerHelpers,
        }

      case "templatePartials":
        return [
          ...value,
          join(__dirname, 'common', PARTIALS),
          join(baseThemePath, PARTIALS),
          join(customThemePath, TEMPLATES)
        ]

      case "assets":
        return [
          ...value,
          {
            src: join(customThemePath, ASSETS),
            dest: ''
          },
          ...this.customizers.map(path => ({
            src: join(customThemePath, path),
            dest: 'custom',
            single: true
          }))
        ]
    }
    return value
  }
}
