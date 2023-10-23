const { rm, mkdir, readdir, writeFile } = require('fs/promises')
const { join, resolve } = require('path')
const test = require('tape')
const writ = require('..')

const randomNumber = () => {
  return String(Date.now() * Math.random()).split('.')[0]
}

const createTempDir = async () => {
  const dirName = resolve(join('/tmp', 'test-dir-' + randomNumber()))
  await mkdir(dirName)
  return {
    name: dirName,
    mkFile: (name, content) => writeFile(join(dirName, name), content),
    rm: () => rm(dirName, { recursive: true })
  }
}

test('builds in empty directory', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)

  const { exportDirectory, assetsDirectory } = writ.getDefaultSettings()
  await writ.build({
    rootDirectory: dir.name
  })

  const dirContents = await readdir(dir.name)
  t.true(
    dirContents.includes(exportDirectory),
    'Creates exportDirectory'
  )

  const exportDirectoryContents = await readdir(join(dir.name, exportDirectory))
  t.true(
    exportDirectoryContents.includes('index.html'),
    'Export directory has index.html'
  )
  t.true(
    exportDirectoryContents.includes(assetsDirectory),
    'Export directory has assets directory'
  )

  const assetsDirectoryContents = await readdir(join(dir.name, exportDirectory, assetsDirectory))
  t.true(
    assetsDirectoryContents.includes('common'),
    'Assets directory has common assets'
  )
  t.true(
    assetsDirectoryContents.includes('default'),
    'Assets directory has theme-default assets'
  )
})

test('builds with a single txt file', async t => {
  const dir = await createTempDir()
  t.teardown(dir.rm)
  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  const { exportDirectory, assetsDirectory } = writ.getDefaultSettings()
  await writ.build({
    rootDirectory: dir.name
  })

  const dirContents = await readdir(dir.name)
  t.true(
    dirContents.includes(fileNameIn),
    `${fileNameIn} exists`
  )
  t.true(
    dirContents.includes(exportDirectory),
    'Creates exportDirectory'
  )

  const exportDirectoryContents = await readdir(join(dir.name, exportDirectory))
  t.true(
    exportDirectoryContents.includes(fileNameOut),
    `Export directory has compiled ${fileNameOut}`
  )
  t.true(
    exportDirectoryContents.includes(assetsDirectory),
    'Export directory has assets directory'
  )

  const assetsDirectoryContents = await readdir(join(dir.name, exportDirectory, assetsDirectory))
  t.true(
    assetsDirectoryContents.includes('common'),
    'Assets directory has common assets'
  )
  t.true(
    assetsDirectoryContents.includes('default'),
    'Assets directory has theme-default assets'
  )
})
