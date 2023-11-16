const { rm, mkdtemp, readdir, writeFile } = require('fs/promises')
const { tmpdir } = require('os')
const { join } = require('path')
const test = require('tape')
const writ = require('..')

const createTempDir = () => mkdtemp(join(tmpdir(), 'writ-test'))

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

const hasFiles = (t, paths, files, message) => {
  t.true(files.every(f => paths.includes(f)), message)
}

const common = {
  rootDirectoryContents(t, paths) {
    hasExportDirectory(t, paths, 'Creates export directory')
    hasThemeDirectory(t, paths, 'Creates theme directory')
  },

  exportDirectoryContents(t, paths) {
    hasFiles(t, paths, ['index.html'], 'Export directory has index.html')
    hasAssetsDirectory(t, paths, 'Export directory has assets directory')
  },

  assetsDirectoryContents(t, paths) {
    hasCommonDirectory(t, paths, 'Assets directory has common assets')
    hasDefaultThemeDirectory(t, paths, 'Assets directory has theme-default assets')
    hasCustomDirectory(t, paths, 'Assets directory has custom assets')
  },

  themeDirectoryContents(t, paths) {
    hasAssetsDirectory(t, paths, 'Theme directory has assets directory')
    hasTemplatesDirectory(t, paths, 'Theme directory has templates directory')
    hasFiles(t, paths, ['style.css', 'script.js'], 'Theme directory has style.css and script.js')
  },

  async builds(t, rootDirectory) {
    const { exportDirectory, assetsDirectory, themeDirectory } = writ.getDefaultSettings()
    common.rootDirectoryContents(t, await readdir(rootDirectory))
    common.exportDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory)))
    common.themeDirectoryContents(t, await readdir(join(rootDirectory, themeDirectory)))
    common.assetsDirectoryContents(t, await readdir(join(rootDirectory, exportDirectory, assetsDirectory)))
  }
}

test('builds in empty directory', async t => {
  const dir = await createTempDir()
  t.teardown(() => rm(dir, { recursive: true }))

  await writ.build({
    rootDirectory: dir
  })

  await common.builds(t, dir)
})

test('builds with a single txt file', async t => {
  const dir = await createTempDir()
  t.teardown(() => rm(dir, { recursive: true }))
  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await writeFile(join(dir, fileNameIn), 'Hello!')

  const { exportDirectory, assetsDirectory, themeDirectory } = writ.getDefaultSettings()
  await writ.build({
    rootDirectory: dir
  })

  await common.builds(t, dir)

  const rootDirectoryPaths = await readdir(dir)
  t.true(rootDirectoryPaths.includes(fileNameIn), `${fileNameIn} exists`)
})

test('builds after a file is deleted', async t => {
  const dir = await createTempDir()
  t.teardown(() => rm(dir, { recursive: true }))
  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await writeFile(join(dir, fileNameIn), 'Hello!')

  const { exportDirectory, assetsDirectory } = writ.getDefaultSettings()
  await writ.build({
    rootDirectory: dir
  })

  await common.builds(t, dir)

  const exportDirectoryContentsBefore = await readdir(join(dir, exportDirectory))
  t.true(
    exportDirectoryContentsBefore.includes(fileNameOut),
    `Export directory has compiled ${fileNameOut} before deletion`
  )

  await rm(join(dir, fileNameIn))

  await writ.build({
    rootDirectory: dir
  })

  const exportDirectoryContentsAfter = await readdir(join(dir, exportDirectory))
  t.false(
    exportDirectoryContentsAfter.includes(fileNameOut),
    `Export directory does not have ${fileNameOut} after deletion`
  )
})
