const { tmpdir } = require('os')
const { join } = require('path')
const { readdir, mkdir, rm, writeFile, readFile } = require('fs/promises')
const test = require('tape')
const writ = require('..')

test('Theme', t => {

  t.test('Deleting theme folder will result in a fresh theme folder', async t => {
    t.plan(8)

    const testDir = join(tmpdir(), 'theme-deleted')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory
      })

      await rm(join(testDir, themeDirectory), { recursive: true })

      await writ.build({
        rootDirectory
      })

      const [
        rootDirectoryContents,
        exportDirectoryContents,
        themeDirectoryContents
      ] = await Promise.all([
        readdir(rootDirectory),
        readdir(join(rootDirectory, exportDirectory)),
        readdir(join(rootDirectory, themeDirectory))
      ])

      t.ok(
        rootDirectoryContents.includes(exportDirectory),
        'Export directory is created'
      )

      t.ok(
        exportDirectoryContents.includes('index.html'),
        'Export directory has index.html'
      )

      t.ok(
        exportDirectoryContents.includes('assets'),
        'Export directory has assets'
      )

      t.ok(
        rootDirectoryContents.includes(themeDirectory),
        'Theme directory is re-created'
      )

      t.ok(
        themeDirectoryContents.includes('templates'),
        'Theme directory has templates'
      )

      t.ok(
        themeDirectoryContents.includes('assets'),
        'Theme directory has assets'
      )

      t.ok(
        themeDirectoryContents.includes('style.css'),
        'Theme directory has style.css'
      )

      t.ok(
        themeDirectoryContents.includes('script.js'),
        'Theme directory has script.js'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('Deleting theme/assets will not re-create theme/assets folder', async t => {
    t.plan(8)

    const testDir = join(tmpdir(), 'theme-assets-deleted')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const themeDirectory = 'theme'
    const themeAssetsDirectory = 'assets'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory
      })

      await rm(join(testDir, themeDirectory, themeAssetsDirectory), { recursive: true })

      await writ.build({
        rootDirectory
      })

      const [
        rootDirectoryContents,
        exportDirectoryContents,
        themeDirectoryContents
      ] = await Promise.all([
        readdir(rootDirectory),
        readdir(join(rootDirectory, exportDirectory)),
        readdir(join(rootDirectory, themeDirectory))
      ])

      t.ok(
        rootDirectoryContents.includes(exportDirectory),
        'Export directory is created'
      )

      t.ok(
        exportDirectoryContents.includes('index.html'),
        'Export directory has index.html'
      )

      t.ok(
        exportDirectoryContents.includes('assets'),
        'Export directory has assets'
      )

      t.ok(
        rootDirectoryContents.includes(themeDirectory),
        'Theme directory is re-created'
      )

      t.ok(
        themeDirectoryContents.includes('templates'),
        'Theme directory has templates'
      )

      t.false(
        themeDirectoryContents.includes('assets'),
        'Theme directory no longer has assets directory'
      )

      t.ok(
        themeDirectoryContents.includes('style.css'),
        'Theme directory has style.css'
      )

      t.ok(
        themeDirectoryContents.includes('script.js'),
        'Theme directory has script.js'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('Deleting theme/templates means they are gone. No refreshing it.', async t => {
    t.plan(8)

    const testDir = join(tmpdir(), 'theme-templates-deleted')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const themeDirectory = 'theme'
    const themeTemplatesDirectory = 'templates'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const { themeDirectory } = writ.getDefaultSettings()
      await rm(join(testDir, themeDirectory, themeTemplatesDirectory), { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const [
        rootDirectoryContents,
        exportDirectoryContents,
        themeDirectoryContents
      ] = await Promise.all([
        readdir(rootDirectory),
        readdir(join(rootDirectory, exportDirectory)),
        readdir(join(rootDirectory, themeDirectory))
      ])

      t.ok(
        rootDirectoryContents.includes(exportDirectory),
        'Export directory is created'
      )

      t.ok(
        exportDirectoryContents.includes('index.html'),
        'Export directory has index.html'
      )

      t.ok(
        exportDirectoryContents.includes('assets'),
        'Export directory has assets'
      )

      t.ok(
        rootDirectoryContents.includes(themeDirectory),
        'Theme directory is re-created'
      )

      t.false(
        themeDirectoryContents.includes('templates'),
        'Theme directory no longer has templates'
      )

      t.ok(
        themeDirectoryContents.includes('assets'),
        'Theme directory has assets directory'
      )

      t.ok(
        themeDirectoryContents.includes('style.css'),
        'Theme directory has style.css'
      )

      t.ok(
        themeDirectoryContents.includes('script.js'),
        'Theme directory has script.js'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('"refreshTheme: true" will recreate theme folder', async t => {
    t.plan(1)

    const testDir = join(tmpdir(), 'theme-refresh')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const myFile = 'my-file.js'
      await writeFile(join(testDir, themeDirectory, myFile), '')

      await writ.build({
        rootDirectory: testDir,
        refreshTheme: true
      })

      const themeDirectoryContents = await readdir(join(rootDirectory, themeDirectory))

      t.false(
        themeDirectoryContents.includes(myFile),
        'theme directory is refreshed and myFile is deleted like everything else'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('theme/keep will protect things against "refreshTheme: true"', async t => {
    t.plan(3)

    const testDir = join(tmpdir(), 'theme-keep')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const deletedFileName = 'deleted.css'
      await writeFile(join(testDir, themeDirectory, deletedFileName), '')

      const keptFileName = 'kept.css'
      await mkdir(join(testDir, themeDirectory, 'keep'))
      await writeFile(join(testDir, themeDirectory, 'keep', keptFileName), '')

      await writ.build({
        rootDirectory: testDir,
        refreshTheme: true
      })

      const themeDirectoryContents = await readdir(join(rootDirectory, themeDirectory))
      const themeKeepDirectoryContents = await readdir(join(rootDirectory, themeDirectory, 'keep'))

      t.false(
        themeDirectoryContents.includes(deletedFileName),
        'theme directory is refreshed'
      )

      t.ok(
        themeDirectoryContents.includes('keep'),
        'theme directory is refreshed'
      )

      t.ok(
        themeKeepDirectoryContents.includes(keptFileName),
        'theme/keep/file is preserved'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('theme/keep will recursively override custom theme paths', async t => {
    t.plan(3)

    const testDir = join(tmpdir(), 'theme-keep-override')
    const rootDirectory = testDir
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const themePath = join(testDir, themeDirectory)
      const keepPath = join(themePath, 'keep')
      const assetsPath = join(themePath, 'assets')

      // Count files in assets before override
      const assetsContentsBefore = await readdir(
        assetsPath,
        { recursive: true, withFileTypes: true }
      )
      const fileCountBefore = assetsContentsBefore.filter(
        e => !e.isDirectory()
      ).length

      // Create one customized file in keep
      await mkdir(join(keepPath, 'assets'), { recursive: true })
      await writeFile(
        join(keepPath, 'assets', 'custom.css'),
        'customized styles'
      )

      await writ.build({
        rootDirectory: testDir,
        refreshTheme: true
      })

      const assetsContentsAfter = await readdir(
        assetsPath,
        { recursive: true, withFileTypes: true }
      )
      const fileCountAfter = assetsContentsAfter.filter(
        e => !e.isDirectory()
      ).length

      const customCssContent = await readFile(
        join(assetsPath, 'custom.css'),
        'utf-8'
      )

      t.equal(
        customCssContent,
        'customized styles',
        'custom file from keep is applied'
      )

      t.ok(
        fileCountAfter > 1,
        'assets folder contains multiple files'
      )

      t.equal(
        fileCountAfter,
        fileCountBefore + 1,
        'assets folder has original files plus the new one (not replaced)'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('theme/keep respects deep nesting without replacing parent folders', async t => {
    t.plan(2)

    const testDir = join(tmpdir(), 'theme-keep-deep-nesting')
    const rootDirectory = testDir
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const themePath = join(testDir, themeDirectory)
      const keepPath = join(themePath, 'keep')

      // Create deeply nested file in keep
      const deepPath = join(keepPath, 'deep', 'nested', 'folder', 'structure')
      await mkdir(deepPath, { recursive: true })
      await writeFile(
        join(deepPath, 'custom.txt'),
        'deeply nested content'
      )

      await writ.build({
        rootDirectory: testDir,
        refreshTheme: true
      })

      const deepThemePath = join(
        themePath,
        'deep',
        'nested',
        'folder',
        'structure'
      )
      const deepContent = await readFile(
        join(deepThemePath, 'custom.txt'),
        'utf-8'
      )

      t.equal(
        deepContent,
        'deeply nested content',
        'deeply nested file from keep is applied'
      )

      const deepFolderContents = await readdir(deepThemePath)
      t.equal(
        deepFolderContents.length,
        1,
        'deep folder only contains the custom file (no existing files to preserve)'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('when keep has a file where theme has a directory with the same name', async t => {
    t.plan(1)

    const testDir = join(tmpdir(), 'theme-keep-file-dir-collision')
    const rootDirectory = testDir
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

      await writ.build({
        rootDirectory: testDir
      })

      const themePath = join(testDir, themeDirectory)
      const keepPath = join(themePath, 'keep')

      // Create a file in keep where theme likely has a directory
      // (assets exists in theme and has subdirectories)
      await mkdir(keepPath, { recursive: true })
      await writeFile(
        join(keepPath, 'assets'),
        'file content'
      )

      try {
        await writ.build({
          rootDirectory: testDir,
          refreshTheme: true
        })
        t.fail('should have thrown an error when file collides with directory')
      } catch (e) {
        t.ok(
          e,
          'error is thrown when file in keep tries to overwrite directory in theme'
        )
      }
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
