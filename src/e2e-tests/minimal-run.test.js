const { tmpdir } = require('os')
const { join } = require('path')
const { readdir, mkdir, rm, writeFile, readFile } = require('fs/promises')
const test = require('tape')
const writ = require('..')

test('Minimal run', t => {

  t.test('Build in empty directory', async t => {
    t.plan(8)

    const testDir = join(tmpdir(), 'minimal-run-empty-directory')
    const rootDirectory = testDir
    const exportDirectory = 'docs'
    const themeDirectory = 'theme'

    try {
      await mkdir(testDir, { recursive: true })

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
        'Theme directory is created'
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

  t.test('Build with a single txt file', async t => {
    t.plan(2)

    const testDir = join(tmpdir(), 'minimal-run-single-file')
    const rootDirectory = testDir
    const exportDirectory = 'docs'

    try {
      await mkdir(testDir, { recursive: true })
      await writeFile(join(testDir, 'hello.txt'), '# Title\n\nContent here')

      await writ.build({
        rootDirectory: testDir
      })

      const [
        exportDirectoryContents,
        testFileContent
      ] = await Promise.all([
        readdir(join(rootDirectory, exportDirectory)),
        readFile(join(rootDirectory, exportDirectory, 'hello.html'), { encoding: 'utf-8' })
      ])

      t.ok(
        exportDirectoryContents.includes('hello.html'),
        'Text file rendered as HTML'
      )

      t.ok(
        testFileContent.match(/<h1 id="title">Title<\/h1>/) &&
        testFileContent.match(/<p>Content here<\/p>/),
        'Text file is parsed as markdown'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('Rebuild after deleting a file', async t => {
    t.plan(1)

    const testDir = join(tmpdir(), 'minimal-run-deleted-file')
    const rootDirectory = testDir
    const exportDirectory = 'docs'

    try {
      await mkdir(testDir, { recursive: true })
      await writeFile(join(testDir, 'hello.txt'), '# Title\n\nContent here')

      await writ.build({
        rootDirectory: testDir
      })

      await rm(join(testDir, 'hello.txt'))

      await writ.build({
        rootDirectory: testDir
      })

      const exportDirectoryContents = await readdir(join(rootDirectory, exportDirectory))

      t.false(
        exportDirectoryContents.includes('hello.html'),
        'Deleted file wasnt rendered anymore'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

})
