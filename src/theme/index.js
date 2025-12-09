const { tmpdir } = require('os')
const { join } = require('path')
const Debug = require('../debug')
const Settings = require('../settings')
const createDecorator = require('./decorator')
const { atomicReplace, atomicFS } = require('../lib/fileSystemHelpers')
const {
  ASSETS,
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
        await collectCustomizerPaths(customThemePath)
      }
    } else {
      Debug.debugLog(`${customThemePath} not found`)
      await atomicReplace(customThemePath, async (tempPath) => {
        await makeCustomThemeDirectory(tempPath, { skipContainer: true })
      })
    }
    Debug.timeEnd('theme')
  }

  const customThemeExists = async (customThemePath) => {
    try {
      console.log('== customThemeExists ==')
      return await atomicFS.stat(customThemePath)
    } catch {
      return false
    }
  }

  const refreshCustomTheme = async (customThemePath) => {
    const backupKeepDir = async (keepPath) => {
      try {
        console.log('== backupKeepDir 1 ==')
        if (await atomicFS.stat(keepPath)) {
          console.log('== backupKeepDir 2 ==')
          const tempPath = await atomicFS.mkdtemp(
            join(tmpdir(), 'writ-theme-keep')
          )
          Debug.debugLog('refresh theme temp dir', tempPath)
          console.log('== backupKeepDir 3 ==')
          await atomicFS.cp(keepPath, tempPath)
          return tempPath
        }
      } catch {
        Debug.debugLog(`theme/${KEEP_PATH} not found`)
        return null
      }
    }

    const applyKeepOverrides = async (keepBackupPath, themePath) => {
      console.log('== applyKeepOverrides 1==')
      const entries = await atomicFS.readdirRecursive(keepBackupPath)

      await Promise.all(
        entries
          .filter(entry => !entry.isDirectory())
          .map(entry => {
            const relativePath = join(
              entry.parentPath.replace(keepBackupPath, ''),
              entry.name
            )
            console.log('== applyKeepOverrides 2 ==')
            return atomicFS.cp(
              join(keepBackupPath, relativePath),
              join(themePath, relativePath)
            )
          })
      )
    }

    const keepPath = join(customThemePath, KEEP_PATH)
    const keepBackupPath = await backupKeepDir(keepPath)

    try {
      Debug.debugLog('refresh theme atomically')
      // Work on a tempPath, then customThemePath gets swapped with it
      await atomicReplace(customThemePath, async (tempPath) => {

        await makeCustomThemeDirectory(tempPath, {
          skipContainer: true // customThemePath is created by atomicReplace
        })

        if (keepBackupPath) {
          console.log('== refreshCustomTheme 1 ==')
          await atomicFS.mkdir(join(tempPath, KEEP_PATH))
          console.log('== refreshCustomTheme 2 ==')
          await atomicFS.cp(keepBackupPath, join(tempPath, KEEP_PATH))
          await applyKeepOverrides(keepBackupPath, tempPath)
        }
      })
    } catch (e) {
      console.log(`Failed refreshing ${customThemePath}`)
      throw e
    } finally {
      if (keepBackupPath) {
        console.log('== refreshCustomTheme 3 ==')
        await atomicFS.rm(keepBackupPath)
      }
    }
  }

  const collectCustomizerPaths = async (customThemePath) => {
    console.log('== collectCustomizerPaths ==')
    const paths = await atomicFS.readdir(customThemePath)
    const customizerPaths = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    State.customizers.push(...customizerPaths)
  }

  const copyCommonResources = (targetPath) => {
    return Promise.all([
      (
        console.log('== copyCommonResources 1 =='),
        atomicFS.cp(
          join(__dirname, 'common', PARTIALS.from),
          join(targetPath, PARTIALS.to)
        )
      ),
      (
        console.log('== copyCommonResources 2 =='),
        atomicFS.cp(
          join(__dirname, 'common', TEMPLATE_HELPERS.from),
          join(targetPath, PARTIALS.to, TEMPLATE_HELPERS.to)
        )
      )
    ])
  }

  const copyBaseThemeResources = (customThemePath) => {
    const { theme } = Settings.getSettings()
    const themeSrcPath = join(__dirname, '..', '..', 'packages', `theme-${theme}`)
    return Promise.all([
      (
        console.log('== copyBaseThemeResources 1 =='),
        atomicFS.cp(
          join(themeSrcPath, ASSETS),
          join(customThemePath, ASSETS, theme)
        )
      ),
      (
        console.log('== copyBaseThemeResources 2 =='),
        atomicFS.cp(
          join(themeSrcPath, PARTIALS.from),
          join(customThemePath, PARTIALS.to)
        )
      ),
      (
        console.log('== copyBaseThemeResources 3 =='),
        atomicFS.cp(
          join(themeSrcPath, THEME_SETTINGS),
          join(customThemePath, THEME_SETTINGS)
        )
      )
    ]).then(() => {
      State.customizers.push(THEME_SETTINGS)
    }).catch(e => {
      Debug.debugLog(`⚠️  error copying theme resources: ${theme}`, e)
    })
  }

  const copyCustomizers = async (customThemePath) => {
    console.log('== copyCustomizers 1 ==')
    const paths = await atomicFS.readdir(join(__dirname, 'customizers'))
    const customizers = paths.filter(p => {
      return p.endsWith('.css') || p.endsWith('.js')
    })
    State.customizers.push(...customizers)
    return Promise.all(
      paths.map(path => {
        console.log('== copyCustomizers 2 ==')
        return atomicFS.cp(
          join(__dirname, 'customizers', path),
          join(customThemePath, path)
        )
      })
    )
  }

  const makeCustomThemeDirectory = async (customThemePath, options = {}) => {
    if (!options.skipContainer) {
      console.log('== makeCustomThemeDirectory 1 ==')
      await atomicFS.mkdir(customThemePath)
    }

    await Promise.all([
      (
        console.log('== makeCustomThemeDirectory 2 =='),
        atomicFS.mkdir(join(customThemePath, ASSETS))
      ),
      (
        console.log('== makeCustomThemeDirectory 3 =='),
        atomicFS.mkdir(join(customThemePath, PARTIALS.to))
      )
    ])

    await copyCommonResources(customThemePath)
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
