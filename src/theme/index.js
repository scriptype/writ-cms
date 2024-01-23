const { tmpdir } = require('os')
const { stat, rm, mkdir, mkdtemp, cp, readdir } = require('fs/promises')
const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')

const ASSETS = 'assets'
const FEATURES = 'features'
const TEMPLATES = 'templates'
const TEMPLATE_HELPERS = 'template-helpers.js'
const THEME_SETTINGS = 'theme-settings.css'
const KEEP_PATH = 'keep'

module.exports = {
  async init({ refresh }) {
    Debug.timeStart('theme')
    const { rootDirectory, themeDirectory } = Settings.getSettings()
    const customThemePath = join(rootDirectory, themeDirectory)
    this.customizers = []

    if (await this.customThemeExists(customThemePath)) {
      Debug.debugLog(`${customThemePath} exists`)
      if (refresh) {
        Debug.debugLog('refresh theme')
        await this.refreshCustomTheme(customThemePath)
      } else {
        await this.collectCustomizerPaths(customThemePath)
      }
    } else {
      Debug.debugLog(`${customThemePath} not found`)
      await this.makeCustomThemeDirectory(customThemePath)
    }
    Debug.timeEnd('theme')
  },

  async customThemeExists(customThemePath) {
    try {
      return await stat(customThemePath)
    } catch {
      return false
    }
  },

  async refreshCustomTheme(customThemePath) {
    const backupKeepDir = async (keepPath) => {
      try {
        if (await stat(keepPath)) {
          const tempPath = await mkdtemp(join(tmpdir(), 'writ-theme-keep'))
          Debug.debugLog('refresh theme temp dir', tempPath)
          await cp(keepPath, tempPath, { recursive: true })
          return tempPath
        }
      } catch {
        Debug.debugLog(`theme/${KEEP_PATH} not found`)
        return null
      }
    }

    const refreshThemeDir = async (themePath, keepBackupPath, keepPath) => {
      try {
        Debug.debugLog('rm -r', themePath)
        await rm(themePath, { recursive: true })
        await this.makeCustomThemeDirectory(themePath)
        if (keepBackupPath) {
          await cp(keepBackupPath, keepPath, { recursive: true })
        }
      } catch (e) {
        console.log(`Failed refreshing ${customThemePath}`)
        throw e
      }
    }

    const keepPath = join(customThemePath, KEEP_PATH)
    const tempPath = await backupKeepDir(keepPath)
    return refreshThemeDir(customThemePath, tempPath, keepPath)
  },

  async collectCustomizerPaths(customThemePath) {
    const paths = await readdir(customThemePath)
    const customizerPaths = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    this.customizers.push(...customizerPaths)
  },

  copyCommonResources(targetPath) {
    return Promise.all([
      cp(
        join(__dirname, 'common', FEATURES),
        join(targetPath, FEATURES),
        { recursive: true }
      ),
      cp(
        join(__dirname, 'common', TEMPLATES),
        join(targetPath, TEMPLATES),
        { recursive: true }
      ),
      cp(
        join(__dirname, 'common', TEMPLATE_HELPERS),
        join(targetPath, TEMPLATES, TEMPLATE_HELPERS)
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
        join(themeSrcPath, TEMPLATES),
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
    const { rootDirectory, theme, themeDirectory, ...restSettings } = Settings.getSettings()
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
          join(__dirname, 'common', TEMPLATES),
          join(baseThemePath, TEMPLATES),
          join(customThemePath, TEMPLATES)
        ]

      case "assets":
        const features = [
          ['syntaxHighlighting', 'highlight'],
          ['search', 'search']
        ]

        const enabledFeatures = features
          .filter(([ settingsKey, dirName ]) => {
            return restSettings[settingsKey] !== 'off'
          })
          .map(([, dirName]) => dirName)

        return [
          ...value,
          {
            src: join(customThemePath, ASSETS),
            dest: ''
          },
          ...enabledFeatures.map(featureDirName => ({
            src: join(customThemePath, FEATURES, featureDirName),
            dest: join('common', featureDirName)
          })),
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
