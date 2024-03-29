const { rm, mkdtemp, mkdir, readdir, writeFile } = require('fs/promises')
const { tmpdir } = require('os')
const { join } = require('path')
const writ = require('..')

const createTempDir = async (t) => {
  const dirName = await mkdtemp(join(tmpdir(), 'writ-test-'))
  const methods = {
    name: dirName,
    mkFile: (name, content) => writeFile(join(dirName, name), content),
    mkAsset: (assetsDirectory, name, content) => writeFile(join(dirName, assetsDirectory, name), content),
    mkDir: (name) => mkdir(join(dirName, name), { recursive: true }),
    rm: () => rm(dirName, { recursive: true })
  }
  if (t) {
    t.teardown(methods.rm)
  }
  return methods
}

const hasExportDirectory = (t, paths, message) => {
  const { exportDirectory } = writ.getDefaultSettings()
  t.true(paths.includes(exportDirectory), message)
}

const hasThemeDirectory = (t, paths, message) => {
  const { themeDirectory } = writ.getDefaultSettings()
  t.true(paths.includes(themeDirectory), message)
}

const hasAssetsDirectory = (t, paths, message) => {
  const { assetsDirectory } = writ.getDefaultSettings()
  t.true(paths.includes(assetsDirectory), message)
}

const hasCommonDirectory = (t, paths, message) => {
  t.true(paths.includes('common'), message)
}

const hasDefaultThemeDirectory = (t, paths, message) => {
  t.true(paths.includes('default'), message)
}

const hasCustomDirectory = (t, paths, message) => {
  t.true(paths.includes('custom'), message)
}

const hasTemplatesDirectory = (t, paths, message) => {
  t.true(paths.includes('templates'), message)
}

const hasPaths = (t, actualPaths, expectedPaths, message, messagePrefix) => {
  const prefix = messagePrefix ? (messagePrefix + ' ') : ''
  const postfix = messagePrefix ? '' : ' exist(s)'
  t.true(
    expectedPaths.every(p => actualPaths.includes(p)),
    message || `${prefix}${expectedPaths.join(', ')}${postfix}`
  )
}

const hasNotPaths = (t, actualPaths, unexpectedPaths, message, messagePrefix) => {
  const prefix = messagePrefix ? (messagePrefix + ' ') : ''
  const postfix = messagePrefix ? '' : ' do not exist(s)'
  t.false(
    unexpectedPaths.some(p => actualPaths.includes(p)),
    message || `${prefix}${unexpectedPaths.join(', ')}${postfix}`
  )
}

const expectPaths = (t, actualPaths, expectedPaths, scope) => {
  if (expectedPaths) {
    if (expectedPaths.exists) {
      let prefix = scope ? `${scope} has` : undefined
      hasPaths(t, actualPaths, expectedPaths.exists, '', prefix)
    }
    if (expectedPaths.notExists) {
      let prefix = scope ? `${scope} does not have` : undefined
      hasNotPaths(t, actualPaths, expectedPaths.notExists, '', prefix)
    }
  }
}

const common = {
  rootDirectoryContents(t, actualPaths, expectedPaths) {
    hasExportDirectory(t, actualPaths, 'Creates export directory')
    hasThemeDirectory(t, actualPaths, 'Creates theme directory')
    expectPaths(t, actualPaths, expectedPaths, 'Root directory')
  },

  exportDirectoryContents(t, actualPaths, expectedPaths) {
    hasAssetsDirectory(t, actualPaths, 'Export directory has assets directory')
    hasPaths(t, actualPaths, ['index.html'], 'Export directory has index.html')
    expectPaths(t, actualPaths, expectedPaths, 'Export directory')
  },

  exportAssetsDirectoryContents(t, actualPaths, expectedPaths) {
    if (!expectedPaths) {
      hasDefaultThemeDirectory(t, actualPaths, 'Export/assets directory has theme-default assets')
      hasCustomDirectory(t, actualPaths, 'Export/assets directory has custom assets')
    }
    expectPaths(t, actualPaths, expectedPaths, 'Export/assets directory')
  },

  themeDirectoryContents(t, actualPaths, expectedPaths) {
    if (!expectedPaths) {
      hasAssetsDirectory(t, actualPaths, 'Theme directory has assets directory')
      hasTemplatesDirectory(t, actualPaths, 'Theme directory has templates directory')
      hasPaths(t, actualPaths, ['style.css', 'script.js'], 'Theme directory has style.css and script.js')
    }
    expectPaths(t, actualPaths, expectedPaths, 'Theme directory')
  },

  async builds(t, rootDirectory, expectedPaths = {}) {
    const {
      exportDirectory,
      assetsDirectory,
      themeDirectory
    } = writ.getDefaultSettings()
    const {
      rootDirectoryPaths,
      exportDirectoryPaths,
      assetsDirectoryPaths,
      themeDirectoryPaths
    } = expectedPaths
    common.rootDirectoryContents(t, await readdir(rootDirectory), rootDirectoryPaths)
    common.exportDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory)), exportDirectoryPaths)
    common.exportAssetsDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory, assetsDirectory)), assetsDirectoryPaths)
    common.themeDirectoryContents(t, await readdir(join(rootDirectory, themeDirectory)), themeDirectoryPaths)
  }
}

module.exports = {
  createTempDir,
  common,
  hasPaths,
  hasNotPaths,
  expectPaths,
  hasExportDirectory,
  hasThemeDirectory,
  hasAssetsDirectory,
  hasCommonDirectory,
  hasDefaultThemeDirectory,
  hasCustomDirectory,
  hasTemplatesDirectory
}
