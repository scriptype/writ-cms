const { rm, mkdtemp, readdir, writeFile } = require('fs/promises')
const { tmpdir } = require('os')
const { join, resolve } = require('path')
const test = require('tape')
const writ = require('..')

const createTempDir = async () => {
  const dirName = await mkdtemp(join(tmpdir(), 'writ-test-'))
  return {
    name: dirName,
    mkFile: (name, content) => writeFile(join(dirName, name), content),
    rm: () => rm(dirName, { recursive: true })
  }
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

const hasPaths = (t, actualPaths, expectedPaths, message) => {
  t.true(
    expectedPaths.every(p => actualPaths.includes(p)),
    message || `${expectedPaths.join(', ')} exist(s)`
  )
}

const hasNotPaths = (t, actualPaths, unexpectedPaths, message) => {
  t.false(
    unexpectedPaths.some(p => actualPaths.includes(p)),
    message || `${unexpectedPaths.join(', ')} do not exist(s)`
  )
}

const expectPaths = (t, actualPaths, expectedPaths) => {
  if (expectedPaths) {
    if (expectedPaths.exists) {
      hasPaths(t, actualPaths, expectedPaths.exists)
    }
    if (expectedPaths.notExists) {
      hasNotPaths(t, actualPaths, expectedPaths.notExists)
    }
  }
}

const common = {
  rootDirectoryContents(t, actualPaths, expectedPaths) {
    hasExportDirectory(t, actualPaths, 'Creates export directory')
    hasThemeDirectory(t, actualPaths, 'Creates theme directory')
    expectPaths(t, actualPaths, expectedPaths)
  },

  exportDirectoryContents(t, actualPaths, expectedPaths) {
    hasAssetsDirectory(t, actualPaths, 'Export directory has assets directory')
    hasPaths(t, actualPaths, ['index.html'], 'Export directory has index.html')
    expectPaths(t, actualPaths, expectedPaths)
  },

  assetsDirectoryContents(t, actualPaths, expectedPaths) {
    hasCommonDirectory(t, actualPaths, 'Assets directory has common assets')
    hasDefaultThemeDirectory(t, actualPaths, 'Assets directory has theme-default assets')
    hasCustomDirectory(t, actualPaths, 'Assets directory has custom assets')
    expectPaths(t, actualPaths, expectedPaths)
  },

  themeDirectoryContents(t, actualPaths, expectedPaths) {
    hasAssetsDirectory(t, actualPaths, 'Theme directory has assets directory')
    hasTemplatesDirectory(t, actualPaths, 'Theme directory has templates directory')
    hasPaths(t, actualPaths, ['style.css', 'script.js'], 'Theme directory has style.css and script.js')
    expectPaths(t, actualPaths, expectedPaths)
  },

  async builds(t, rootDirectory, expectedPaths = {}) {
    const { exportDirectory, assetsDirectory, themeDirectory } = writ.getDefaultSettings()
    common.rootDirectoryContents(t, await readdir(rootDirectory), expectedPaths.rootDirectoryPaths)
    common.exportDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory)), expectedPaths.exportDirectoryPaths)
    common.themeDirectoryContents(t, await readdir(join(rootDirectory, themeDirectory)), expectedPaths.themeDirectoryPaths)
    common.assetsDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory, assetsDirectory)), expectedPaths.assetsDirectoryPaths)
  }
}

test('builds in empty directory', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name)
})

test('builds with a single txt file', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [fileNameIn]
    }
  })
})

test('builds after a file is deleted', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      exists: [fileNameOut]
    }
  })

  await rm(join(dir.name, fileNameIn))

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      notExists: [fileNameOut]
    }
  })
})
