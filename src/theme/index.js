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
    const folderPath = join(rootDirectory, themeDirectory)
    this.customizers = []
    try {
      await stat(folderPath)
      Debug.debugLog(`${folderPath} exists`)
      this.customizers.push(...(await this.checkCustomizers(folderPath)))
      return
    } catch (e) {
      Debug.debugLog(`${folderPath} not found`)
    }
    await this.makeThemeDirectory(folderPath)
    Debug.timeEnd('theme')
  },

  async checkCustomizers(folderPath) {
    const paths = await readdir(folderPath)
    return paths.filter(p => p.endsWith('.css') || p.endsWith('.js'))
  },

  makeThemeDirectorySubFolders(folderPath) {
    return Promise.all([
      mkdir(join(folderPath, ASSETS)),
      mkdir(join(folderPath, TEMPLATES))
    ])
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

  copySelectedThemeResources(folderPath) {
    const { theme } = Settings.getSettings()
    const themeSrcPath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)
    return Promise.all([
      cp(
        join(themeSrcPath, ASSETS),
        join(folderPath, ASSETS, theme),
        { recursive: true }
      ),
      cp(
        join(themeSrcPath, PARTIALS),
        join(folderPath, TEMPLATES),
        { recursive: true }
      ),
      cp(
        join(themeSrcPath, THEME_SETTINGS),
        join(folderPath, THEME_SETTINGS)
      )
    ]).then(() => {
      this.customizers.push(THEME_SETTINGS)
    }).catch(e => {
      Debug.debugLog(`⚠️  error copying theme resources: ${theme}`, e)
    })
  },

  async copyCustomizers(folderPath) {
    const paths = await readdir(join(__dirname, 'customizers'))
    const customizers = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    this.customizers.push(...customizers)
    return Promise.all(
      paths.map(path => {
        return cp(
          join(__dirname, 'customizers', path),
          join(folderPath, path)
        )
      })
    )
  },

  async makeThemeDirectory(folderPath) {
    await mkdir(folderPath)

    await this.makeThemeDirectorySubFolders(folderPath)

    await Promise.all([
      this.copyCommonResources(folderPath),
      this.copySelectedThemeResources(folderPath),
      this.copyCustomizers(folderPath)
    ])
  },

  use(type, value) {
    const { rootDirectory, theme, themeDirectory } = Settings.getSettings()
    const folderPath = join(rootDirectory, themeDirectory)
    const themePath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)

    switch (type) {
      case "templateHelpers":
        const commonTemplateHelpers = require(
          join(__dirname, 'common', TEMPLATE_HELPERS)
        )

        let themeTemplateHelpers = {}
        try {
          themeTemplateHelpers = require(join(themePath, TEMPLATE_HELPERS))
        } catch {}

        let customTemplateHelpers = {}
        try {
          customTemplateHelpers = require(
            join(folderPath, TEMPLATES, TEMPLATE_HELPERS)
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
          join(themePath, PARTIALS),
          join(folderPath, TEMPLATES)
        ]

      case "assets":
        return [
          ...value,
          {
            src: join(folderPath, ASSETS),
            dest: ''
          },
          ...this.customizers.map(path => ({
            src: join(folderPath, path),
            dest: 'custom',
            single: true
          }))
        ]
    }
    return value
  }
}
