const { tmpdir } = require('os')
const { stat, rm, mkdir, mkdtemp, cp, readdir } = require('fs/promises')
const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')
const createDecorator = require('./decorator')
const {
  ASSETS,
  FEATURES,
  PARTIALS,
  TEMPLATE_HELPERS,
  THEME_SETTINGS,
  KEEP_PATH
} = require('./constants')

const State = {
  customizers: []
}

const Methods = (() => {
  const init = async ({ refresh }) => {
    Debug.timeStart('theme')
    const { rootDirectory, themeDirectory } = Settings.getSettings()
    const customThemePath = join(rootDirectory, themeDirectory)

    if (await customThemeExists(customThemePath)) {
      Debug.debugLog(`${customThemePath} exists`)
      if (refresh) {
        Debug.debugLog('refresh theme')
        await refreshCustomTheme(customThemePath)
      } else {
        await refreshFeatureResources(customThemePath)
        await collectCustomizerPaths(customThemePath)
      }
    } else {
      Debug.debugLog(`${customThemePath} not found`)
      await makeCustomThemeDirectory(customThemePath)
    }
    Debug.timeEnd('theme')
  }

  const customThemeExists = async (customThemePath) => {
    try {
      return await stat(customThemePath)
    } catch {
      return false
    }
  }

  const refreshCustomTheme = async (customThemePath) => {
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
        await makeCustomThemeDirectory(themePath)
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
  }

  const collectCustomizerPaths = async (customThemePath) => {
    const paths = await readdir(customThemePath)
    const customizerPaths = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    State.customizers.push(...customizerPaths)
  }

  const copyCommonResources = (targetPath) => {
    return Promise.all([
      cp(
        join(__dirname, 'common', PARTIALS.from),
        join(targetPath, PARTIALS.to),
        { recursive: true }
      ),
      cp(
        join(__dirname, 'common', TEMPLATE_HELPERS.from),
        join(targetPath, PARTIALS.to, TEMPLATE_HELPERS.to)
      )
    ])
  }

  const refreshFeatureResources = async (targetPath) => {
    const settings = Settings.getSettings()

      const srcAssetsPath = featureDirName => join(__dirname, 'common', FEATURES, featureDirName, ASSETS)
      const targetAssetsPath = featureDirName => join(targetPath, ASSETS, FEATURES, featureDirName)
      const srcPartialsPath = featureDirName => join(__dirname, 'common', FEATURES, featureDirName, PARTIALS.from)
      const targetPartialsPath = featureDirName => join(targetPath, PARTIALS.to, FEATURES, featureDirName)

    const features = [
      ['syntaxHighlighting', 'highlight'],
      ['search', 'search'],
      ['rss', 'rss']
    ]

    const enabledFeatures = features
      .filter(([ settingsKey, dirName ]) => {
        return settings[settingsKey] !== 'off'
      })
      .map(([, dirName]) => dirName)

    const disabledFeatures = features
      .filter(([ settingsKey, dirName ]) => {
        return settings[settingsKey] === 'off'
      })
      .map(([, dirName]) => dirName)

    Debug.debugLog('enabledFeatures', enabledFeatures)
    Debug.debugLog('disabledFeatures', disabledFeatures)

    disabledFeatures.forEach(featureDirName => {
      Debug.debugLog('rm -rf', join(targetPath, FEATURES, featureDirName))
    })

    const copyEnabledFeaturesIfMissing = async () => Promise.all(
      enabledFeatures.map(featureDirName => {
        return Promise.all([
          stat(targetAssetsPath(featureDirName))
            .then(() => Promise.resolve())
            .catch(() => {
              return stat(srcAssetsPath(featureDirName))
                .then(() => cp(
                  srcAssetsPath(featureDirName),
                  targetAssetsPath(featureDirName),
                  { recursive: true })
                )
                .catch(() => Promise.resolve())
            }),
          stat(targetPartialsPath(featureDirName))
            .then(() => Promise.resolve())
            .catch(() => {
              return stat(srcPartialsPath(featureDirName))
                .then(() => cp(
                  srcPartialsPath(featureDirName),
                  targetPartialsPath(featureDirName),
                  { recursive: true })
                )
                .catch(() => Promise.resolve())
            })
        ])
      })
    )

    const deleteDisabledFeaturesIfExisting = async () => Promise.all(
      disabledFeatures.map(async featureDirName => {
        return Promise.all([
          stat(targetAssetsPath(featureDirName))
            .then(() => rm(targetAssetsPath(featureDirName), { recursive: true, force: true }))
            .catch(() => Promise.resolve()),
          stat(targetPartialsPath(featureDirName))
            .then(() => rm(targetPartialsPath(featureDirName), { recursive: true, force: true }))
            .catch(() => Promise.resolve())
        ])
      })
    )

    const deleteEmptyFeaturesDirectories = async () => Promise.all([
      readdir(targetAssetsPath(''))
        .then(directory => {
          if (!directory.length) {
            Debug.debugLog('Deleting empty assets/features directory')
            return rm(targetAssetsPath(''), { recursive: true, force: true })
          }
          return Promise.resolve()
        })
        .catch(() => {
          Debug.debugLog('assets/features directory not found')
          return Promise.resolve()
        }),
      readdir(targetPartialsPath(''))
        .then(directory => {
          if (!directory.length) {
            Debug.debugLog('Deleting empty assets/features directory')
            return rm(targetPartialsPath(''), { recursive: true, force: true })
          }
          return Promise.resolve()
        })
        .catch(() => {
          Debug.debugLog('templates/features directory not found')
          return Promise.resolve()
        })
    ])

    await copyEnabledFeaturesIfMissing()
    await deleteDisabledFeaturesIfExisting()
    return deleteEmptyFeaturesDirectories()
  }

  const copyBaseThemeResources = (customThemePath) => {
    const { theme } = Settings.getSettings()
    const themeSrcPath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)
    return Promise.all([
      cp(
        join(themeSrcPath, ASSETS),
        join(customThemePath, ASSETS, theme),
        { recursive: true }
      ),
      cp(
        join(themeSrcPath, PARTIALS.from),
        join(customThemePath, PARTIALS.to),
        { recursive: true }
      ),
      cp(
        join(themeSrcPath, THEME_SETTINGS),
        join(customThemePath, THEME_SETTINGS)
      )
    ]).then(() => {
      State.customizers.push(THEME_SETTINGS)
    }).catch(e => {
      Debug.debugLog(`⚠️  error copying theme resources: ${theme}`, e)
    })
  }

  const copyCustomizers = async (customThemePath) => {
    const paths = await readdir(join(__dirname, 'customizers'))
    const customizers = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    State.customizers.push(...customizers)
    return Promise.all(
      paths.map(path => {
        return cp(
          join(__dirname, 'customizers', path),
          join(customThemePath, path)
        )
      })
    )
  }

  const makeCustomThemeDirectory = async (customThemePath) => {
    await mkdir(customThemePath)

    await Promise.all([
      mkdir(join(customThemePath, ASSETS)),
      mkdir(join(customThemePath, PARTIALS.to))
    ])

    await copyCommonResources(customThemePath)
    await refreshFeatureResources(customThemePath)
    await copyBaseThemeResources(customThemePath)
    await copyCustomizers(customThemePath)
  }

  return {
    init,
    customThemeExists,
    refreshCustomTheme,
    collectCustomizerPaths,
    copyCommonResources,
    copyBaseThemeResources,
    copyCustomizers,
    makeCustomThemeDirectory
  }
})()

module.exports = {
  ...Methods,
  decorator: createDecorator(State, Methods)
}
